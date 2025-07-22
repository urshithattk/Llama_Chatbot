const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');

dotenv.config();
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

let pdfText = "";

// ✅ Upload PDF
app.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const pdfBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(pdfBuffer);

        console.log('---- PDF Extraction Preview ----');
        console.log(data.text.slice(0, 500));
        console.log('--------------------------------');

        pdfText = data.text;
        fs.unlinkSync(req.file.path);

        if (!pdfText || pdfText.trim().length === 0) {
            console.log('❗ PDF text extraction returned empty.');
            return res.status(400).json({ error: "No readable text found in PDF." });
        }

        res.json({ message: "✅ PDF uploaded and processed successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "❌ Failed to parse PDF." });
    }
});

// ✅ Clear PDF
app.post('/clear-pdf', (req, res) => {
    pdfText = "";
    res.json({ message: "🧹 PDF cleared. You're now in general chat mode." });
});

// ✅ Chat Route
app.post('/chat', async (req, res) => {
    const history = req.body.history;
    const userMessage = req.body.message;
    const pdfLoadedClient = req.body.pdfLoaded;
    const apiKey = process.env.GROQ_API_KEY;

    console.log('Received PDF loaded flag from frontend:', pdfLoadedClient);
    console.log('PDF text available:', pdfText && pdfText.length > 0);

    const isPDFLoaded = pdfLoadedClient && pdfText && pdfText.trim().length > 0;
    const systemPrompt = isPDFLoaded
        ? "You are a helpful assistant. Answer using ONLY the uploaded PDF content. Be precise."
        : "You are a helpful assistant. Answer any general question.";

    const messages = [{ role: "system", content: systemPrompt }];

    if (isPDFLoaded) {
        messages.push({
            role: "user",
            content: `Here is the PDF content:\n${pdfText.slice(0, 12000)}`
        });
    }

    if (history && Array.isArray(history)) {
        history.forEach(msg => {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        });
    }

    messages.push({ role: "user", content: userMessage });

    try {
        const response = await axios.post(
            'https://api.groq.com/openai/v1/chat/completions',
            {
                model: "llama3-70b-8192",
                messages
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const reply = response.data.choices[0].message.content;
        res.json({ reply });
    } catch (err) {
        console.error("❌ Groq API Error:", err.response?.data || err.message);
        res.status(500).json({ error: "Failed to get response from LLaMA 3" });
    }
});

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
