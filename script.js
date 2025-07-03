let selectedMood = '';
let entries = [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

// Redirect if not logged in
if (!loggedInUser) {
  window.location.href = "login.html";
}

// Display name
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("usernameDisplay").textContent = loggedInUser.name || "User";
  document.getElementById("today-date").textContent = new Date().toDateString();

  // PIN Lock Handling
  const pinScreen = document.getElementById("pin-lock");
  const unlockBtn = document.getElementById("unlockBtn");
  const pinInput = document.getElementById("pinInput");
  const pinError = document.getElementById("pinError");

  if (!sessionStorage.getItem("unlocked")) {
    pinScreen.style.display = "flex";
  }

  unlockBtn.addEventListener("click", () => {
    const pin = pinInput.value;
    if (pin === "1234") {
      pinScreen.style.display = "none";
      sessionStorage.setItem("unlocked", "true");
    } else {
      pinError.textContent = "Incorrect PIN. Try again.";
    }
  });

  // Mood selection
  document.querySelectorAll(".mood-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedMood = option.dataset.mood;
      document.getElementById("selectedMood").textContent = `You feel: ${selectedMood}`;
    });
  });

  // Diary entry save
  const diaryForm = document.getElementById("diaryForm");
  diaryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const entry = {
      date: document.getElementById("entryDate").value,
      title: document.getElementById("entryTitle").value,
      content: document.getElementById("entryContent").value,
      tags: [],
      mood: selectedMood,
    };

    entries.push(entry);
    localStorage.setItem("entries", JSON.stringify(entries));
    diaryForm.reset();
    alert("Diary entry saved!");
  });

  // Load saved entries
  const saved = localStorage.getItem("entries");
  if (saved) {
    entries = JSON.parse(saved);
  }

  // Profile picture upload
  const input = document.getElementById("profilePicInput");
  const img = document.getElementById("profilePic");

  input.addEventListener("change", () => {
    const reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
      localStorage.setItem("profilePic", e.target.result);
    };
    reader.readAsDataURL(input.files[0]);
  });

  // Load stored profile picture
  const storedPic = localStorage.getItem("profilePic");
  if (storedPic) {
    img.src = storedPic;
  }

});
