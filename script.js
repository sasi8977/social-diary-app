// === Social Diary App - Updated script.js ===

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
  const imageInput = document.getElementById('imageInput');
const previewContainer = document.getElementById('previewImages');
const removeBtn = document.getElementById('removeImageBtn');
let selectedImages = [];

if (imageInput && previewContainer && removeBtn) {
  imageInput.addEventListener('change', () => {
    selectedImages = [];
    previewContainer.innerHTML = '';
    const files = Array.from(imageInput.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        selectedImages.push(e.target.result);
        const img = document.createElement('img');
        img.src = e.target.result;
        img.className = 'entry-thumb';
        img.style.maxWidth = '100px';
        previewContainer.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });

  removeBtn.addEventListener('click', () => {
    imageInput.value = '';
    selectedImages = [];
    previewContainer.innerHTML = '';
  });
}

  form.addEventListener('submit', e => {
    e.preventDefault();

    const imageInput = document.getElementById('imageInput');
    let imageData = '';

    if (imageInput && imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        imageData = e.target.result;
        saveEntry(imageData); // Proceed to save after image is loaded
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      saveEntry('');
    }
  });
}


function saveEntry(imageData) {
  const entry = {
  id: Date.now(),
  date: dateField.value,
  title: document.getElementById('entryTitle').value,
  content: document.getElementById('entryContent').value,
  mood: selectedMood,
  tags: Array.from(document.querySelectorAll('#tagsDisplay .tag')).map(t => t.textContent),
  images: selectedImages
};
  entries.push(entry);
  localStorage.setItem('entries', JSON.stringify(entries));
  alert('Saved!');
  document.getElementById('diaryForm').reset();
  selectedMood = '';
  document.getElementById('selectedMood').textContent = '';
  document.getElementById('tagsDisplay').innerHTML = '';
  if (document.getElementById('imagePreview')) {
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '';
  }
  loadEntries();
// ✅ Clear image previews and reset image input
imageInput.value = '';
selectedImages = [];
previewContainer.innerHTML = '';
});

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
function loadEntries(filter = '') {
  const list = document.getElementById('entriesList');
  if (!list) return;
  list.innerHTML = '';

  const lowerFilter = filter.toLowerCase();

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(lowerFilter) ||
    entry.mood.toLowerCase().includes(lowerFilter) ||
    (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerFilter)))
  );

  filteredEntries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    let imageHtml = '';
if (entry.images && entry.images.length > 0) {
  imageHtml = entry.images.map(img => `<img src="${img}" class="entry-thumb" alt="entry photo" />`).join('');
}

card.innerHTML = `
  <h3>${entry.title}</h3>
  <p>${entry.date}</p>
  <p>${entry.mood}</p>
  ${entry.images && entry.images.length > 0 ? `
    <div class="swiper-container">
      <div class="swiper-wrapper">
        ${entry.images.map(img => `
          <div class="swiper-slide">
            <img src="${img}" class="entry-thumb" alt="photo"/>
          </div>
        `).join('')}
      </div>
      <div class="swiper-pagination"></div>
      <div class="swiper-button-prev"></div>
      <div class="swiper-button-next"></div>
    </div>` : ''}
`;
    card.addEventListener('click', () => showEntryDetail(entry));
    list.appendChild(card);
 setTimeout(() => {
  card.querySelectorAll('.swiper-container').forEach(container => {
    new Swiper(container, {
      loop: true,
      pagination: { el: container.querySelector('.swiper-pagination') },
      navigation: {
        nextEl: container.querySelector('.swiper-button-next'),
        prevEl: container.querySelector('.swiper-button-prev')
      }
    });
  });
}, 100);
}
function showEntryDetail(entry) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('entryDetailSection').classList.add('active');
  document.getElementById('detailTitle').textContent = entry.title;
  document.getElementById('detailDate').textContent = entry.date;
  document.getElementById('detailMood').textContent = entry.mood;
  document.getElementById('detailContent').textContent = entry.content;
  document.getElementById('detailTags').innerHTML = entry.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const imageSlider = document.getElementById('imageSlider');
imageSlider.innerHTML = '';
if (entry.images && entry.images.length > 0) {
  entry.images.forEach(img => {
    const imgEl = document.createElement('img');
    imgEl.src = img;
    imageSlider.appendChild(imgEl);
  });
}


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
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    loadEntries(searchInput.value);
  });
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
    const display = document.getElementById('usernameDisplay');
    const sidebarDisplay = document.getElementById('sidebarUsername');
    if (display) display.textContent = `Hi, ${user.username} 👋`;
    if (sidebarDisplay) sidebarDisplay.textContent = user.username;
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



