// === USER LOGIN & PIN ===
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (!currentUser) {
  window.location.href = "login.html";
} else {
  document.getElementById("usernameDisplay").textContent = currentUser.name || "User";
}

// === PIN LOCK ===
const pinLockScreen = document.getElementById("pin-lock");
const pinInput = document.getElementById("pinInput");
const unlockBtn = document.getElementById("unlockBtn");
const pinError = document.getElementById("pinError");

unlockBtn.addEventListener("click", () => {
  if (pinInput.value === "1234") {
    pinLockScreen.style.display = "none";
  } else {
    pinError.textContent = "Incorrect PIN. Please try again.";
  }
});

// Show today's date
const todayDate = document.getElementById("today-date");
const today = new Date();
todayDate.textContent = today.toDateString();

// === Mood Selection ===
let selectedMood = "";
document.querySelectorAll(".mood-option").forEach(option => {
  option.addEventListener("click", () => {
    selectedMood = option.dataset.mood;
    document.getElementById("selectedMood").textContent = `You feel: ${selectedMood}`;
  });
});

// === Diary Form Logic ===
const diaryForm = document.getElementById("diaryForm");
const entries = JSON.parse(localStorage.getItem("entries") || "[]");

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

diaryForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const newEntry = {
    date: document.getElementById("entryDate").value,
    title: document.getElementById("entryTitle").value,
    content: document.getElementById("entryContent").value,
    tags: [...document.querySelectorAll(".tag")].map(tag => tag.textContent),
    mood: selectedMood
  };
  entries.push(newEntry);
  saveEntries();
  diaryForm.reset();
  selectedMood = "";
  document.getElementById("selectedMood").textContent = "";
  alert("Entry saved!");
});

// === Tag Adding Logic ===
const addTagBtn = document.getElementById("addTagBtn");
const tagsInput = document.getElementById("tagsInput");
const tagsDisplay = document.getElementById("tagsDisplay");

addTagBtn.addEventListener("click", () => {
  const tagText = tagsInput.value.trim();
  if (tagText) {
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = tagText;
    tagsDisplay.appendChild(span);
    tagsInput.value = "";
  }
});

// === Install PWA ===
let deferredPrompt;
const installBtn = document.getElementById("installBtn");
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "inline-block";
});

installBtn.addEventListener("click", async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      installBtn.style.display = "none";
    }
  }
});

// === Share App ===
const shareBtn = document.getElementById("shareBtn");
if (navigator.share) {
  shareBtn.style.display = "inline-block";
  shareBtn.addEventListener("click", async () => {
    await navigator.share({
      title: "Social Diary",
      text: "Check out this Social Diary app!",
      url: window.location.href
    });
  });
}

