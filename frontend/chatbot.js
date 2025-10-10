// Toggle chatbot visibility
document.getElementById("chatToggleBtn").addEventListener("click", () => {
  document.getElementById("chatbotBox").style.display = "flex";
});

document.getElementById("closeChat").addEventListener("click", () => {
  document.getElementById("chatbotBox").style.display = "none";
});

// Send message
document.getElementById("sendMessage").addEventListener("click", sendChatMessage);
document.getElementById("userMessage").addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendChatMessage();
});

function sendChatMessage() {
  const input = document.getElementById("userMessage");
  const msg = input.value.trim();
  if (!msg) return;
  appendMessage("user", msg);
  input.value = "";

  // Analyze sentiment
  const sentiment = analyzeSentiment(msg);
  const reply = `Your message seems to have a **${sentiment}** sentiment.`;
  setTimeout(() => appendMessage("bot", reply), 500);
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById("chatMessages");
  const msgEl = document.createElement("div");
  msgEl.classList.add("msg", sender);
  msgEl.innerHTML = text;
  chatBox.appendChild(msgEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function analyzeSentiment(text) {
  const positiveWords = ["happy", "good", "great", "awesome", "love", "excellent", "amazing"];
  const negativeWords = ["sad", "bad", "angry", "upset", "terrible", "hate", "worried"];

  let score = 0;
  text.toLowerCase().split(/\W+/).forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });

  if (score > 0) return "Positive 😊";
  if (score < 0) return "Negative 😞";
  return "Neutral 😐";
}
