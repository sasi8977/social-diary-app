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

  setupUserInfo();
  setupMoodPicker();
  setupForm();
  setupButtons();
  loadEntries();
});

function setupUserInfo() {
  const saved = localStorage.getItem('avatarImage');
  const img = document.getElementById('profilePic');
  if (saved && img) img.src = saved;

  const input = document.getElementById('profilePicInput');
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

function setupMoodPicker() {
  document.querySelectorAll('.mood-option').forEach(option => {
    option.addEventListener('click', () => {
      selectedMood = option.dataset.mood;
      document.getElementById('selectedMood').textContent = `You feel: ${selectedMood}`;
    });
  });
}

function setupForm() {
  const form = document.getElementById('diaryForm');
  if (!form) return;
  document.getElementById('entryDate').valueAsDate = new Date();

  form.addEventListener('submit', e => {
    e.preventDefault();
    const entry = {
      id: Date.now(),
      date: document.getElementById('entryDate').value,
      title: document.getElementById('entryTitle').value,
      content: document.getElementById('entryContent').value,
      mood: selectedMood
    };
    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    alert('Entry saved!');
    form.reset();
    selectedMood = '';
    document.getElementById('selectedMood').textContent = '';
    loadEntries();
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
    list.appendChild(card);
  });
}

function setupButtons() {
  const show = id => {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  };

  document.getElementById('newEntryBtn')?.addEventListener('click', () => show('newEntrySection'));
  document.getElementById('viewEntriesBtn')?.addEventListener('click', () => show('viewEntriesSection'));
  document.getElementById('statsBtn')?.addEventListener('click', () => show('statsSection'));
  document.getElementById('settingsBtn')?.addEventListener('click', () => show('settingsSection'));
}

