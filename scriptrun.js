// --- Select elements ---
const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// --- Send message when button clicked ---
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// --- Main send function ---
function sendMessage() {
  const message = userInput.value.trim();
  if (message === "") return;

  // Display user message
  addMessage(message, "user");

  // Clear input field
  userInput.value = "";

  // Simulate bot reply
  setTimeout(() => {
    generateBotReply(message);
  }, 600);
}

// --- Add message to chat box ---
function addMessage(text, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);

  // Auto-scroll to bottom
  chatBox.scrollTop = chatBox.scrollHeight;
}


async function generateBotReply(userMsg) {
  // Show "Thinking..." message
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("bot-message");
  messageDiv.textContent = "Thinking...";
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    // Send user message to backend
    const res = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMsg }),
    });

    const data = await res.json();
    messageDiv.textContent = data.reply; // Replace "Thinking..." with AI response
  } catch (err) {
    messageDiv.textContent = "⚠️ Unable to reach the AI server.";
    console.error(err);
  }

  chatBox.scrollTop = chatBox.scrollHeight;
}
