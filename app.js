// ---------- CONFIG ----------
const PASSWORD = "LondonParis2026"; // change if you like
const DEPARTURE = new Date("2026-06-11T00:00:00");

// ---------- STATE ----------
let tasks = [];
let completed = JSON.parse(localStorage.getItem("completedTasks")) || [];
let packing = JSON.parse(localStorage.getItem("packingItems")) || {};
let xp = parseInt(localStorage.getItem("xp") || "0", 10);
let streak = parseInt(localStorage.getItem("streak") || "0", 10);
let lastDay = localStorage.getItem("lastDay") || null;
let soundOn = localStorage.getItem("soundOn") !== "false";

// ---------- SIMPLE SOUND ----------
function playDing() {
  if (!soundOn) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle";
  o.frequency.value = 880;
  o.connect(g);
  g.connect(ctx.destination);
  o.start();
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
}

// ---------- LOGIN ----------
function checkPassword() {
  const input = document.getElementById("password-input").value;
  if (input === PASSWORD) {
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("app-content").style.display = "block";
    playDing();
  } else {
    document.getElementById("error").innerText = "Incorrect password";
  }
}
window.checkPassword = checkPassword;

// ---------- TASK DATA ----------
tasks = [
  {
    title: "Check passport expiration",
    category: "Documents",
    detail: "Make sure every passport is valid at least 3 months beyond your return date.",
    tip: "If anything is close, start renewal now."
  },
  {
    title: "Confirm UK ETA / visa",
    category: "Documents",
    detail: "Use the official UK gov checker to see if you need an ETA or visa.",
    tip: "Search: gov.uk check UK visa."
  },
  {
    title: "Confirm ETIAS / Schengen rules",
    category: "Documents",
    detail: "Check if ETIAS is active for your nationality and dates.",
    tip: "Use official EU ETIAS site."
  },
  {
    title: "Choose travel insurance plan",
    category: "Health",
    detail: "Compare at least 2 plans that cover UK + France, emergency medical, and pre-existing conditions.",
    tip: "Look at Squaremouth or InsureMyTrip."
  },
  {
    title: "Buy universal travel adapter",
    category: "Tech",
    detail: "Get a universal adapter with USB-A and USB-C for UK + EU.",
    tip: "Look for 100–240V compatibility."
  },
  {
    title: "Pick carry-on luggage for each traveler",
    category: "Luggage",
    detail: "Aim for lightweight, wheeled carry-ons that handle trains and cobblestones well.",
    tip: "Travel Fashion Girl and similar sites recommend versatile layers and light bags for London/Paris in June."
  },
  {
    title: "Print London Tube map",
    category: "Maps",
    detail: "Download from TfL and print with large fonts.",
    tip: "Highlight your hotel and key sights."
  },
  {
    title: "Print Paris Metro map",
    category: "Maps",
    detail: "Download from RATP and print with large fonts.",
    tip: "Mark your hotel and main stations."
  },
  {
    title: "Plan airport → hotel (London)",
    category: "Logistics",
    detail: "Decide between train, taxi, or car service and note the route.",
    tip: "Write it on your printed map."
  },
  {
    title: "Plan airport → hotel (Paris)",
    category: "Logistics",
    detail: "Choose RER, taxi, or shuttle and note backup options.",
    tip: "Include approximate cost and time."
  },
  {
    title: "Create shared packing list",
    category: "Packing",
    detail: "One list for the whole group, then personalize.",
    tip: "Use this app’s packing checklist as a base."
  },
  {
    title: "Check meds for 80-year-old traveler",
    category: "Health",
    detail: "Ensure enough medication + supplies for trip plus extra days.",
    tip: "Ask doctor for a summary letter."
  },
  {
    title: "Download offline maps (London & Paris)",
    category: "Tech",
    detail: "Use Google Maps offline for both cities.",
    tip: "Mark hotel, hospitals, and key sights."
  },
  {
    title: "Learn 5 French phrases",
    category: "Culture",
    detail: "Bonjour, merci, s’il vous plaît, excusez-moi, parlez-vous anglais ?",
    tip: "Practice out loud once."
  },
  {
    title: "Plan 1 kid-friendly activity per city",
    category: "Fun",
    detail: "Think museums with hands-on exhibits, parks, or boat rides.",
    tip: "Natural History Museum (London), Luxembourg Gardens (Paris) are great options."
  },
  {
    title: "Plan 1 senior-friendly activity per city",
    category: "Fun",
    detail: "Low-stairs, lots of seating, good views.",
    tip: "River cruises and gardens are usually ideal."
  }
];

// ---------- PACKING DATA ----------
const packingItems = [
  { key: "layers", label: "Light layers (cardigan, light sweater)" },
  { key: "comfortable-shoes", label: "Comfortable walking shoes (already broken in)" },
  { key: "rain-jacket", label: "Light rain jacket" },
  { key: "umbrella", label: "Compact umbrella" },
  { key: "adapters", label: "Universal power adapter (UK + EU)" },
  { key: "daypack", label: "Daypack / personal item bag" },
  { key: "packing-cubes", label: "Packing cubes for organization" },
  { key: "meds", label: "Medications + copies of prescriptions" },
  { key: "diabetes-kit", label: "Diabetes supplies + snacks" },
  { key: "documents", label: "Passports, insurance, tickets (printed + digital)" },
  { key: "reusable-bottle", label: "Reusable water bottle" },
  { key: "scarf", label: "Scarf/light wrap (good for churches & chill)" }
];

// ---------- RENDER TASKS ----------
function renderTasks() {
  const container = document.getElementById("task-container");
  container.innerHTML = "";

  tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task-card";
    if (completed.includes(index)) div.classList.add("completed");

    div.innerHTML = `
      <div class="task-title">${task.title}</div>
      <div class="task-meta">${task.category}</div>
      <div class="task-tip">${task.detail}</div>
      <div class="task-tip"><em>${task.tip}</em></div>
    `;

    div.onclick = () => toggleTask(index);
    container.appendChild(div);
  });
}

function toggleTask(index) {
  if (completed.includes(index)) {
    completed = completed.filter(i => i !== index);
    xp = Math.max(0, xp - 5);
  } else {
    completed.push(index);
    xp += 10;
    playDing();
  }
  localStorage.setItem("completedTasks", JSON.stringify(completed));
  localStorage.setItem("xp", xp.toString());
  updateProgress();
  updateStats();
  renderTasks();
}

// ---------- PROGRESS / STATS ----------
function updateProgress() {
  const percent = tasks.length ? (completed.length / tasks.length) * 100 : 0;
  document.getElementById("progress-bar").style.width = percent + "%";
}

function updateStats() {
  document.getElementById("xp").innerText = xp;
  const level = 1 + Math.floor(xp / 100);
  document.getElementById("level").innerText = level;

  // streak
  const today = new Date().toISOString().slice(0,10);
  if (lastDay !== today) {
    if (lastDay) {
      const diff = (new Date(today) - new Date(lastDay)) / (1000*60*60*24);
      if (diff === 1) streak += 1;
      else streak = 1;
    } else {
      streak = 1;
    }
    lastDay = today;
    localStorage.setItem("streak", streak.toString());
    localStorage.setItem("lastDay", lastDay);
  }
  document.getElementById("streak").innerText = streak;
}

// ---------- COUNTDOWN ----------
function updateCountdown() {
  const now = new Date();
  const diff = DEPARTURE - now;
  if (diff <= 0) return;

  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const mins = Math.floor((diff / (1000*60)) % 60);

  document.getElementById("days-left").innerText = days;
  document.getElementById("hours-left").innerText = hours;
  document.getElementById("mins-left").innerText = mins;
}

// ---------- PACKING ----------
function renderPacking() {
  const container = document.getElementById("packing-container");
  container.innerHTML = "";

  packingItems.forEach(item => {
    const checked = !!packing[item.key];
    const div = document.createElement("div");
    div.className = "packing-item";
    div.innerHTML = `
      <input type="checkbox" id="pack-${item.key}" ${checked ? "checked" : ""}>
      <label for="pack-${item.key}">${item.label}</label>
    `;
    const input = div.querySelector("input");
    input.onchange = () => {
      packing[item.key] = input.checked;
      localStorage.setItem("packingItems", JSON.stringify(packing));
    };
    container.appendChild(div);
  });
}

// ---------- SOUND TOGGLE ----------
function initSoundToggle() {
  const toggle = document.getElementById("sound-toggle");
  toggle.checked = soundOn;
  toggle.onchange = () => {
    soundOn = toggle.checked;
    localStorage.setItem("soundOn", soundOn ? "true" : "false");
  };
}

// ---------- INIT ----------
function init() {
  document.getElementById("app-content").style.display = "none"; // hidden until login
  renderTasks();
  updateProgress();
  updateStats();
  renderPacking();
  initSoundToggle();
  updateCountdown();
  setInterval(updateCountdown, 60000);
}

document.addEventListener("DOMContentLoaded", init);
