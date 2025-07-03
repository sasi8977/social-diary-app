let selectedMood = '';
let entries = [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

// Redirect if not logged in
if (!loggedInUser) {
  window.location.href = "login.html";
}

// Display name
document.addEventListener("DOMContentLoaded", () => {
  // ================= PIN LOCK SCREEN =================
  const pinScreen = document.getElementById("pin-lock");
  const unlockBtn = document.getElementById("unlockBtn");
  const pinInput = document.getElementById("pinInput");
  const pinError = document.getElementById("pinError");

  if (pinScreen && unlockBtn) {
    if (!sessionStorage.getItem("pinUnlocked")) {
      pinScreen.style.display = "flex";
    } else {
      pinScreen.style.display = "none";
    }

    unlockBtn.addEventListener("click", () => {
      const pin = pinInput.value;
      if (pin === "1234") {
        sessionStorage.setItem("pinUnlocked", "true");
        pinScreen.style.display = "none";
        pinError.textContent = "";
      } else {
        pinError.textContent = "â Œ Incorrect PIN. Try again.";
      }
    });
  }

  // ================= AUTH CHECK =================
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!loggedInUser) {
    window.location.href = "login.html";
    return;
  }

  // ================= DATE DISPLAY =================
  const todayDate = document.getElementById("today-date");
  if (todayDate) {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    todayDate.textContent = new Date().toLocaleDateString(undefined, options);
  }

  // ================= MOOD TRACKER =================
  let selectedMood = "";
  document.querySelectorAll(".mood-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedMood = option.dataset.mood;
      document.getElementById("selectedMood").textContent = `You feel: ${selectedMood}`;
    });
  });

  // ================= ENTRY FORM =================
  const diaryForm = document.getElementById("diaryForm");
  const entriesList = document.getElementById("entriesList");
  let entries = JSON.parse(localStorage.getItem("entries") || "[]");

  function saveEntries() {
    localStorage.setItem("entries", JSON.stringify(entries));
  }

  function renderEntries() {
    if (!entriesList) return;
    entriesList.innerHTML = "";
    entries.forEach((entry, index) => {
      const card = document.createElement("div");
      card.className = "entry-card";
      card.innerHTML = `
        <h3>${entry.title}</h3>
        <p><strong>Date:</strong> ${entry.date}</p>
        <p>${entry.content}</p>
        <p><strong>Mood:</strong> ${entry.mood}</p>
        <div class="tags">${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join(" ")}</div>
      `;
      entriesList.appendChild(card);
    });
  }

  renderEntries();

  if (diaryForm) {
    diaryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newEntry = {
        date: document.getElementById("entryDate").value,
        title: document.getElementById("entryTitle").value,
        content: document.getElementById("entryContent").value,
        tags: document.getElementById("tagsInput").value.split(",").map(tag => tag.trim()),
        mood: selectedMood
      };
      entries.push(newEntry);
      saveEntries();
      renderEntries();
      diaryForm.reset();
      document.getElementById("selectedMood").textContent = "";
    });
  }
});
