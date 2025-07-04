// ✅ Full JavaScript for Social Diary App

let selectedMood = '';
let entries = JSON.parse(localStorage.getItem('entries')) || [];

// 🔐 PIN Lock Logic
window.addEventListener('DOMContentLoaded', () => {
  const pinLock = document.getElementById('pin-lock');
  const unlockBtn = document.getElementById('unlockBtn');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinError');

  const savedPinUnlocked = localStorage.getItem('pinUnlocked');
  if (!savedPinUnlocked) {
    pinLock.style.display = 'flex';
  }

  unlockBtn.addEventListener('click', () => {
    if (pinInput.value === '1234') {
      localStorage.setItem('pinUnlocked', 'true');
      pinLock.style.display = 'none';
    } else {
      pinError.textContent = 'Incorrect PIN. Try again.';
    }
  });

  showSection('newEntrySection');
  loadEntries();
  updateStats();
});

// 📅 Show Today’s Date
const today = new Date();
document.getElementById('today-date').textContent = today.toDateString();

// 😊 Mood Picker
const moodOptions = document.querySelectorAll('.mood-option');
moodOptions.forEach(option => {
  option.addEventListener('click', () => {
    selectedMood = option.dataset.mood;
    document.getElementById('selectedMood').textContent = `You feel: ${selectedMood}`;
  });
});

// 📝 Save Diary Entry
const diaryForm = document.getElementById('diaryForm');
if (diaryForm) {
  diaryForm.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
      date: document.getElementById('entryDate').value,
      title: document.getElementById('entryTitle').value,
      content: document.getElementById('entryContent').value,
      mood: selectedMood,
      tags: Array.from(document.querySelectorAll('#tagsDisplay .tag')).map(tag => tag.textContent)
    };
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    alert('Diary entry saved!');
    diaryForm.reset();
    document.getElementById('tagsDisplay').innerHTML = '';
    selectedMood = '';
    document.getElementById('selectedMood').textContent = '';
    loadEntries();
    updateStats();
  });
}

// 🔖 Tag Management
const tagsInput = document.getElementById('tagsInput');
const addTagBtn = document.getElementById('addTagBtn');
const tagsDisplay = document.getElementById('tagsDisplay');
if (addTagBtn) {
  addTagBtn.addEventListener('click', () => {
    const tagText = tagsInput.value.trim();
    if (tagText) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = tagText;
      tagsDisplay.appendChild(tag);
      tagsInput.value = '';
    }
  });
}

// 📂 Load Entries
function loadEntries() {
  const entriesList = document.getElementById('entriesList');
  if (!entriesList) return;
  entriesList.innerHTML = '';
  entries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <h3>${entry.title}</h3>
      <p>${entry.date} — Mood: ${entry.mood}</p>
      <p>${entry.content}</p>
      <div class="tags">${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
      <div class="entry-actions">
        <button onclick="editEntry(${index})">Edit</button>
        <button onclick="deleteEntry(${index})">Delete</button>
      </div>
    `;
    entriesList.appendChild(card);
  });
}

function editEntry(index) {
  const entry = entries[index];
  document.getElementById('entryDate').value = entry.date;
  document.getElementById('entryTitle').value = entry.title;
  document.getElementById('entryContent').value = entry.content;
  selectedMood = entry.mood;
  document.getElementById('selectedMood').textContent = `You feel: ${selectedMood}`;
  document.getElementById('tagsDisplay').innerHTML = entry.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
  entries.splice(index, 1);
  localStorage.setItem('entries', JSON.stringify(entries));
  showSection('newEntrySection');
}

function deleteEntry(index) {
  if (confirm('Are you sure you want to delete this entry?')) {
    entries.splice(index, 1);
    localStorage.setItem('entries', JSON.stringify(entries));
    loadEntries();
    updateStats();
  }
}

// 📊 Update Stats
function updateStats() {
  document.getElementById('totalEntries').textContent = entries.length;
  // Add more logic for mostActiveDay and chart later
}

// 🎨 Theme Switching
const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
  themeSelect.addEventListener('change', () => {
    document.documentElement.setAttribute('data-theme', themeSelect.value);
    localStorage.setItem('theme', themeSelect.value);
  });
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeSelect.value = savedTheme;
  }
}

// ⚙ Save Settings
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
if (saveSettingsBtn) {
  saveSettingsBtn.addEventListener('click', e => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || {};
    currentUser.username = username;
    localStorage.setItem("loggedInUser", JSON.stringify(currentUser));
    document.getElementById('usernameDisplay').textContent = username;
    alert('Settings saved!');
  });
}

// 🔁 Export Data
const exportDataBtn = document.getElementById('exportDataBtn');
if (exportDataBtn) {
  exportDataBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(entries);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diary-entries.json';
    a.click();
  });
}

// 🔁 Import Data
const importDataBtn = document.getElementById('importDataBtn');
const importDataInput = document.getElementById('importDataInput');
if (importDataBtn && importDataInput) {
  importDataBtn.addEventListener('click', () => importDataInput.click());
  importDataInput.addEventListener('change', () => {
    const file = importDataInput.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      entries = JSON.parse(e.target.result);
      localStorage.setItem('entries', JSON.stringify(entries));
      loadEntries();
      updateStats();
    };
    reader.readAsText(file);
  });
}

// 🚪 Logout
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("pinUnlocked");
    window.location.href = "login.html";
  });
}

// 🔄 Section Switching
function showSection(id) {
  document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active');
}

// 📲 PWA Install
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});
if (installBtn) {
  installBtn.addEventListener('click', () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(choice => {
      if (choice.outcome === 'accepted') {
        installBtn.style.display = 'none';
      }
    });
  });
}

// 🔗 Share App
const shareBtn = document.getElementById('shareBtn');
if (navigator.share && shareBtn) {
  shareBtn.style.display = 'inline-block';
  shareBtn.addEventListener('click', async () => {
    await navigator.share({
      title: 'Social Diary',
      text: 'Check out my digital diary!',
      url: window.location.href
    });
  });
}

// 🖼️ Avatar Upload
const profilePicInput = document.getElementById('profilePicInput');
const profilePic = document.getElementById('profilePic');

if (profilePicInput && profilePic) {
  profilePicInput.addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profilePic.src = e.target.result;
        localStorage.setItem('avatarImage', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  });

  const savedAvatar = localStorage.getItem('avatarImage');
  if (savedAvatar) {
    profilePic.src = savedAvatar;
  }
}

// 👤 Show Username
const usernameDisplay = document.getElementById('usernameDisplay');
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (currentUser && currentUser.username) {
  usernameDisplay.textContent = currentUser.username;
}

// 🔙 Back Button
const backToListBtn = document.getElementById('backToListBtn');
if (backToListBtn) {
  backToListBtn.addEventListener('click', () => {
    showSection('viewEntriesSection');
  });
}


