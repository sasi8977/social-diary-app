let selectedMood = "";
let entries = [];
// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(reg => {
        console.log("✅ Service Worker registered:", reg);
      })
      .catch(err => {
        console.error("❌ Service Worker registration failed:", err);
      });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  // Show today's date
  const today = new Date();
  document.getElementById("today-date").textContent = today.toDateString();

  // Load saved entries from localStorage
  if (localStorage.getItem("entries")) {
    entries = JSON.parse(localStorage.getItem("entries"));
    updateEntriesList();
    updateStats();
  }

  // Mood selection
  document.querySelectorAll(".mood-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedMood = option.dataset.mood;
      document.getElementById("selectedMood").textContent = `You feel: ${selectedMood}`;
    });
  });

  // Save diary entry
  document.getElementById("diaryForm").addEventListener("submit", e => {
    e.preventDefault();

    const entry = {
      date: document.getElementById("entryDate").value,
      title: document.getElementById("entryTitle").value,
      content: document.getElementById("entryContent").value,
      mood: selectedMood || "neutral",
      tags: getTagsFromDisplay()
    };

    entries.push(entry);
    localStorage.setItem("entries", JSON.stringify(entries));
    updateEntriesList();
    updateStats();
    e.target.reset();
    document.getElementById("tagsDisplay").innerHTML = "";
    selectedMood = "";
    document.getElementById("selectedMood").textContent = "";
    alert("Entry saved!");
  });

  // Add tag
  document.getElementById("addTagBtn").addEventListener("click", () => {
    const tagInput = document.getElementById("tagsInput");
    const tag = tagInput.value.trim();
    if (tag) {
      const tagSpan = document.createElement("span");
      tagSpan.textContent = tag;
      tagSpan.className = "tag";
      document.getElementById("tagsDisplay").appendChild(tagSpan);
      tagInput.value = "";
    }
  });

  // Search + filter entries
  document.getElementById("searchEntries").addEventListener("input", updateEntriesList);
  document.getElementById("filterMood").addEventListener("change", updateEntriesList);
});

// Utility: Extract tags
function getTagsFromDisplay() {
  return Array.from(document.querySelectorAll("#tagsDisplay .tag")).map(tag => tag.textContent);
}

// Render entries
function updateEntriesList() {
  const list = document.getElementById("entriesList");
  const search = document.getElementById("searchEntries").value.toLowerCase();
  const filterMood = document.getElementById("filterMood").value;
  list.innerHTML = "";

  entries
    .filter(entry =>
      (entry.title.toLowerCase().includes(search) ||
        entry.content.toLowerCase().includes(search)) &&
      (!filterMood || entry.mood === filterMood)
    )
    .forEach(entry => {
      const card = document.createElement("div");
      card.className = "entry-card";

      card.innerHTML = `
        <div class="entry-card-header">
          <div class="entry-date">${entry.date}</div>
          <div class="entry-mood">${getMoodEmoji(entry.mood)} ${entry.mood}</div>
        </div>
        <h3 class="entry-title">${entry.title}</h3>
        <p class="entry-content">${entry.content}</p>
        <div class="entry-tags">
          ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}
        </div>
      `;

      list.appendChild(card);
    });
}

// Helper to show emoji for mood
function getMoodEmoji(mood) {
  const moodMap = {
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    angry: "😠",
    excited: "🤩"
  };
  return moodMap[mood] || "😐";
}

// Stats
function updateStats() {
  document.getElementById("totalEntries").textContent = entries.length;

  const moodCount = {};
  entries.forEach(entry => {
    moodCount[entry.mood] = (moodCount[entry.mood] || 0) + 1;
  });

  let mostFrequentMood = "-";
  let max = 0;
  for (const mood in moodCount) {
    if (moodCount[mood] > max) {
      max = moodCount[mood];
      mostFrequentMood = mood;
    }
  }

  const frequentMoodEl = document.getElementById("frequentMood");
  if (frequentMoodEl) frequentMoodEl.textContent = mostFrequentMood;

  drawMoodChart(moodCount);
}

// Mood chart
function drawMoodChart(data) {
  const ctx = document.getElementById("moodChart");
  if (!ctx) return;

  const labels = Object.keys(data);
  const values = Object.values(data);

  if (window.moodChartInstance) {
    window.moodChartInstance.destroy();
  }

  window.moodChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Mood Count",
        data: values,
        backgroundColor: "#5e60ce"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
// Install PWA Prompt
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the A2HS prompt");
      }
      deferredPrompt = null;
      installBtn.style.display = "none";
    });
  }
});

// Web Share API
const shareBtn = document.getElementById("shareBtn");
if (navigator.share) {
  shareBtn.style.display = "block";
  shareBtn.addEventListener("click", () => {
    navigator.share({
      title: "Social Diary",
      text: "Track your daily mood and thoughts!",
      url: window.location.href,
    });
  });
}
document.addEventListener("DOMContentLoaded", () => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (loggedInUser) {
  document.getElementById("usernameDisplay").textContent = loggedInUser.name;
  const avatarEls = document.querySelectorAll(".avatar, .avatar-circle");
  avatarEls.forEach(el => el.textContent = loggedInUser.name.slice(0, 2).toUpperCase());
}
  // ... your existing DOMContentLoaded code ...

  // 🔐 PIN Lock Setup
  const correctPIN = "1234";
  const pinScreen = document.getElementById("pin-lock");
  const pinInput = document.getElementById("pinInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const pinError = document.getElementById("pinError");

  pinScreen.style.display = "flex"; // Show PIN screen initially

  unlockBtn.addEventListener("click", () => {
    const enteredPIN = pinInput.value.trim();
    if (enteredPIN === correctPIN) {
      pinScreen.style.display = "none";
    } else {
      pinError.textContent = "Incorrect PIN. Try again.";
      pinInput.value = "";
    }
  });
});
// Logout handler
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
}
