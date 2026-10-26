// Smartbot-AI - Azure OpenAI
// Smart FAQ Assistant

const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const systemPrompt = document.getElementById("systemPrompt");

// Add message to chat
function addMessage(text, type) {
  const msg = document.createElement("div");
  msg.classList.add("message", type);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

// Send message to Azure OpenAI
async function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Show user message
  addMessage(message, "user");
  userInput.value = "";
  sendBtn.disabled = true;

  // Show loading
  const loadingMsg = addMessage(" Thinking...", "loading");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: message,
        systemPrompt: systemPrompt.value,
      }),
    });

    const data = await response.json();

    // Remove loading message
    chatBox.removeChild(loadingMsg);

    if (!response.ok) {
      addMessage(
        data.error || "Sorry, something went wrong. Please try again.",
        "bot",
      );
      return;
    }

    if (typeof data.reply === "string") {
      addMessage(
        data.reply.trim() ||
          "I do not have enough information to answer that yet.",
        "bot",
      );
    } else {
      addMessage("Sorry, something went wrong. Please try again.", "bot");
    }
  } catch (error) {
    chatBox.removeChild(loadingMsg);
    addMessage("Error connecting to server. Please refresh.", "bot");
  }

  sendBtn.disabled = false;
}

// Send on button click
sendBtn.addEventListener("click", sendMessage);

// Send on Enter key
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
