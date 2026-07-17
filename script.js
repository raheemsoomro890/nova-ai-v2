// ==========================================
// NOVA AI v3
// Part 1 - Chat Manager
// ==========================================

// ==========================
// ELEMENTS
// ==========================

const messages = document.getElementById("messages");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

const newChatBtn = document.getElementById("newChatBtn");
const chatHistory = document.getElementById("chatHistory");

// ==========================
// STORAGE
// ==========================

let chats = JSON.parse(localStorage.getItem("novaChats")) || [];

let currentChat =
localStorage.getItem("currentChat");

// ==========================
// SAVE DATA
// ==========================

function saveData(){

    localStorage.setItem(
        "novaChats",
        JSON.stringify(chats)
    );

    localStorage.setItem(
        "currentChat",
        currentChat
    );

}

// ==========================
// CREATE CHAT
// ==========================

function createChat(){

    const id = Date.now().toString();

    const chat = {

        id,

        title:"New Chat",

        messages:`
<div class="bot-message">
👋 Welcome to <b>Nova AI</b>
<br><br>
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

// ==========================
// LOAD CHAT
// ==========================

function loadChat(id){

    currentChat = id;

    const chat =
    chats.find(c => c.id === id);

    if(!chat) return;

    messages.innerHTML = chat.messages;

    saveData();

}

// ==========================
// SAVE CURRENT CHAT
// ==========================

function saveCurrentChat(){

    const chat =
    chats.find(c => c.id === currentChat);

    if(!chat) return;

    chat.messages = messages.innerHTML;

    const firstUser =
    messages.querySelector(".user-message");

    if(firstUser && chat.title === "New Chat"){

        chat.title =
        firstUser.innerText.substring(0,30);

    }

    saveData();

    renderHistory();

}

// ==========================
// CHAT HISTORY
// ==========================

function renderHistory(){

    chatHistory.innerHTML = "";

    chats.forEach(chat=>{

        const item =
        document.createElement("div");

        item.className = "history-item";

        item.innerText = chat.title;

        if(chat.id === currentChat){

            item.style.background="#2563eb";

        }

        item.onclick=()=>{

            loadChat(chat.id);

            renderHistory();

        };

        chatHistory.appendChild(item);

    });

}

// ==========================
// FIRST LOAD
// ==========================

if(chats.length===0){

    createChat();

}else{

    renderHistory();

    loadChat(
        currentChat || chats[0].id
    );

}

// ==========================
// NEW CHAT BUTTON
// ==========================

newChatBtn.addEventListener(
    "click",
    createChat
);





// ==========================================
// NOVA AI v3
// Part 2 - AI Chat
// ==========================================

// ==========================
// SEND MESSAGE
// ==========================

async function sendMessage(){

    const text = input.value.trim();

    if(!text) return;

    // --------------------------
    // USER MESSAGE
    // --------------------------

    messages.innerHTML += `
    <div class="user-message">
        ${text}
    </div>
    `;

    input.value = "";

    saveCurrentChat();

    messages.scrollTop = messages.scrollHeight;

    // --------------------------
    // TYPING INDICATOR
    // --------------------------

    messages.innerHTML += `
    <div class="bot-message" id="typing">
        🤖 Nova AI is thinking...
    </div>
    `;

    messages.scrollTop = messages.scrollHeight;

    try{

        const response = await fetch("/api/chat",{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                message:text

            })

        });

        const data = await response.json();

        // Remove typing
        document.getElementById("typing")?.remove();

        if(!response.ok){

            throw new Error(
                data.error || "API Error"
            );

        }

        // --------------------------
        // BOT MESSAGE
        // --------------------------

        messages.innerHTML += `
        <div class="bot-message">
            ${data.reply.replace(/\n/g,"<br>")}
        </div>
        `;

        // Speak (Part 3 me function banega)

        if(typeof speak==="function"){

            speak(data.reply);

        }

        saveCurrentChat();

        messages.scrollTop = messages.scrollHeight;

    }

    catch(error){

        document.getElementById("typing")?.remove();

        messages.innerHTML += `
        <div class="bot-message">
            ❌ Error connecting to Nova AI.
        </div>
        `;

        saveCurrentChat();

        messages.scrollTop = messages.scrollHeight;

        console.error(error);

    }

}

// ==========================
// EVENTS
// ==========================

sendBtn.addEventListener("click",sendMessage);

input.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        sendMessage();

    }

});





// ==========================================
// NOVA AI v3
// Part 3 - Voice System
// ==========================================

// ==========================
// TEXT TO SPEECH
// ==========================

function speak(text){

    if(!("speechSynthesis" in window)) return;

    speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 1;
    speech.pitch = 1;
    speech.volume = 1;

    let voices = speechSynthesis.getVoices();

    if(voices.length===0){

        speechSynthesis.onvoiceschanged = ()=>{

            voices = speechSynthesis.getVoices();

        };

    }

    const voice =

        voices.find(v=>

            v.lang.startsWith("en") &&

            v.name.toLowerCase().includes("google")

        )

        ||

        voices.find(v=>

            v.lang.startsWith("en")

        );

    if(voice){

        speech.voice = voice;

    }

    speech.onstart = ()=>{

        micBtn.classList.add("speaking");

    };

    speech.onend = ()=>{

        micBtn.classList.remove("speaking");

    };

    speechSynthesis.speak(speech);

}

// ==========================
// SPEECH RECOGNITION
// ==========================

const SpeechRecognition =

window.SpeechRecognition ||

window.webkitSpeechRecognition;

if(SpeechRecognition){

    const recognition = new SpeechRecognition();

    recognition.lang="en-US";

    recognition.continuous=false;

    recognition.interimResults=false;

    recognition.maxAlternatives=1;

    micBtn.addEventListener("click",()=>{

        recognition.start();

        micBtn.classList.add("listening");

    });

    recognition.onresult=(event)=>{

        const text=

        event.results[0][0].transcript;

        input.value=text;

        sendMessage();

    };

    recognition.onend=()=>{

        micBtn.classList.remove("listening");

    };

    recognition.onerror=()=>{

        micBtn.classList.remove("listening");

    };

}else{

    console.log("Speech Recognition Not Supported");

    micBtn.style.display="none";

}





// ==========================================
// NOVA AI v3
// Part 4 - Startup System
// ==========================================

// ==========================
// STARTUP ANIMATION
// ==========================

window.addEventListener("load", () => {

    const startup = document.getElementById("startupScreen");
    const app = document.querySelector(".app");
    const bootText = document.getElementById("bootText");

    app.style.opacity = "0";

    const steps = [

        "Initializing...",
        "Loading AI Core...",
        "Loading Neural Engine...",
        "Connecting to Gemini...",
        "Checking Memory...",
        "Loading Voice System...",
        "Optimizing Performance...",
        "System Online ✓"

    ];

    let index = 0;

    const interval = setInterval(() => {

        bootText.textContent = steps[index];

        index++;

        if(index >= steps.length){

            clearInterval(interval);

            setTimeout(() => {

               




     // ==========================================
// NOVA AI v3
// Part 5 - Final System
// ==========================================

// ==========================
// NOVA AI CORE
// ==========================

const Nova = {

    version: "3.0",

    name: "Nova AI",

    online: true,

    memory: [],

    speaking: false,

    listening: false

};

// ==========================
// MEMORY (Future Ready)
// ==========================

function remember(user, ai){

    Nova.memory.push({

        user,

        ai,

        time:new Date().to           
