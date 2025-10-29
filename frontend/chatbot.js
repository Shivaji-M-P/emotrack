// ---------- Close Chatbot Window ----------
document.getElementById("closeChat").addEventListener("click", () => {
  window.close();
});

// ---------- Elements ----------
const messages = document.getElementById("chatMessages");
const input = document.getElementById("userMessage");
const sendBtn = document.getElementById("sendMessage");

// ---------- Event Listeners ----------
sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// ---------- Functions ----------
function sendMessage() {
  const text = input.value.trim();
  if (text === "") return;

  appendMessage(text, "user");
  input.value = "";

  setTimeout(() => {
    const botReply = getBotReply(text);
    appendMessage(botReply, "bot");
  }, 700);
}

function appendMessage(message, sender) {
  const div = document.createElement("div");
  div.classList.add("msg", sender);
  div.innerText = message;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function getBotReply(input) {
  const msg = input.toLowerCase();

  if (msg.includes("hello") || msg.includes("hi")) {
    return "Hi there! 😊 How are you feeling today?";
  } else if (msg.includes("sad") || msg.includes("depressed")) {
    return "I'm sorry to hear that 😔. Try doing something relaxing — a walk, music, or journaling can help.";
  } else if (msg.includes("happy") || msg.includes("good")) {
    return "That’s awesome! Keep up the positive vibes 😄✨";
  } else if (msg.includes("stress") || msg.includes("anxious")) {
    return "Take a deep breath 🌿. Sometimes, a few minutes of calm breathing can make a big difference.";
  } else if (msg.includes("angry") || msg.includes("mad")) {
    return "It's okay to feel angry sometimes 😤. Try to pause and breathe before reacting.";
  } else if (msg.includes("bye")) {
    return "Goodbye! 👋 Take care and remember — you’re doing great!";
  } else {
    return "Hmm... I'm still learning 🤔. But I'm here to listen!";
  }
}
