const { BlobServiceClient } = require("@azure/storage-blob");
const { DocumentAnalysisClient, AzureKeyCredential } = require("@azure/ai-form-recognizer");

// helper to read a node stream into a Buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on("data", (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on("end", () => resolve(Buffer.concat(chunks)));
    readableStream.on("error", reject);
  });
}

module.exports = async function (context, req) {
  context.log("🏷️ ExtractQuestions_v1 fired", { method: req.method });

  // pull settings from env
  const endpoint         = process.env.FORM_RECOGNIZER_ENDPOINT;
  const apiKey           = process.env.FORM_RECOGNIZER_KEY;
  const modelId          = process.env.CUSTOM_FORM_MODEL_ID;
  const connectionString = process.env.AzureWebJobsStorage;
  const containerName    = process.env.BLOB_CONTAINER_NAME;

  if (!connectionString || !containerName) {
    context.res = { status: 500, body: "Missing AzureWebJobsStorage or BLOB_CONTAINER_NAME" };
    return;
  }

  // create clients
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient   = blobServiceClient.getContainerClient(containerName);
  const analysisClient    = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

  const allResults = [];

  // list everything in the container
  for await (const blob of containerClient.listBlobsFlat()) {
    const name = blob.name;

    // only PDF files
    if (!name.toLowerCase().endsWith(".pdf")) {
      context.log(`⏭️ Skipping non‐PDF: ${name}`);
      continue;
    }

    context.log(`🔍 Processing ${name}`);
    try {
      // download file
      const download = await containerClient.getBlobClient(name).download();
      const buffer   = await streamToBuffer(download.readableStreamBody);

      // run your custom model
      const poller = await analysisClient.beginAnalyzeDocument(
        modelId,
        buffer,
        {
          contentType: "application/pdf",
          onProgress: (state) => context.log(`   • ${name}: ${state.status}`)
        }
      );
      const result = await poller.pollUntilDone();

      // pull out the named fields
      const questions = [];
      if (result.documents && result.documents.length) {
        for (const doc of result.documents) {
          for (const [fieldName, field] of Object.entries(doc.fields)) {
            questions.push({
              id:    fieldName,
              text:  (field.value || field.content || "").trim(),
              score: field.confidence
            });
          }
        }
      }

      allResults.push({ file: name, questions });
    } catch (err) {
      context.log.error(`❌ Error on ${name}`, err);
      allResults.push({ file: name, error: err.message });
    }
  }

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: allResults
  };
};
