# Math Worksheet Extractor

This project extracts structured math questions from worksheet PDFs using **Azure AI Form Recognizer** and an **Azure Function App** written in **JavaScript (Node.js)**.

## 🔍 Project Overview

The `math-worksheet-extractor` is an Azure Function that:
- Accepts PDF files (math worksheets)
- Uses Azure Form Recognizer to extract questions and layout structure
- Outputs structured data (e.g., question text, scores) in JSON format

This can be extended to support LaTeX rendering, chatbot integration, or educational tools.

## 🛠️ Technologies Used

- **Azure AI Form Recognizer**
- **Azure Functions (Node.js)**
- **JavaScript / Node.js**
- **VS Code for development**
- **GitHub for source control**

## 📂 Project Structure

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tjtemrink/math-worksheet-extractor.git
   cd math-worksheet-extractor

## 📂 Project Structure
math-worksheet-extractor/
├── ExtractQuestions_v1/
│ ├── function.json # Azure Function HTTP trigger config
│ └── index.js # Main logic for question extraction
├── host.json # Azure Functions host configuration
├── package.json # Project metadata and dependencies
├── .gitignore # Files/folders to ignore in Git
└── README.md # This documentation

---

#### 2. **Add Final Author Credit** (optional but professional):

```markdown
---

### 🙋‍♂️ Author

Created by **Tejaswai Sharma**  
[GitHub: @tjtemrink](https://github.com/tjtemrink) | Co-founder of [Temrink](https://www.temrink.com)
