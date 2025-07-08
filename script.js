// === Social Diary App - Working script.js (with emoji/logout issues only) ===

let selectedMood = '';
let entries = JSON.parse(localStorage.getItem('entries')) || [];

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
  document.getElementById('entryDate').valueAsDate = new Date();

  loadEntries();
  setupMoodPicker();
  setupDiaryForm();
  setupTags();
  setupTheme();
  setupProfile();
  setupSettings();
  setupViewEntries();
  setupStickers();
  setupLogout();
});

function setupMoodPicker() {
  document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener('click', () => {
      selectedMood = option.dataset.mood;
      document.getElementById('selectedMood').textContent = `You feel: ${selectedMood}`;
    });
  });
}

function setupDiaryForm() {
  const form = document.getElementById('diaryForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      date: document.getElementById('entryDate').value,
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
}

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

function loadEntries() {
  const list = document.getElementById('entriesList');
  if (!list) return;
  list.innerHTML = '';
  entries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `<h3>${entry.title}</h3><p>${entry.date}</p><p>${entry.mood}</p>`;
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

function setupProfile() {
  const input = document.getElementById('profilePicInput');
  const img = document.getElementById('profilePic');
  const saved = localStorage.getItem('avatarImage');
  if (saved && img) img.src = saved;

  if (input) {
    input.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          if (img) img.src = e.target.result;
          localStorage.setItem('avatarImage', e.target.result);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (user) {
    const name = user.username || user.displayName || user.email?.split('@')[0] || 'User';
    document.getElementById('usernameDisplay').textContent = `Hi, ${name} 👋`;
  }
}

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

function setupStickers() {
  const emojiBtn = document.getElementById('toggleEmojiPicker');
  const inputField = document.getElementById('entryContent');
  if (!emojiBtn || !inputField) return;

  const picker = new EmojiButton({ position: 'top-start' });
  picker.on('emoji', emoji => {
    inputField.value += emoji;
  });
  emojiBtn.addEventListener('click', () => picker.togglePicker(emojiBtn));
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('pinUnlocked');
      firebase.auth().signOut();
      window.location.href = 'login.html';
    });
  }
}


