// ---------- Close Chatbot Window ----------
const closeBtn = document.getElementById("closeChat");
if (closeBtn) closeBtn.addEventListener("click", () => window.close());

// ---------- Elements ----------
const messages = document.getElementById("chatMessages");
const input = document.getElementById("userMessage");
const sendBtn = document.getElementById("sendMessage");

// Conversation state sent to backend. Backend prepends the system prompt.
const conversation = [];
const MAX_HISTORY = 12; // keep the last N messages to limit payload

// ---------- Event Listeners ----------
if (sendBtn) sendBtn.addEventListener("click", sendMessage);
if (input) input.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });

// ---------- Functions ----------
async function sendMessage() {
  const text = input.value?.trim();
  if (!text) return;

  appendMessage(text, "user");
  input.value = "";

  // Add to conversation
  conversation.push({ role: 'user', content: text });
  // Trim history keeping the last MAX_HISTORY messages plus system prompt handled by backend
  const history = conversation.slice(-MAX_HISTORY);

  // Show a typing indicator
  const typingId = appendMessage("...", "bot typing");

  try {
    // Use the backend address explicitly so the request isn't sent to the frontend dev server (e.g. Live Server on :5500)
    // which will return 405 for POST /api/chat. Change API_BASE if your backend runs elsewhere.
    const API_BASE = 'http://localhost:5000';
    const resp = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: 'Unknown error' }));
      updateTyping(typingId, `Error: ${err.error || resp.statusText}`);
      return;
    }

    const data = await resp.json();
    const reply = data.reply || "Sorry, I couldn't respond right now.";

    // Replace typing indicator with actual message
    updateTyping(typingId, reply, "bot");

    // Add assistant message to conversation
    conversation.push({ role: 'assistant', content: reply });
  } catch (err) {
    updateTyping(typingId, 'Network error. Please try again later.');
    console.error('Chat error', err);
  }
}

function appendMessage(message, sender) {
  const div = document.createElement("div");
  div.classList.add("msg");
  if (sender) div.classList.add(sender.replace(/\s+/g, '-'));
  div.innerText = message;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
  return div; // return element to allow updates (typing -> real message)
}

function updateTyping(typingElem, newText, senderClass='bot') {
  if (!typingElem) return;
  typingElem.className = 'msg ' + senderClass;
  typingElem.innerText = newText;
  messages.scrollTop = messages.scrollHeight;
}

