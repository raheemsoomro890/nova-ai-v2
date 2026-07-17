// =============================================
// NOVA AI v4 Professional
// Part 1 - Core & Chat Manager
// =============================================

"use strict";

// =============================================
// DOM ELEMENTS
// =============================================

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

const newChatBtn = document.getElementById("newChatBtn");
const chatHistory = document.getElementById("chatHistory");

const startupScreen = document.getElementById("startupScreen");
const bootText = document.getElementById("bootText");
const app = document.querySelector(".app");

// =============================================
// NOVA CORE
// =============================================

const Nova = {

    version: "4.0",

    online: true,

    memory: [],

    speaking: false,

    listening: false

};

// =============================================
// STORAGE
// =============================================

let chats =
JSON.parse(localStorage.getItem("novaChats")) || [];

let currentChat =
localStorage.getItem("currentChat");

// =============================================
// SAVE STORAGE
// =============================================

function saveStorage(){

    localStorage.setItem(
        "novaChats",
        JSON.stringify(chats)
    );

    localStorage.setItem(
        "currentChat",
        currentChat
    );

}

// =============================================
// CREATE NEW CHAT
// =============================================

function createChat(){

    const id = Date.now().toString();

    const chat = {

        id,

        title:"New Chat",

        messages:`
<div class="bot-message">
👋 Welcome to <b>Nova AI</b><br><br>
How can I help you today?
</div>
`

    };

    chats.unshift(chat);

    currentChat = id;

    saveStorage();

    renderHistory();

    loadChat(id);

}

// =============================================
// LOAD CHAT
// =============================================

function loadChat(id){

    const chat =
    chats.find(c=>c.id===id);

    if(!chat) return;

    currentChat = id;

    messages.innerHTML = chat.messages;

    scrollBottom();

    saveStorage();

}

// =============================================
// SAVE CURRENT CHAT
// =============================================

function saveCurrentChat(){

    const chat =
    chats.find(c=>c.id===currentChat);

    if(!chat) return;

    chat.messages = messages.innerHTML;

    const firstMessage =
    messages.querySelector(".user-message");

    if(firstMessage && chat.title==="New Chat"){

        chat.title =
        firstMessage.innerText.substring(0,30);

    }

    saveStorage();

    renderHistory();

}

// =============================================
// CHAT HISTORY
// =============================================

function renderHistory(){

    chatHistory.innerHTML = "";

    chats.forEach(chat=>{

        const item =
        document.createElement("div");

        item.className = "history-item";

        item.textContent = chat.title;

        if(chat.id===currentChat){

            item.style.background="#2563eb";

        }

        item.onclick=()=>{

            loadChat(chat.id);

            renderHistory();

        };

        chatHistory.appendChild(item);

    });

}

// =============================================
// AUTO SCROLL
// =============================================

function scrollBottom(){

    messages.scrollTop =
    messages.scrollHeight;

}

// =============================================
// FIRST LOAD
// =============================================

if(chats.length===0){

    createChat();

}else{

    renderHistory();

    loadChat(
        currentChat || chats[0].id
    );

}

// =============================================
// BUTTON EVENTS
// =============================================

newChatBtn.addEventListener(
    "click",
    createChat
);


// =====================================
// NOVA AI v3
// PART 2 - Chat Functions
// =====================================

// Send Message
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

    messages.scrollTop = messages.scrollHeight;

    // Typing Indicator
    messages.innerHTML += `
    <div class="bot-message" id="typing">
        🤖 Nova AI is thinking...
    </div>
    `;

    messages.scrollTop = messages.scrollHeight;

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

        // Speak reply (Part 3)
        if (typeof speak ===


            // ==========================================
// NOVA AI v3
// Part 3 - Voice System + Startup
// ==========================================

// ==========================
// TEXT TO SPEECH
// ==========================

function speak(text) {

    if (!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    const voices = speechSynthesis.getVoices();

    const voice =
        voices.find(v =>
            v.lang.startsWith("en") &&
            v.name.toLowerCase().includes("google")
        ) ||
        voices.find(v =>
            v.lang.startsWith("en")
        );

    if (voice) {



    // ==========================================
// NOVA AI v3
// Part 4 - Startup + Final System
// ==========================================

// ==========================
// STARTUP ANIMATION
// ==========================

window.addEventListener("load", () => {

    const startup = document.getElementById("startupScreen");
    const app = document.querySelector(".app");
    const bootText = document.getElementById("bootText");

    if (app) app.style.opacity = "0";

    const steps = [
        "Initializing...",
        "Loading AI Core...",
        "Loading Neural Engine...",
        "Connecting to Gemini...",
        "Loading Voice System...",
        "System Online ✓"
    ];

    let index = 0;

    const interval = setInterval(() => {

        if (bootText) {
           
