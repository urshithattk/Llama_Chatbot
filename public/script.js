const micBtn = document.getElementById('micBtn');
const tickBtn = document.getElementById('tickBtn');

let recognition;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    recognition.onresult = function (event) {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    };

    recognition.onerror = function (e) {
        alert('🎤 Speech recognition error: ' + e.error);
    };
}

micBtn.addEventListener('click', () => {
    if (recognition) {
        recognition.start();
        micBtn.style.display = 'none';
        tickBtn.style.display = 'inline';
    }
});

tickBtn.addEventListener('click', () => {
    if (recognition) {
        recognition.stop();
        micBtn.style.display = 'inline';
        tickBtn.style.display = 'none';
    }
});

const input = document.getElementById('input');
const chat = document.getElementById('chat');
const sendBtn = document.getElementById('sendBtn');
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
const chatContainer = document.querySelector('.chat-container');
const inputOuter = document.querySelector('.input-outer');
const fileInput = document.getElementById('pdf-upload');
const pdfBubbleContainer = document.getElementById('pdfBubbleContainer');

window.onload = () => {
    const saved = localStorage.getItem('currentChat');
    if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach(msg => {
            const div = document.createElement('div');
            div.className = msg.role === 'user' ? 'user-bubble' : 'bot-message';
            div.innerHTML = formatText(msg.content);
            div.style.textAlign = 'justify';
            chat.appendChild(div);
        });
    }
};

function formatText(text) {
    return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
}

function getChatHistory() {
    return Array.from(chat.children).map(div => ({
        role: div.classList.contains('user-bubble') ? 'user' : 'bot',
        content: div.innerText
    }));
}

function saveChatToStorage() {
    const messages = Array.from(chat.children).map(div => ({
        role: div.classList.contains('user-bubble') ? 'user' : 'bot',
        content: div.innerHTML
    }));
    localStorage.setItem('currentChat', JSON.stringify(messages));
}

input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
});

function addUserMessage(text) {
    if (!text.trim()) return;

    const bubble = document.createElement('div');
    bubble.className = 'user-bubble';
    bubble.innerHTML = formatText(text);
    bubble.style.textAlign = 'justify';
    chat.appendChild(bubble);
    input.value = '';
    input.style.height = 'auto';
    chat.scrollTop = chat.scrollHeight;

    saveChatToStorage();

fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        message: text,
        history: getChatHistory(),
        pdfLoaded: localStorage.getItem('pdfLoaded') === 'true'
    })
})
        .then(res => res.json())
        .then(data => {
            const msg = document.createElement('div');
            msg.className = 'bot-message';
            msg.innerHTML = formatText(data.reply);
            msg.style.textAlign = 'justify';
            chat.appendChild(msg);
            chat.scrollTop = chat.scrollHeight;
            saveChatToStorage();
        })
        .catch(err => {
            const msg = document.createElement('div');
            msg.className = 'bot-message';
            msg.textContent = 'Error getting response.';
            chat.appendChild(msg);
        });
}

sendBtn.addEventListener('click', () => addUserMessage(input.value));

input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        addUserMessage(input.value);
    }
});

hamburger.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('open');
    chatContainer.classList.toggle('shifted');
    inputOuter.classList.toggle('shifted');
    hamburger.src = isOpen ? 'cross.png' : 'sidebar.png';
});

// Upload PDF
fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('pdf', file);

    const res = await fetch('/upload', {
        method: 'POST',
        body: formData
    });

    const data = await res.json();
    if (data.message) {
        showPdfBubble(file.name);
        localStorage.setItem('pdfLoaded', 'true'); // <--- Required
    }
});

function showPdfBubble(fileName) {
    pdfBubbleContainer.innerHTML = '';
    const bubble = document.createElement('div');
    bubble.className = 'user-bubble';
    bubble.style.display = 'flex';
    bubble.style.alignItems = 'center';
    bubble.style.justifyContent = 'space-between';
    bubble.style.marginBottom = '8px';
    bubble.textContent = fileName;

    const close = document.createElement('span');
    close.textContent = '✕';
    close.style.marginLeft = '12px';
    close.style.cursor = 'pointer';
    close.onclick = () => {
        clearPDF(true);
    };

    bubble.appendChild(close);
    pdfBubbleContainer.appendChild(bubble);
}

function clearPDF(userClicked = false) {
    fetch('/clear-pdf', {
        method: 'POST'
    })
        .then(res => res.json())
        .then(data => {
            if (userClicked) {
                alert(data.message);
            }
            localStorage.removeItem('pdfLoaded');
            pdfBubbleContainer.innerHTML = '';
        });
}

document.querySelector('.new-chat').addEventListener('click', () => {
    localStorage.removeItem('currentChat');
    chat.innerHTML = '';
    input.value = '';
    input.style.height = 'auto';
});

document.querySelector('.exit-btn').addEventListener('click', () => {
    localStorage.removeItem('currentChat');
    chat.innerHTML = '';
    localStorage.removeItem('pdfLoaded');
    window.location.href = 'about:blank';
});