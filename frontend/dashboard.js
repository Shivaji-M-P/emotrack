// Dashboard behaviour (frontend-only)
document.addEventListener("DOMContentLoaded", () => {
  const welcomeText = document.getElementById("welcomeText");
  const logoutBtn = document.getElementById("logoutBtn");
  const loggedInUser = localStorage.getItem("loggedInUser") || "Guest";
  welcomeText.textContent = `Hello, ${shortName(loggedInUser)}`;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });

  // Mood buttons
  const moodButtons = document.querySelectorAll(".mood-btn");
  let selectedMood = null;
  moodButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      moodButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      selectedMood = parseInt(btn.dataset.mood, 10);
    });
  });

  document.getElementById("submitMood").addEventListener("click", () => {
    if (!selectedMood) {
      showTempMessage("moodSavedMsg", "Please select a mood first.", 2500);
      return;
    }
    saveMood(loggedInUser, selectedMood);
    showTempMessage("moodSavedMsg", "Mood saved ✓", 1800);
    selectedMood = null;
    moodButtons.forEach(b => b.classList.remove("selected"));
    loadMoodHistory();
  });

  document.getElementById("saveJournal").addEventListener("click", () => {
    const text = document.getElementById("journalEntry").value.trim();
    if (!text) {
      showTempMessage("journalSavedMsg", "Write something before saving.", 2500);
      return;
    }
    saveJournal(loggedInUser, text);
    document.getElementById("journalEntry").value = "";
    showTempMessage("journalSavedMsg", "Journal saved ✓", 1800);
    updateStats();
  });

  initChart();
  loadMoodHistory();
  updateStats();
});

/* ---------- Local Storage Helpers ---------- */
function storageKey(prefix, user) { return `${prefix}_${user}`; }
function shortName(email) {
  if (!email || email === "Guest") return "Guest";
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/* Save mood */
function saveMood(user, mood) {
  const key = storageKey('moodHistory', user);
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push({ date: new Date().toISOString(), mood: Number(mood) });
  localStorage.setItem(key, JSON.stringify(arr.slice(-100)));
}

/* Save journal */
function saveJournal(user, text) {
  const key = storageKey('journals', user);
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push({ date: new Date().toISOString(), text });
  localStorage.setItem(key, JSON.stringify(arr.slice(-200)));
}

/* ---------- Chart ---------- */
let moodChart = null;
function initChart() {
  const ctx = document.getElementById("moodChart").getContext("2d");
  moodChart = new Chart(ctx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Mood (1-5)', data: [], fill: true }] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      elements: { line: { tension: 0.35 }, point: { radius: 4 } },
      scales: { y: { min: 1, max: 5, ticks: { stepSize: 1 } } },
      plugins: { legend: { display: false } }
    }
  });
}

function loadMoodHistory() {
  const user = localStorage.getItem("loggedInUser") || "Guest";
  const key = storageKey('moodHistory', user);
  const raw = JSON.parse(localStorage.getItem(key) || "[]");
  const dataArr = raw.length ? raw : generateSampleMood();

  const last = dataArr.slice(-14);
  const labels = last.map(i => new Date(i.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const data = last.map(i => Number(i.mood));

  moodChart.data.labels = labels;
  moodChart.data.datasets[0].data = data;
  moodChart.data.datasets[0].borderColor = '#2575fc';
  moodChart.data.datasets[0].backgroundColor = 'rgba(37,117,252,0.18)';
  moodChart.update();

  updateStats();
}

function generateSampleMood() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    arr.push({ date: d.toISOString(), mood: 3 + Math.floor(Math.random() * 3) - 1 });
  }
  return arr;
}

function updateStats() {
  const user = localStorage.getItem("loggedInUser") || "Guest";
  const moods = JSON.parse(localStorage.getItem(storageKey('moodHistory', user)) || "[]");
  const journals = JSON.parse(localStorage.getItem(storageKey('journals', user)) || "[]");
  document.getElementById("statEntries").textContent = moods.length + journals.length;
  document.getElementById("statAvg").textContent = moods.length
    ? (moods.reduce((s, i) => s + Number(i.mood), 0) / moods.length).toFixed(2)
    : "-";
}

function showTempMessage(elId, text, ms = 1800) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  setTimeout(() => { el.textContent = ""; }, ms);
}

/* ---------- Chatbot ---------- */
document.getElementById("chatToggleBtn").addEventListener("click", () => {
  document.getElementById("chatbotContainer").style.display = "flex";
});
document.getElementById("closeChat").addEventListener("click", () => {
  document.getElementById("chatbotContainer").style.display = "none";
});
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

  const sentiment = analyzeSentiment(msg);
  const reply = `Your message seems to have a <b>${sentiment}</b> sentiment.`;
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

/* Simple rule-based sentiment analyzer */
function analyzeSentiment(text) {
  const positive = ['happy', 'great', 'awesome', 'good', 'love', 'excellent'];
  const negative = ['sad', 'bad', 'angry', 'upset', 'terrible', 'hate'];
  text = text.toLowerCase();
  let score = 0;
  positive.forEach(w => { if (text.includes(w)) score++; });
  negative.forEach(w => { if (text.includes(w)) score--; });
  if (score > 0) return 'positive 😊';
  if (score < 0) return 'negative 😞';
  return 'neutral 😐';
}
