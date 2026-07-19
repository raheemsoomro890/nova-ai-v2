alert("Script Loaded");
"use strict";
```javascript
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const messagesEl = document.getElementById("messages");
  const userInput = document.getElementById("userInput");
  const sendBtn = document.getElementById("sendBtn");
  const micBtn = document.getElementById("micBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const chatHistoryEl = document.getElementById("chatHistory");
  const startupScreen = document.getElementById("startupScreen");
  const bootText = document.getElementById("bootText");
  const appEl = document.querySelector(".app");

  const STORAGE_KEY = "nova_ai_chats";
  const CURRENT_CHAT_KEY = "nova_ai_current_chat";

  let chats = {};
  let currentChatId = null;
  let recognition = null;
  let isListening = false;

  function generateId() {
    return "chat_" + Date.now() + "_" + Math.random().toString(36).slice(2, 9);
  }

  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      chats = raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.error("Failed to load chats from storage:", err);
      chats = {};
    }
  }

  function saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (err) {
      console.error("Failed to save chats to storage:", err);
    }
  }

  function saveCurrentChat() {
    if (!currentChatId || !chats[currentChatId]) return;
    try {
      localStorage.setItem(CURRENT_CHAT_KEY, currentChatId);
      saveStorage();
    } catch (err) {
      console.error("Failed to save current chat:", err);
    }
  }

  function createChat() {
    const id = generateId();
    chats[id] = {
      id: id,
      title: "New Chat",
      messages: [],
      createdAt: Date.now()
    };
    currentChatId = id;
    saveStorage();
    saveCurrentChat();
    renderHistory();
    renderMessages();
    return id;
  }

  function loadChat(id) {
    if (!chats[id]) return;
    currentChatId = id;
    saveCurrentChat();
    renderHistory();
    renderMessages();
  }

  function renameChatFromFirstMessage(id, text) {
    if (!chats[id]) return;
    if (chats[id].title === "New Chat") {
      const trimmed = text.trim();
      chats[id].title = trimmed.length > 40 ? trimmed.slice(0, 40) + "..." : trimmed;
    }
  }

  function renderHistory() {
    if (!chatHistoryEl) return;
    chatHistoryEl.innerHTML = "";
    const chatIds = Object.keys(chats).sort((a, b) => chats[b].createdAt - chats[a].createdAt);

    chatIds.forEach((id) => {
      const chat = chats[id];
      const item = document.createElement("div");
      item.className = "chat-history-item";
      if (id === currentChatId) {
        item.classList.add("active");
      }
      item.textContent = chat.title || "New Chat";
      item.addEventListener("click", () => {
        loadChat(id);
      });
      chatHistoryEl.appendChild(item);
    });
  }

  function renderMessages() {
    if (!messagesEl) return;
    messagesEl.innerHTML = "";
    const chat = chats[currentChatId];
    if (!chat) return;

    chat.messages.forEach((msg) => {
      appendMessageToDOM(msg.role, msg.text, false);
    });
    scrollBottom();
  }

  function appendMessageToDOM(role, text, shouldScroll) {
    if (!messagesEl) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = "message " + (role === "user" ? "message-user" : "message-ai");

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = text;

    msgDiv.appendChild(bubble);
    messagesEl.appendChild(msgDiv);

    if (shouldScroll) {
      scrollBottom();
    }
  }

  function scrollBottom() {
    if (!messagesEl) return;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTypingIndicator() {
    if (!messagesEl) return null;
    const typingDiv = document.createElement("div");
    typingDiv.className = "message message-ai typing-indicator";
    typingDiv.id = "typingIndicator";

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";
    bubble.textContent = "Typing...";

    typingDiv.appendChild(bubble);
    messagesEl.appendChild(typingDiv);
    scrollBottom();
    return typingDiv;
  }

  function removeTypingIndicator() {
    const typingDiv = document.getElementById("typingIndicator");
    if (typingDiv && typingDiv.parentNode) {
      typingDiv.parentNode.removeChild(typingDiv);
    }
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!currentChatId || !chats[currentChatId]) {
      createChat();
    }

    const chat = chats[currentChatId];

    chat.messages.push({ role: "user", text: trimmed });
    renameChatFromFirstMessage(currentChatId, trimmed);
    appendMessageToDOM("user", trimmed, true);
    saveStorage();
    renderHistory();

    if (userInput) {
      userInput.value = "";
    }

    showTypingIndicator();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: trimmed })
      });

      if (!response.ok) {
        throw new Error("Server responded with status " + response.status);
      }

      const data = await response.json();
      const reply = data && typeof data.reply === "string" ? data.reply : "Sorry, I could not generate a response.";

      removeTypingIndicator();
      chat.messages.push({ role: "ai", text: reply });
      appendMessageToDOM("ai", reply, true);
      saveStorage();
      saveCurrentChat();

      speakText(reply);
    } catch (err) {
      console.error("Chat request failed:", err);
      removeTypingIndicator();
      const errorText = "Something went wrong. Please try again.";
      chat.messages.push({ role: "ai", text: errorText });
      appendMessageToDOM("ai", errorText, true);
      saveStorage();
    }
  }

  function handleSend() {
    if (!userInput) return;
    const text = userInput.value;
    sendMessage(text);
  }

  if (sendBtn) {
    sendBtn.addEventListener("click", () => {
      handleSend();
    });
  }

  if (userInput) {
    userInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      createChat();
    });
  }

  let englishVoice = null;

  function loadVoices() {
    const voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
    englishVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith("en")) || null;
  }

  if (window.speechSynthesis) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speakText(text) {
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis failed:", err);
    }
  }

  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognitionCtor && micBtn) {
    recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.addEventListener("start", () => {
      isListening = true;
      micBtn.classList.add("listening");
    });

    recognition.addEventListener("end", () => {
      isListening = false;
      micBtn.classList.remove("listening");
    });

    recognition.addEventListener("result", (event) => {
      const transcript = event.results && event.results[0] && event.results[0][0]
        ? event.results[0][0].transcript
        : "";
      if (transcript && userInput) {
        userInput.value = transcript;
        sendMessage(transcript);
      }
    });

    recognition.addEventListener("error", (event) => {
      console.error("Speech recognition error:", event.error);
      isListening = false;
      micBtn.classList.remove("listening");
    });

    micBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
        return;
      }
      try {
        recognition.start();
      } catch (err) {
        console.error("Failed to start recognition:", err);
      }
    });
  } else if (micBtn) {
    micBtn.style.display = "none";
  }

  const startupSteps = [
    "Initializing...",
    "Loading AI Core...",
    "Connecting to Gemini...",
    "Loading Memory...",
    "Loading Voice Engine...",
    "Optimizing Performance...",
    "System Online \u2713"
  ];

  function runStartupAnimation() {
    if (!bootText || !startupScreen || !appEl) {
      if (startupScreen) startupScreen.classList.add("hide");
      if (appEl) appEl.style.opacity = "1";
      return;
    }

    let stepIndex = 0;
    const stepDuration = 450;

    function showNextStep() {
      if (stepIndex >= startupSteps.length) {
        startupScreen.classList.add("hide");
        appEl.style.opacity = "1";
        return;
      }
      bootText.textContent = startupSteps[stepIndex];
      stepIndex += 1;
      setTimeout(showNextStep, stepDuration);
    }

    showNextStep();
  }

  function init() {
    loadStorage();

    const savedCurrentId = localStorage.getItem(CURRENT_CHAT_KEY);
    const chatIds = Object.keys(chats);

    if (savedCurrentId && chats[savedCurrentId]) {
      currentChatId = savedCurrentId;
    } else if (chatIds.length > 0) {
      currentChatId = chatIds.sort((a, b) => chats[b].createdAt - chats[a].createdAt)[0];
    } else {
      currentChatId = createChat();
    }

    renderHistory();
    renderMessages();
    runStartupAnimation();
  }

  init();
});
```
