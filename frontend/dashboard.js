// Dashboard behaviour (frontend-only)
// Stores mood & journal in localStorage per user for demo (no backend required).

document.addEventListener("DOMContentLoaded", () => {
  const welcomeText = document.getElementById("welcomeText");
  const logoutBtn = document.getElementById("logoutBtn");
  const loggedInUser = localStorage.getItem("loggedInUser") || "Guest";

  welcomeText.textContent = `Hello, ${shortName(loggedInUser)}`;

  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  });

  // Mood UI
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

  // Journal
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

  // Initialize chart and data
  initChart();
  loadMoodHistory();
  updateStats();
});

/* ---------- storage helpers ---------- */
function storageKey(prefix, user) {
  return `${prefix}_${user}`;
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function shortName(email) {
  if (!email || email === "Guest") return "Guest";
  const name = email.split('@')[0];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/* Save mood (localStorage) */
function saveMood(user, mood) {
  const key = storageKey('moodHistory', user);
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.push({ date: new Date().toISOString(), mood: Number(mood) });
  // keep last 100 entries max
  const trimmed = arr.slice(-100);
  localStorage.setItem(key, JSON.stringify(trimmed));
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
      scales: {
        y: { min: 1, max: 5, ticks: { stepSize: 1 } },
        x: { ticks: { maxRotation: 0, minRotation: 0 } }
      },
      plugins: { legend: { display: false } }
    }
  });
}

/* Load mood history and render chart */
function loadMoodHistory() {
  const user = localStorage.getItem("loggedInUser") || "Guest";
  const key = storageKey('moodHistory', user);
  const raw = JSON.parse(localStorage.getItem(key) || "[]");

  // If no data, create sample for visual (optional)
  const dataArr = raw.length ? raw : generateSampleMood();

  // Use last 14 entries
  const last = dataArr.slice(-14);
  const labels = last.map(item => {
    const d = new Date(item.date);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  });
  const data = last.map(item => Number(item.mood));

  // update chart
  moodChart.data.labels = labels;
  moodChart.data.datasets[0].data = data;
  moodChart.data.datasets[0].borderColor = '#2575fc';
  moodChart.data.datasets[0].backgroundColor = 'rgba(37,117,252,0.18)';
  moodChart.update();

  updateStats();
}

/* If no mood data, show friendly sample */
function generateSampleMood() {
  const arr = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    arr.push({ date: d.toISOString(), mood: 3 + Math.floor(Math.random() * 3) - 1 }); // 2..4
  }
  return arr;
}

/* ---------- stats ---------- */
function updateStats() {
  const user = localStorage.getItem("loggedInUser") || "Guest";
  const moods = JSON.parse(localStorage.getItem(storageKey('moodHistory', user)) || "[]");
  const journals = JSON.parse(localStorage.getItem(storageKey('journals', user)) || "[]");

  document.getElementById("statEntries").textContent = moods.length + journals.length;
  if (moods.length) {
    const avg = (moods.reduce((s, i) => s + Number(i.mood), 0) / moods.length).toFixed(2);
    document.getElementById("statAvg").textContent = avg;
  } else {
    document.getElementById("statAvg").textContent = "-";
  }
}

/* ---------- small UI helpers ---------- */
function showTempMessage(elId, text, ms = 1800) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  setTimeout(() => { el.textContent = ""; }, ms);
}
