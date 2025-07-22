🦙 Llama Chatbot
A simple chatbot powered by Groq LLaMA 3 API that can also read uploaded PDF files and answer user queries from them.
Includes features like voice input, PDF upload, chat history, and a clean UI.

🔧 Project Structure

llama_Chatbot/
├── public/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── [assets like icons, images]
├── server.js
├── package.json
└── README.md

🚀 How to Run Locally
Step-1:
git clone https://github.com/urshithattk/llama_Chatbot.git
cd llama_Chatbot

Step-2:
npm install

Step-3:
GROQ_API_KEY=your_actual_groq_api_key_here

Step-4:
node server.js
The app will be live at: http://localhost:3000

🌐 Project Features
✅ Modern chatbot UI
✅ Voice input support
✅ PDF upload for document-based questions
✅ Chat history stored in browser
✅ Sidebar with hamburger toggle and chat management
✅ Dynamic text input resizing
✅ Supports Groq's LLaMA 3 API
✅ Easy to extend or style

🛠️ Tech Stack
1.Frontend: HTML, CSS, Vanilla JS
2.Backend: Node.js (Express.js)
3.APIs: Groq LLaMA 3
4.PDF Parsing: pdf-parse

💡 To Do / Future Ideas
1.Add database for user-based chat history
2.Add authentication for user accounts
3.Export chat as PDF
4.More sophisticated PDF parsing (tables/images)
