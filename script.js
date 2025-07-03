let selectedMood = '';
let entries = [];
let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

// Redirect to login if not logged in
if (!loggedInUser && window.location.pathname.includes("index")) {
  window.location.href = "login.html";
}

// PIN Unlock
document.addEventListener("DOMContentLoaded", () => {
  const pinScreen = document.getElementById("pin-lock");
  const pinInput = document.getElementById("pinInput");
  const unlockBtn = document.getElementById("unlockBtn");
  const pinError = document.getElementById("pinError");

  if (pinScreen && loggedInUser) {
    pinScreen.style.display = "flex";
    unlockBtn.addEventListener("click", () => {
      const enteredPin = pinInput.value;
      if (enteredPin === "1234") {
        pinScreen.style.display = "none";
        pinInput.value = "";
        pinError.textContent = "";
      } else {
        pinError.textContent = "Incorrect PIN. Try again.";
      }
    });
  }

  // Mood selection
  document.querySelectorAll(".mood-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedMood = option.dataset.mood;
      document.getElementById("selectedMood").textContent = `You feel: ${selectedMood}`;
    });
  });

  // Diary Form Submission
  const diaryForm = document.getElementById("diaryForm");
  if (diaryForm) {
    diaryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const newEntry = {
        date: document.getElementById("entryDate").value,
        title: document.getElementById("entryTitle").value,
        content: document.getElementById("entryContent").value,
        mood: selectedMood,
        tags: Array.from(document.querySelectorAll(".tag")).map(tag => tag.textContent)
      };
      entries.push(newEntry);
      saveEntries();
      displayEntries();
      diaryForm.reset();
      document.getElementById("tagsDisplay").innerHTML = "";
    });
  }

  // Tag Adding
  const addTagBtn = document.getElementById("addTagBtn");
  if (addTagBtn) {
    addTagBtn.addEventListener("click", () => {
      const tagInput = document.getElementById("tagsInput");
      const tag = tagInput.value.trim();
      if (tag) {
        const tagElement = document.createElement("span");
        tagElement.className = "tag";
        tagElement.textContent = tag;
        document.getElementById("tagsDisplay").appendChild(tagElement);
        tagInput.value = "";
      }
    });
  }

  // Show Date
  const dateDisplay = document.getElementById("today-date");
  if (dateDisplay) dateDisplay.textContent = new Date().toDateString();

  loadEntries();
  displayEntries();
});

function saveEntries() {
  localStorage.setItem("entries", JSON.stringify(entries));
}

function loadEntries() {
  const storedEntries = localStorage.getItem("entries");
  if (storedEntries) {
    entries = JSON.parse(storedEntries);
  }
}

function displayEntries() {
  const list = document.getElementById("entriesList");
  if (!list) return;
  list.innerHTML = "";
  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card";
    card.innerHTML = `
      <h3>${entry.title}</h3>
      <p><strong>Date:</strong> ${entry.date}</p>
      <p><strong>Mood:</strong> ${entry.mood}</p>
      <p>${entry.content}</p>
      <div class="tags">
        ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
      </div>
    `;
    list.appendChild(card);
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
  });
}

// Profile Name
const usernameDisplay = document.getElementById("usernameDisplay");
if (usernameDisplay && loggedInUser?.username) {
  usernameDisplay.textContent = loggedInUser.username;
}

// Profile Picture Upload
const profilePicInput = document.getElementById("profilePicInput");
const profilePic = document.getElementById("profilePic");

if (profilePicInput && profilePic) {
  profilePicInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePic.src = e.target.result;
        localStorage.setItem("profilePic", e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  // Load stored picture if exists
  const savedPic = localStorage.getItem("profilePic");
  if (savedPic) profilePic.src = savedPic;
}

