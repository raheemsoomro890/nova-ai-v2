// =====================================
// NOVA AI v2
// Part 1 - Chat Manager
// =====================================

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const newChatBtn = document.getElementById("newChatBtn");
const chatHistory = document.getElementById("chatHistory");

// ==============================
// STORAGE
// ==============================

let chats = JSON.parse(localStorage.getItem("novaChats")) || [];

let currentChat = localStorage.getItem("currentChat");

// ==============================
// SAVE DATA
// ==============================

function saveData() {

    localStorage.setItem(
        "novaChats",
        JSON.stringify(chats)
    );

    localStorage.setItem(
        "currentChat",
        currentChat
    );

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
</div>
`

    };

    chats.unshift(chat);

    currentChat = id;

    saveData();

    renderHistory();

    loadChat(id);

}

// ==============================
// LOAD CHAT
// ==============================

function loadChat(id) {

    currentChat = id;

    const chat = chats.find(c => c.id === id);

    if (!chat) return;

    messages.innerHTML = chat.messages;

    saveData();

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

    saveData();

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

        item.innerText = chat.title;

        if (chat.id === currentChat) {

            item.style.background = "#2563eb";

        }

        item.onclick = () => {

            loadChat(chat.id);

            renderHistory();

        };

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
// NEW CHAT BUTTON
// ==============================

newChatBtn.addEventListener("click", createChat);



// =====================================
// NOVA AI v2
// Part 2 - AI Chat
// =====================================

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
${data.reply.replace(/\n/g,"<br>")}
</div>
`;

        saveCurrentChat();

        messages.scrollTop = messages.scrollHeight;

    } catch (error) {

        document.getElementById("typing")?.remove();

        messages.innerHTML += `
<div class="bot-message">
❌ Error connecting to Nova AI.
</div>
`;

        saveCurrentChat();

    }

}

// ==============================
// EVENTS
// ==============================

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", function(e){

    if(e.key === "Enter"){

        sendMessage();

    }

});




// =====================================
// NOVA AI STARTUP
// =====================================

window.addEventListener("load", () => {

    const startup = document.getElementById("startupScreen");

    const app = document.querySelector(".app");

    const bootText = document.getElementById("bootText");

    const steps = [

        "Initializing...",

        "Loading AI Core...",

        "Connecting to Gemini...",

        "Loading Neural Engine...",

        "System Online ✓"

    ];

    let index = 0;

    const interval = setInterval(() => {

        bootText.textContent = steps[index];

        index++;

        if(index >= steps.length){

            clearInterval(interval);

            setTimeout(() => {

                startup.classList.add("hide");

                app.style.opacity = "1";

            },800);

        }

    },900);

});
