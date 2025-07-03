// Check if user is logged in before showing main app
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // Show PIN lock
  const pinLockScreen = document.getElementById("pin-lock");
  pinLockScreen.style.display = "flex";

  const unlockBtn = document.getElementById("unlockBtn");
  const pinInput = document.getElementById("pinInput");
  const pinError = document.getElementById("pinError");

  unlockBtn.addEventListener("click", () => {
    const enteredPin = pinInput.value.trim();
    if (enteredPin === "1234") {
      pinLockScreen.style.display = "none";
    } else {
      pinError.textContent = "Incorrect PIN. Try again.";
    }
  });

  // Show user name
  document.getElementById("usernameDisplay").textContent = currentUser.name || "User";

  // Profile pic handling
  const profilePicInput = document.getElementById("profilePicInput");
  const profilePic = document.getElementById("profilePic");

  profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        profilePic.src = reader.result;
        localStorage.setItem("profilePic", reader.result);
      };
      reader.readAsDataURL(file);
    }
  });

  const savedPic = localStorage.getItem("profilePic");
  if (savedPic) profilePic.src = savedPic;

  // Mood selection
  let selectedMood = "";
  document.querySelectorAll(".mood-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedMood = option.dataset.mood;
      document.getElementById("selectedMood").textContent = `You feel: ${selectedMood}`;
    });
  });

  // Entries
  let entries = JSON.parse(localStorage.getItem("entries")) || [];

  const diaryForm = document.getElementById("diaryForm");
  diaryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const entry = {
      date: document.getElementById("entryDate").value,
      title: document.getElementById("entryTitle").value,
      content: document.getElementById("entryContent").value,
      tags: Array.from(document.querySelectorAll(".tag")).map(tag => tag.textContent),
      mood: selectedMood
    };
    entries.push(entry);
    localStorage.setItem("entries", JSON.stringify(entries));
    alert("Diary entry saved!");
    diaryForm.reset();
    document.getElementById("tagsDisplay").innerHTML = "";
  });

  // Tags
  document.getElementById("addTagBtn").addEventListener("click", () => {
    const tagInput = document.getElementById("tagsInput");
    const tag = tagInput.value.trim();
    if (tag) {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      document.getElementById("tagsDisplay").appendChild(span);
      tagInput.value = "";
    }
  });

  // Date
  document.getElementById("today-date").textContent = new Date().toDateString();
});
