// =============================================
// NOVA AI v6
// PART 1 - CORE & CHAT MANAGER
// =============================================

"use strict";

// ==============================
// DOM ELEMENTS
// ==============================

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

const newChatBtn = document.getElementById("newChatBtn");
const chatHistory = document.getElementById("chatHistory");

const startupScreen = document.getElementById("startupScreen");
const bootText = document.getElementById("bootText");
const app = document.querySelector(".app");

// ==============================
// NOVA CORE
// ==============================

const Nova = {
    version: "6.0",
    name: "Nova AI",
    online: true,
    memory: []
};

// ==============================
// STORAGE
// ==============================

let chats = JSON.parse(localStorage.getItem("novaChats")) || [];
let currentChat = localStorage.getItem("currentChat");

// ==============================
// SAVE STORAGE
// ==============================

function saveStorage() {
    localStorage.setItem("novaChats", JSON.stringify(chats));
    localStorage.setItem("currentChat", currentChat);
}

// ==============================
// AUTO SCROLL
// ==============================

function scrollBottom() {
    messages.scrollTop = messages.scrollHeight;
}

// ==============================
// CREATE CHAT
// ==============================

function createChat() {

    const id = Date.now().toString();

    const chat = {
        id: id,
        title: "New Chat",
        messages: `
<div class="bot-message">
👋 Welcome to <b>Nova AI</b><br><br>
How can I help you today?
</div>`
    };

    chats.unshift(chat);

    currentChat = id;

    saveStorage();

    renderHistory();

    loadChat(id);

}

// ==============================
// LOAD CHAT
// ==============================

function loadChat(id) {

    const chat = chats.find(c => c.id === id);

    if (!chat) return;

    currentChat = id;

    messages.innerHTML = chat.messages;

    scrollBottom();

    saveStorage();

}

// ==============================
// SAVE CURRENT CHAT
// ==============================

function saveCurrentChat() {

    const chat = chats.find(c => c.id === currentChat);

    if (!chat) return;

    chat.messages = messages.innerHTML;

    const firstUser = messages.querySelector(".user-message");

    if (firstUser && chat.title === "New Chat") {
        chat.title = firstUser.innerText.substring(0, 30);
    }

    saveStorage();

    renderHistory();

}

// ==============================
// CHAT HISTORY
// ==============================

function renderHistory() {

    chatHistory.innerHTML = "";

    chats.forEach(chat => {

        const item = document.createElement("div");

        item.className = "history-item";

        item.textContent = chat.title;

        if (chat.id === currentChat) {
            item.style.background = "#2563eb";
        }

        item.addEventListener("click", () => {
            loadChat(chat.id);
            renderHistory();
        });

        chatHistory.appendChild(item);

    });

}

// ==============================
// FIRST LOAD
// ==============================

if (chats.length === 0) {

    createChat();

} else {

    renderHistory();

    loadChat(currentChat || chats[0].id);

}

// ==============================
// NEW CHAT
// ==============================

newChatBtn.addEventListener("click", createChat);

// =============================================
// NOVA AI v6
// PART 2 - CHAT SYSTEM
// =============================================

// ==============================
// SEND MESSAGE
// ==============================

async function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    // User Message
    messages.innerHTML += `
        <div class="user-message">
            ${text}
        </div>
    `;

    input.value = "";

    saveCurrentChat();

    scrollBottom();

    // Typing Indicator
    messages.innerHTML += `
        <div class="bot-message" id="typing">
            🤖 Nova AI is thinking...
        </div>
    `;

    scrollBottom();

    try {

        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text
            })

        });

        const data = await response.json();

        document.getElementById("typing")?.remove();

        if (!response.ok) {

            throw new Error(data.error || "API Error");

        }

        messages.innerHTML += `
            <div class="bot-message">
                ${data.reply.replace(/\n/g, "<br>")}
            </div>
        `;

        // Speak if available
        if (typeof speak === "function") {
            speak(data.reply);
        }

        // Save memory
        Nova.memory.push({
            user: text,
            ai: data.reply,
            time: new Date().toLocaleTimeString()
        });

        saveCurrentChat();

        scrollBottom();

    } catch (error) {

        document.getElementById("typing")?.remove();

        messages.innerHTML += `
            <div class="bot-message">
                ❌ Error connecting to Nova AI.
            </div>
        `;

        console.error(error);

        saveCurrentChat();

        scrollBottom();

    }

}

// ==============================
// EVENTS
// ==============================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

        sendMessage();

    }

});

// =============================================
// NOVA AI v6
// PART 3 - VOICE SYSTEM
// =============================================

// ==============================
// TEXT TO SPEECH
// ==============================

function speak(text) {

    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    let voices = speechSynthesis.getVoices();

    const setVoice = () => {

        voices = speechSynthesis.getVoices();

        const voice =
            voices.find(v =>
                v.lang.startsWith("en") &&
                v.name.toLowerCase().includes("google")
            ) ||
            voices.find(v =>
                v.lang.startsWith("en")
            );

        if (voice) {
            speech.voice = voice;
        }

        speechSynthesis.speak(speech);

    };

    if (voices.length === 0) {
        speechSynthesis.onvoiceschanged = setVoice;
    } else {
        setVoice();
    }

}

// ==============================
// SPEECH RECOGNITION
// ==============================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition && micBtn) {

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    micBtn.addEventListener("click", () => {
    recognition.start();
});

recognition.onresult = (event) => {
    input.value = event.results[0][0].transcript;
    sendMessage();
};

recognition.onend = () => {};

recognition.onerror = () => {};



      // =============================================
// NOVA AI v6
// PART 4 - STARTUP SYSTEM
// =============================================

window.addEventListener("load", () => {

    if (app) {
        app.style.opacity = "0";
    }

    const steps = [
        "Initializing...",
        "Loading AI Core...",
        "Connecting to Gemini...",
        "Loading Memory...",
        "Loading Voice Engine...",
        "Optimizing Performance...",
        "System Online ✓"
    ];

    let index = 0;

    const interval = setInterval(() => {

        if (bootText && index < steps.length) {
            bootText.textContent = steps[index];
        }

        index++;

        if (index >= steps.length) {

            clearInterval(interval);

            setTimeout(() => {

                if (startupScreen) {
                    startupScreen.classList.add("hide");
                }

                if (app) {
                    app.style.opacity = "1";
                }

            }, 800);

        }

    }, 700);

});

// =============================================
// NOVA AI READY
// =============================================

console.log(`
==================================
      NOVA AI v6 READY
==================================
Status  : Online
Voice   : Enabled
Memory  : Enabled
Storage : Enabled
==================================
`);  



                            
