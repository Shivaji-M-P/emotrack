// ---------- Dashboard behavior ----------
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
      selectedMood = parseInt(btn.dataset.mood,10);
    });
  });

  document.getElementById("submitMood").addEventListener("click", () => {
    if(!selectedMood) { showTempMessage("moodSavedMsg","Please select a mood first.",2500); return; }
    saveMood(loggedInUser,selectedMood);
    showTempMessage("moodSavedMsg","Mood saved ✓",1800);
    selectedMood=null;
    moodButtons.forEach(b=>b.classList.remove("selected"));
    loadMoodHistory();
  });

  document.getElementById("saveJournal").addEventListener("click", ()=>{
    const text=document.getElementById("journalEntry").value.trim();
    if(!text){ showTempMessage("journalSavedMsg","Write something before saving.",2500); return; }
    saveJournal(loggedInUser,text);
    document.getElementById("journalEntry").value="";
    showTempMessage("journalSavedMsg","Journal saved ✓",1800);
    loadJournalHistory();
    updateStats();
  });

  initChart();
  loadMoodHistory();
  loadJournalHistory();
  updateStats();

  // Dark mode toggle
  document.querySelector(".dark-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // Chatbot toggle
  document.getElementById("chatToggleBtn").addEventListener("click", ()=>{
    document.getElementById("chatbotContainer").style.display="flex";
  });
  document.getElementById("closeChat").addEventListener("click", ()=>{
    document.getElementById("chatbotContainer").style.display="none";
  });
  document.getElementById("sendMessage").addEventListener("click", sendChatMessage);
  document.getElementById("userMessage").addEventListener("keypress",(e)=>{ if(e.key==="Enter") sendChatMessage(); });
});

// ---------- Storage & helpers ----------
function storageKey(prefix,user){ return `${prefix}_${user}`; }
function shortName(email){ if(!email||email==="Guest") return "Guest"; const n=email.split('@')[0]; return n.charAt(0).toUpperCase()+n.slice(1); }
function saveMood(user,mood){ 
  const key=storageKey('moodHistory',user);
  const arr=JSON.parse(localStorage.getItem(key)||"[]");
  arr.push({date:new Date().toISOString(), mood:Number(mood)});
  localStorage.setItem(key,JSON.stringify(arr.slice(-100)));
}
function saveJournal(user,text){
  const key=storageKey('journals',user);
  const arr=JSON.parse(localStorage.getItem(key)||"[]");
  arr.push({date:new Date().toISOString(), text});
  localStorage.setItem(key,JSON.stringify(arr.slice(-200)));
}
function showTempMessage(elId,text,ms=1800){ const el=document.getElementById(elId); if(!el) return; el.textContent=text; setTimeout(()=>{el.textContent="";},ms); }

// ---------- Chart ----------
let moodChart=null;
function initChart(){
  const ctx=document.getElementById("moodChart").getContext("2d");
  moodChart=new Chart(ctx,{type:'line',data:{labels:[],datasets:[{label:'Mood (1-5)',data:[],fill:true}]},options:{responsive:true,maintainAspectRatio:false,elements:{line:{tension:0.35},point:{radius:5}},scales:{y:{min:1,max:5,ticks:{stepSize:1}}},plugins:{legend:{display:false}}}});
}
function loadMoodHistory(){
  const user=localStorage.getItem("loggedInUser")||"Guest";
  const key=storageKey('moodHistory',user);
  const raw=JSON.parse(localStorage.getItem(key)||"[]");
  const dataArr=raw.length?raw:generateSampleMood();
  const last=dataArr.slice(-14);
  const labels=last.map(i=>new Date(i.date).toLocaleDateString(undefined,{month:'short',day:'numeric'}));
  const data=last.map(i=>Number(i.mood));
  const colors=last.map(i=>{ switch(Number(i.mood)){case 5:return '#FFD93D'; case 4:return '#6BCB77'; case 3:return '#FF6B6B'; case 2:return '#FF922B'; case 1:return '#4D96FF'; default:return '#2575fc';}});
  moodChart.data.labels=labels;
  moodChart.data.datasets[0].data=data;
  moodChart.data.datasets[0].pointBackgroundColor=colors;
  moodChart.data.datasets[0].borderColor='#2575fc';
  moodChart.data.datasets[0].backgroundColor='rgba(37,117,252,0.18)';
  moodChart.update();
  updateStats();
}
function generateSampleMood(){ const arr=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); arr.push({date:d.toISOString(),mood:3+Math.floor(Math.random()*3)-1}); } return arr; }

// ---------- Journal history ----------
function loadJournalHistory(){
  const user=localStorage.getItem("loggedInUser")||"Guest";
  const journals=JSON.parse(localStorage.getItem(storageKey('journals',user))||"[]");
  const container=document.getElementById("journalHistory");
  container.innerHTML="";
  journals.slice(-10).reverse().forEach(j=>{
    const el=document.createElement("div");
    el.innerHTML=`<small>${new Date(j.date).toLocaleString()}</small><p>${j.text}</p>`;
    container.appendChild(el);
  });
}

// ---------- Stats ----------
function updateStats(){
  const user=localStorage.getItem("loggedInUser")||"Guest";
  const moods=JSON.parse(localStorage.getItem(storageKey('moodHistory',user))||"[]");
  const journals=JSON.parse(localStorage.getItem(storageKey('journals',user))||"[]");
  document.getElementById("statEntries").textContent=moods.length+journals.length;
  document.getElementById("statAvg").textContent=moods.length?(moods.reduce((s,i)=>s+Number(i.mood),0)/moods.length).toFixed(2):"-";
}

// ---------- Chatbot functions (untouched) ----------

// Chatbot toggle
const chatToggleBtn = document.getElementById("chatToggleBtn");
const chatbotContainer = document.getElementById("chatbotContainer");
const closeChatBtn = document.getElementById("closeChat");

chatToggleBtn.addEventListener("click", () => {
  chatbotContainer.style.display = chatbotContainer.style.display === "flex" ? "none" : "flex";
});

closeChatBtn.addEventListener("click", () => {
  chatbotContainer.style.display = "none";
});
