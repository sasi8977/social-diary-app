// === Social Diary App - Final Working script.js ===

let selectedMood = '';
let entries = JSON.parse(localStorage.getItem('entries')) || [];

// === PIN Lock ===
document.addEventListener('DOMContentLoaded', () => {
  const pinLock = document.getElementById('pin-lock');
  const unlockBtn = document.getElementById('unlockBtn');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinError');

  if (!localStorage.getItem('pinUnlocked')) {
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

  document.getElementById('today-date').textContent = new Date().toDateString();

  loadEntries();
  setupMoodPicker();
  setupDiaryForm();
  setupTags();
  setupTheme();
  setupProfile();
  setupSettings();
  setupPWA();
  setupViewEntries();
  setupStickers();
  setupLogout();
});

// === Mood ===
function setupMoodPicker() {
  document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener('click', () => {
      selectedMood = option.dataset.mood;
      document.getElementById('selectedMood').textContent = `You feel: ${selectedMood}`;
    });
  });
}

// === Diary Form ===
function setupDiaryForm() {
  const form = document.getElementById('diaryForm');
  if (!form) return;
  const dateField = document.getElementById('entryDate');
  dateField.value = new Date().toISOString().substr(0, 10); // auto-fill today's date

  form.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
      const imageInput = document.getElementById('entryImage');
let imageData = '';
if (imageInput && imageInput.files[0]) {
  const reader = new FileReader();
  reader.onload = function(e) {
    imageData = e.target.result;

    // Proceed to save entry after image is loaded
    saveEntry(imageData);
  };
  reader.readAsDataURL(imageInput.files[0]);
} else {
  // If no image selected, save entry immediately
  saveEntry('');
}

      id: Date.now(),
      date: dateField.value,
      title: document.getElementById('entryTitle').value,
      content: document.getElementById('entryContent').value,
      mood: selectedMood,
      tags: Array.from(document.querySelectorAll('#tagsDisplay .tag')).map(t => t.textContent)
    };
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    alert('Saved!');
    form.reset();
    selectedMood = '';
    document.getElementById('selectedMood').textContent = '';
    document.getElementById('tagsDisplay').innerHTML = '';
    loadEntries();
  });
function saveEntry(imageData) {
  const entry = {
    id: Date.now(),
    date: document.getElementById('entryDate').value,
    title: document.getElementById('entryTitle').value,
    content: document.getElementById('entryContent').value,
    mood: selectedMood,
    tags: Array.from(document.querySelectorAll('#tagsDisplay .tag')).map(t => t.textContent),
    image: imageData
  };
  entries.push(entry);
  localStorage.setItem('entries', JSON.stringify(entries));
  alert('Saved!');
  document.getElementById('diaryForm').reset();
  selectedMood = '';
  document.getElementById('selectedMood').textContent = '';
  document.getElementById('tagsDisplay').innerHTML = '';
  loadEntries();
}

// === Tags ===
function setupTags() {
  const addBtn = document.getElementById('addTagBtn');
  if (!addBtn) return;
  addBtn.addEventListener('click', () => {
    const input = document.getElementById('tagsInput');
    const value = input.value.trim();
    if (value) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = value;
      document.getElementById('tagsDisplay').appendChild(tag);
      input.value = '';
    }
  });
}

// === View Entries ===
function loadEntries() {
  const list = document.getElementById('entriesList');
  if (!list) return;
  list.innerHTML = '';
  entries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `<h3>${entry.title}</h3><p>${entry.date}</p><p>${entry.mood}</p>`${entry.image ?'<img src="${entry.image}"
      class="entry-thumb" alt="entry photo"/>':''}';
    card.addEventListener('click', () => showEntryDetail(entry));
    list.appendChild(card);
  });
}

function showEntryDetail(entry) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('entryDetailSection').classList.add('active');
  document.getElementById('detailTitle').textContent = entry.title;
  document.getElementById('detailDate').textContent = entry.date;
  document.getElementById('detailMood').textContent = entry.mood;
  document.getElementById('detailContent').textContent = entry.content;
  const imageEl = document.getElementById('detailImage');
if (imageEl) {
  if (entry.image) {
    imageEl.src = entry.image;
    imageEl.style.display = 'block';
  } else {
    imageEl.style.display = 'none';
  }
}

  document.getElementById('detailTags').innerHTML = entry.tags.map(t => `<span class="tag">${t}</span>`).join('');

  document.getElementById('backToListBtn').onclick = () => showSection('viewEntriesSection');
  document.getElementById('editEntryBtn').onclick = () => alert('Edit not yet implemented.');
  document.getElementById('deleteEntryBtn').onclick = () => {
    entries = entries.filter(e => e.id !== entry.id);
    localStorage.setItem('entries', JSON.stringify(entries));
    showSection('viewEntriesSection');
    loadEntries();
  };
}

function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

function setupViewEntries() {
  const btn = document.getElementById('viewEntriesBtn');
  if (!btn) return;
  btn.addEventListener('click', () => showSection('viewEntriesSection'));
}

// === Theme ===
function setupTheme() {
  const select = document.getElementById('themeSelect');
  if (!select) return;
  const current = localStorage.getItem('theme') || 'light';
  select.value = current;
  document.body.className = current;
  select.addEventListener('change', () => {
    localStorage.setItem('theme', select.value);
    document.body.className = select.value;
  });
}

// === Avatar/Profile ===
function setupProfile() {
  const input = document.getElementById('profilePicInput');
  const img = document.getElementById('profilePic');
   const saved = localStorage.getItem('avatarImage');
  const headerAvatar = document.getElementById('profilePicHeader');
  if (saved && img) img.src = saved;
 if (input) {
    input.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          if (img) img.src = e.target.result;
          if (headerAvatar) headerAvatar.src = e.target.result;
          localStorage.setItem('avatarImage', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.username){
      const display =document.getElementById('usernameDisplay');
      const sidebarDisplay =document.getElementById('sidebarUsername');
      if (display) display.textContent = `Hi, ${user.username} 👋`;
      if (sidebarDisplay)sidebarDisplay.textContent =user.username;
    }
}

// === Settings ===
function setupSettings() {
  const settingsBtn = document.getElementById('settingsBtn');
  const newEntryBtn = document.getElementById('newEntryBtn');
  const statsBtn = document.getElementById('statsBtn');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const exportBtn = document.getElementById('exportDataBtn');
  const importBtn = document.getElementById('importDataBtn');
  const importInput = document.getElementById('importDataInput');

  if (settingsBtn) settingsBtn.onclick = () => showSection('settingsSection');
  if (newEntryBtn) newEntryBtn.onclick = () => showSection('newEntrySection');
  if (statsBtn) statsBtn.onclick = () => showSection('statsSection');
  if (saveBtn) saveBtn.onclick = () => alert('Settings saved!');

  if (exportBtn) {
    exportBtn.onclick = () => {
      const blob = new Blob([JSON.stringify(entries)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diary-entries.json';
      a.click();
    };
  }

  if (importBtn && importInput) {
    importBtn.onclick = () => importInput.click();
    importInput.addEventListener('change', function () {
      const file = this.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = e => {
        try {
          entries = JSON.parse(e.target.result);
          localStorage.setItem('entries', JSON.stringify(entries));
          alert('Data imported!');
          loadEntries();
        } catch {
          alert('Invalid file.');
        }
      };
      reader.readAsText(file);
    });
  }
}

// === Emoji / Stickers ===
function setupStickers() {
  const stickerBtn = document.getElementById('toggleEmojiPicker');
  const list = document.getElementById('emojiList');
  const textarea = document.getElementById('entryContent');
  if (!stickerBtn || !list || !textarea) return;

  const emojis = ['😀', '😂', '😍', '🥳', '😢', '😎', '🤔', '😠', '👍', '🎉'];
  list.innerHTML = emojis.map(e => `<button class='emoji-btn'>${e}</button>`).join('');
  list.style.display = 'none';

  stickerBtn.addEventListener('click', () => {
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
  });

  list.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      textarea.value += btn.textContent;
    });
  });
}

// === PWA Installation + Sharing ===
function setupPWA() {
  let deferredPrompt;
  const installBtn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.style.display = 'inline-block';
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

  const shareBtn = document.getElementById('shareBtn');
  if (navigator.share && shareBtn) {
    shareBtn.style.display = 'inline-block';
    shareBtn.addEventListener('click', async () => {
      await navigator.share({
        title: 'Social Diary',
        text: 'Check out my diary app!',
        url: window.location.href
      });
    });
  }
}

// === Logout ===
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('pinUnlocked');
      window.location.href = 'login.html';
    });
  }
}
