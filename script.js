let selectedMood = '';
let entries = JSON.parse(localStorage.getItem('entries')) || [];
let friends = JSON.parse(localStorage.getItem('friends')) || [];

function updateDateField() {
  const dateField = document.getElementById('dateField');
  if (dateField) {
    dateField.value = new Date().toISOString().split('T')[0];
  }
}

// === PIN Lock ===
document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    window.location.href = 'login.html';
    return;
  }

  const splash = document.getElementById('splashScreen');
  if (splash) {
    setTimeout(() => {
      splash.classList.add('hide');
    }, 2000);
  }

  updateDateField();
  const pinLock = document.getElementById('pin-lock');
  const unlockBtn = document.getElementById('unlockBtn');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinError');
  let retryCount = parseInt(localStorage.getItem('pinRetries')) || 0;
  const maxRetries = 3;
  const lockoutTime = 60000; // 1 minute

  if (!localStorage.getItem('pinUnlocked')) {
    if (pinLock) pinLock.style.display = 'flex';

    if (retryCount >= maxRetries) {
      if (pinInput) pinInput.disabled = true;
      if (pinError) pinError.textContent = 'Too many attempts. Try again in 1 minute.';
      setTimeout(() => {
        retryCount = 0;
        localStorage.setItem('pinRetries', retryCount);
        if (pinInput) pinInput.disabled = false;
        if (pinError) pinError.textContent = '';
      }, lockoutTime);
    }
  }

  if (unlockBtn && pinInput) {
    unlockBtn.addEventListener('click', () => {
      const savedPin = localStorage.getItem('userPin') || '1234';
      if (pinInput.value === savedPin) {
        localStorage.setItem('pinUnlocked', 'true');
        localStorage.setItem('pinRetries', '0');
        if (pinLock) pinLock.style.display = 'none';
      } else {
        retryCount++;
        localStorage.setItem('pinRetries', retryCount);
        if (pinError) pinError.textContent = `Incorrect PIN. ${maxRetries - retryCount} attempts left.`;
        if (retryCount >= maxRetries) {
          if (pinInput) pinInput.disabled = true;
          if (pinError) pinError.textContent = 'Too many attempts. Try again in 1 minute.';
          setTimeout(() => {
            retryCount = 0;
            localStorage.setItem('pinRetries', retryCount);
            if (pinInput) pinInput.disabled = false;
            if (pinError) pinError.textContent = '';
          }, lockoutTime);
        }
      }
    });
  }

  const todayDate = document.getElementById('today-date');
  if (todayDate) todayDate.textContent = new Date().toDateString();

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
  setupFavoritesFilter();
  setupDailyReminder();
  setupFriends();
  setupStats();
  setupSearch();
});

// === Mood ===
function setupMoodPicker() {
  const moodOptions = document.querySelectorAll('.mood-option');
  if (moodOptions) {
    moodOptions.forEach(option => {
      option.addEventListener('click', () => {
        selectedMood = option.dataset.mood;
        const selectedMoodEl = document.getElementById('selectedMood');
        if (selectedMoodEl) selectedMoodEl.textContent = `You feel: ${selectedMood}`;
      });
    });
  }
}

// === Diary Form ===
function setupDiaryForm() {
  const imageInput = document.getElementById('imageInput');
  const previewContainer = document.getElementById('previewImages');
  const removeBtn = document.getElementById('removeImageBtn');
  const form = document.getElementById('diaryForm');
  const errorDiv = document.getElementById('formError');
  updateDateField();
  let selectedImages = [];

  if (imageInput && previewContainer && removeBtn) {
    imageInput.addEventListener('change', () => {
     const files = Array.from(imageInput.files);
      const maxSize = 2 * 1024 * 1024; // 2MB
      let valid = true;

      files.forEach(file => {
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          if (errorDiv) errorDiv.textContent = 'Only JPEG/PNG images are allowed.';
          valid = false;
          return;
        }
        if (file.size > maxSize) {
          if (errorDiv) errorDiv.textContent = 'Each image must be under 2MB.';
          valid = false;
          return;
        }
        compressImage(file, (compressedData) => {
          selectedImages.push(compressedData);
          const img = document.createElement('img');
          img.src = compressedData;
          img.className = 'entry-thumb';
          previewContainer.appendChild(img);
        });
      });

      if (valid && errorDiv) errorDiv.textContent = '';
    });

    removeBtn.addEventListener('click', () => {
      imageInput.value = '';
      selectedImages = [];
      previewContainer.innerHTML = '';
      if (errorDiv) errorDiv.textContent = '';
    });
  }

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const title = document.getElementById('entryTitle').value.trim();
      const content = document.getElementById('entryContent').value.trim();

      if (!title || !content) {
        if (errorDiv) errorDiv.textContent = 'Title and content are required.';
        return;
      }

      saveEntry(selectedImages);
    });
  }
}

function compressImage(file, callback) {
  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.src = e.target.result;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const maxDim = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.onload = () => callback(reader.result);
        reader.readAsDataURL(blob);
      }, file.type, 0.8);
    };
  };
  reader.readAsDataURL(file);
}

function saveEntry(selectedImages) {
  const dateField = document.getElementById('today-date');
  const title = document.getElementById('entryTitle').value.trim();
  const content = document.getElementById('entryContent').value.trim();
  const tagsDisplay = document.getElementById('tagsDisplay');
  const imageInput = document.getElementById('imageInput');
  const previewContainer = document.getElementById('previewImages');
  const errorDiv = document.getElementById('formError');

  const entry = {
    id: Date.now(),
    date: dateField ? dateField.textContent : 'No date',
    title,
    content,
    mood: selectedMood,
    tags: tagsDisplay ? Array.from(tagsDisplay.querySelectorAll('.tag')).map(t => t.textContent) : [],
    photos: selectedImages,
    favorite: false
  };

  entries.push(entry);
  try {
    localStorage.setItem('entries', JSON.stringify(entries));
  } catch (e) {
    console.warn('Failed to save entries:', e);
    if (errorDiv) errorDiv.textContent = 'Error saving entry. Storage may be full.';
    return;
  }

  alert('Saved!');
  const form = document.getElementById('diaryForm');
  if (form) form.reset();
  updateDateField();
  selectedMood = '';
  const selectedMoodEl = document.getElementById('selectedMood');
  if (selectedMoodEl) selectedMoodEl.textContent = '';
  if (tagsDisplay) tagsDisplay.innerHTML = '';
  if (imageInput) imageInput.value = '';
  if (previewContainer) previewContainer.innerHTML = '';
  if (errorDiv) errorDiv.textContent = '';
  loadEntries();
}

// === Tags ===
function setupTags() {
  const addBtn = document.getElementById('addTagBtn');
  const input = document.getElementById('tagsInput');
  const tagsDisplay = document.getElementById('tagsDisplay');
  const tagSuggestions = document.getElementById('tagSuggestions');

  if (!addBtn || !input || !tagsDisplay) return;

  function updateSuggestions(filter = '') {
    if (!tagSuggestions) return;
    const allTags = [...new Set(entries.flatMap(e => e.tags || []))];
    const filteredTags = allTags.filter(t => t.toLowerCase().includes(filter.toLowerCase()));
    tagSuggestions.innerHTML = filteredTags.map(t => `<div class="tag-suggestion">${t}</div>`).join('');
    tagSuggestions.querySelectorAll('.tag-suggestion').forEach(sug => {
      sug.addEventListener('click', () => {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.textContent = sug.textContent;
        tagsDisplay.appendChild(tag);
        input.value = '';
        tagSuggestions.innerHTML = '';
      });
    });
  }

  addBtn.addEventListener('click', () => {
    const value = input.value.trim();
    if (value) {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = value;
      tagsDisplay.appendChild(tag);
      input.value = '';
      if (tagSuggestions) tagSuggestions.innerHTML = '';
    }
  });

  input.addEventListener('input', () => updateSuggestions(input.value));
}

// === View Entries ===
function loadEntries(filter = '', sort = 'date-desc') {
  const list = document.getElementById('entriesList');
  if (!list) return;
  list.innerHTML = '';

  const lowerFilter = filter.toLowerCase();
  let filteredEntries = entries.filter(entry =>
    (entry.title || '').toLowerCase().includes(lowerFilter) ||
    (entry.mood || '').toLowerCase().includes(lowerFilter) ||
    (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerFilter)))
  );

  // Sorting
  filteredEntries.sort((a, b) => {
    if (sort === 'date-desc') return b.id - a.id;
    if (sort === 'date-asc') return a.id - b.id;
    if (sort === 'title') return a.title.localeCompare(b.title);
    if (sort === 'mood') return a.mood.localeCompare(b.mood);
    return 0;
  });

  filteredEntries.forEach(entry => {
    const card = document.createElement('div');
    card.className = 'entry-card';

    let imageHtml = '';
    if (entry.photos && entry.photos.length > 0) {
      if (typeof Swiper !== 'undefined') {
        imageHtml = `
          <div class="swiper-container">
            <div class="swiper-wrapper">
              ${entry.photos.map(img => `
                <div class="swiper-slide">
                  <img src="${img}" class="entry-thumb" alt="photo"/>
                </div>
              `).join('')}
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
          </div>
        `;
      } else {
        imageHtml = `<div class="image-grid">${entry.photos.map(img => `<img src="${img}" class="entry-thumb" alt="photo"/>`).join('')}</div>`;
      }
    }

    card.innerHTML = `
      <h3>${entry.title || 'No title'}</h3>
      <p class="entry-date">${entry.date || 'No date'}</p>
      <p>${entry.mood || 'No mood'}</p>
      ${imageHtml}
      <button class="favoriteBtn">${entry.favorite ? '💖 Favorited' : '🤍 Add Favorite'}</button>
    `;

    const favoriteBtn = card.querySelector('.favoriteBtn');
    favoriteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      entry.favorite = !entry.favorite;
      try {
        localStorage.setItem('entries', JSON.stringify(entries));
      } catch (e) {
        console.warn('Failed to save entries:', e);
      }
      loadEntries(filter, sort);
    });

    card.addEventListener('click', () => showEntryDetail(entry));
    list.appendChild(card);

    if (typeof Swiper !== 'undefined') {
      setTimeout(() => {
        card.querySelectorAll('.swiper-container').forEach(container => {
          new Swiper(container, {
            loop: true,
            slidesPerView: window.innerWidth < 600 ? 1 : 2,
            spaceBetween: 10,
            pagination: { el: container.querySelector('.swiper-pagination') },
            navigation: {
              nextEl: container.querySelector('.swiper-button-next'),
              prevEl: container.querySelector('.swiper-button-prev')
            }
          });
        });
      }, 100);
    }
  });

  if (navigator.onLine === false) {
    const offlineWarning = document.createElement('p');
    offlineWarning.textContent = 'You are offline. Some features may be limited.';
    list.prepend(offlineWarning);
  }
}

function showEntryDetail(entry) {
  const sections = document.querySelectorAll('.section');
  const detailSection = document.getElementById('entryDetailSection');
  const editForm = document.getElementById('editEntryForm');
  const editImages = document.getElementById('editImages');
  const editImageInput = document.getElementById('editImageInput');
  const removeEditImages = document.getElementById('removeEditImages');

  if (!detailSection || !editForm) return;

  sections.forEach(s => s.classList.remove('active'));
  detailSection.classList.add('active');

  document.getElementById('detailTitle').textContent = entry.title || 'No title';
  document.getElementById('detailDate').textContent = entry.date || 'No date';
  document.getElementById('detailMood').textContent = entry.mood || 'No mood';
  document.getElementById('detailContent').textContent = entry.content || '';
  const detailTags = document.getElementById('detailTags');
  if (detailTags) detailTags.innerHTML = (entry.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  const imageSlider = document.getElementById('imageSlider');
  if (imageSlider) {
    imageSlider.innerHTML = '';
    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach(img => {
        const imgEl = document.createElement('img');
        imgEl.src = img;
        imageSlider.appendChild(imgEl);
      });
    }
  }

  // Setup edit form
  let editSelectedImages = [...(entry.images || [])];
  document.getElementById('editTitle').value = entry.title || '';
  document.getElementById('editContent').value = entry.content || '';
  document.getElementById('editMood').value = entry.mood || '';
  if (editImages) {
    editImages.innerHTML = editSelectedImages.map(img => `<img src="${img}" class="entry-thumb" style="max-width: 100px;" alt="photo"/>`).join('');
  }

  if (editImageInput) {
    editImageInput.addEventListener('change', () => {
  editImages.innerHTML = '';
  editSelectedImages = [];
  const files = Array.from(imageInput.files);
  const maxSize = 2 * 1024 * 1024; // 2MB
  let valid = true;
  const errorDiv = document.getElementById('editFormError');

  files.forEach(file => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      if (errorDiv) errorDiv.textContent = 'Only JPEG/PNG images are allowed.';
      valid = false;
      return;
    }
    if (file.size > maxSize) {
      if (errorDiv) errorDiv.textContent = 'Each image must be under 2MB.';
      valid = false;
      return;
    }
    compressImage(file, (compressedData) => {
      editSelectedImages.push(compressedData);
      const img = document.createElement('img');
      img.src = compressedData;
      img.className = 'entry-thumb';
      img.style.maxWidth = '100px';
      editImages.appendChild(img);
    });
  });

  if (valid && errorDiv) errorDiv.textContent = '';
}, { once: true });

  }

  if (removeEditImages) {
    removeEditImages.addEventListener('click', () => {
      editSelectedImages = [];
      if (editImages) editImages.innerHTML = '';
      if (editImageInput) editImageInput.value = '';
    }, { once: true });
  }

  editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('editTitle').value.trim();
    const content = document.getElementById('editContent').value.trim();
    const errorDiv = document.getElementById('editFormError');

    if (!title || !content) {
      if (errorDiv) errorDiv.textContent = 'Title and content are required.';
      return;
    }

    entry.title = title;
    entry.content = content;
    entry.mood = document.getElementById('editMood').value;
    entry.tags = Array.from(document.getElementById('editTagsDisplay')?.querySelectorAll('.tag') || []).map(t => t.textContent);
    entry.images = editSelectedImages;

    try {
      localStorage.setItem('entries', JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to save entries:', e);
      if (errorDiv) errorDiv.textContent = 'Error saving entry. Storage may be full.';
      return;
    }

    showSection('viewEntriesSection');
    loadEntries();
  }, { once: true });

  const backBtn = document.getElementById('backToListBtn');
  if (backBtn) backBtn.onclick = () => showSection('viewEntriesSection');

  const deleteBtn = document.getElementById('deleteEntryBtn');
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      entries = entries.filter(e => e.id !== entry.id);
      try {
        localStorage.setItem('entries', JSON.stringify(entries));
      } catch (e) {
        console.warn('Failed to save entries:', e);
      }
      showSection('viewEntriesSection');
      loadEntries();
    };
  }
}

function showSection(id) {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    if (section.id === id) {
      section.style.display = 'block';
      setTimeout(() => section.classList.add('active'), 10);
    } else {
      section.classList.remove('active');
      setTimeout(() => section.style.display = 'none', 400);
    }
  });
}

function setupViewEntries() {
  const btn = document.getElementById('viewEntriesBtn');
  if (btn) btn.addEventListener('click', () => showSection('viewEntriesSection'));
}

function setupFavoritesFilter() {
  const btn = document.getElementById('filterFavoritesBtn');
  if (!btn) return;

  let showingFavorites = false;

  btn.addEventListener('click', () => {
    showingFavorites = !showingFavorites;
    btn.textContent = showingFavorites ? 'Show All' : 'Show Favorites';
    const sortSelect = document.getElementById('sortSelect');
    loadEntries('', sortSelect ? sortSelect.value : 'date-desc', showingFavorites);
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    loadEntries(searchInput.value, sortSelect ? sortSelect.value : 'date-desc');
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      loadEntries(searchInput.value, sortSelect.value);
    });
  }
}

function setupStats() {
  const statsBtn = document.getElementById('statsBtn');
  if (statsBtn) statsBtn.onclick = () => {
    showSection('statsSection');
    const statsDisplay = document.getElementById('statsDisplay');
    if (!statsDisplay) return;

    const totalEntries = entries.length;
    const moodCounts = {};
    const tagCounts = {};

    entries.forEach(entry => {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      (entry.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const moodStats = Object.entries(moodCounts).map(([mood, count]) => {
      const percentage = totalEntries ? ((count / totalEntries) * 100).toFixed(1) : 0;
      return `${mood}: ${count} entries (${percentage}%)`;
    }).join('<br>');

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => `${tag}: ${count} times`)
      .join('<br>');

    statsDisplay.innerHTML = `
      <p>Total Entries: ${totalEntries}</p>
      <p>Mood Breakdown:<br>${moodStats || 'No moods recorded'}</p>
      <p>Top 5 Tags:<br>${topTags || 'No tags recorded'}</p>
    `;
  };
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
  if (saved && headerAvatar) headerAvatar.src = saved;

  if (input) {
    input.addEventListener('change', function () {
      const file = this.files[0];
      if (file) {
        compressImage(file, (compressedData) => {
          if (img) img.src = compressedData;
          if (headerAvatar) headerAvatar.src = compressedData;
          try {
            localStorage.setItem('avatarImage', compressedData);
          } catch (e) {
            console.warn('Failed to save avatar:', e);
          }
        });
      }
    });
  }

  const user = JSON.parse(localStorage.getItem('loggedInUser'));
  if (user && user.username) {
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
  const pinInput = document.getElementById('newPinInput');
  const reminderTime = document.getElementById('reminderTime');
  const reminderToggle = document.getElementById('reminderToggle');

  if (settingsBtn) settingsBtn.onclick = () => showSection('settingsSection');
  if (newEntryBtn) newEntryBtn.onclick = () => showSection('newEntrySection');
  updateDateField();
  if (statsBtn) statsBtn.onclick = () => showSection('statsSection');

  if (saveBtn) {
    saveBtn.onclick = () => {
      if (pinInput && pinInput.value.trim()) {
        try {
          localStorage.setItem('userPin', pinInput.value.trim());
        } catch (e) {
          console.warn('Failed to save PIN:', e);
        }
      }
      if (reminderTime && reminderToggle) {
        try {
          localStorage.setItem('reminderTime', reminderTime.value);
          localStorage.setItem('reminderEnabled', reminderToggle.checked);
        } catch (e) {
          console.warn('Failed to save reminder settings:', e);
        }
      }
      alert('Settings saved!');
    };
  }

  if (exportBtn) {
    exportBtn.onclick = () => {
      const blob = new Blob([JSON.stringify(entries)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'diary-entries.json';
      a.click();
      URL.revokeObjectURL(url);
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
  list.innerHTML = emojis.map(e => `<button class='emoji-btn' aria-label="Add ${e} emoji">${e}</button>`).join('');
  list.style.display = 'none';

  stickerBtn.addEventListener('click', () => {
    list.style.display = list.style.display === 'none' ? 'block' : 'none';
  });

  list.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      textarea.value += btn.textContent;
      textarea.focus();
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
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(choice => {
          if (choice.outcome === 'accepted') {
            installBtn.style.display = 'none';
          }
          deferredPrompt = null;
        });
      }
    });
  }

  const shareBtn = document.getElementById('shareBtn');
  if (navigator.share && shareBtn) {
    shareBtn.style.display = 'inline-block';
    shareBtn.addEventListener('click', async () => {
      try {
        await navigator.share({
          title: 'Social Diary',
          text: 'Check out my diary app!',
          url: window.location.href
        });
      } catch (e) {
        console.warn('Share failed:', e);
      }
    });
  }

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(e => console.warn('Service Worker registration failed:', e));
  }
}

// === Daily Reminder Notification ===
function setupDailyReminder() {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications.");
    return;
  }

  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      scheduleReminder();
    }
  });
}

function scheduleReminder() {
  const reminderEnabled = localStorage.getItem('reminderEnabled') !== 'false';
  if (!reminderEnabled) return;

  const reminderTime = localStorage.getItem('reminderTime') || '08:00';
  const [reminderHour, reminderMin] = reminderTime.split(':').map(Number);
  const now = new Date();
  const reminderDate = new Date();
  reminderDate.setHours(reminderHour, reminderMin, 0, 0);

  let delay = reminderDate.getTime() - now.getTime();
  if (delay < 0) {
    delay += 24 * 60 * 60 * 1000; // Next day
  }

  setTimeout(() => {
    new Notification("Social Diary Reminder ✍️", {
      body: "Don't forget to write in your diary today!",
      icon: "images/icon-192.png"
    });
    scheduleReminder();
  }, delay);
}

// === Friends ===
function setupFriends() {
  const btn = document.getElementById('friendsBtn');
  const nameInput = document.getElementById('friendNameInput');
  const emojiInput = document.getElementById('friendEmojiInput');
  const addBtn = document.getElementById('addFriendBtn');
  const list = document.getElementById('friendList');
  const editForm = document.getElementById('editFriendForm');
  const editNameInput = document.getElementById('editFriendName');
  const editEmojiInput = document.getElementById('editFriendEmoji');
  const saveEditBtn = document.getElementById('saveFriendEdit');

  if (!btn || !addBtn || !nameInput || !emojiInput || !list) return;

  function renderFriends() {
    list.innerHTML = '';
    if (friends.length === 0) {
      list.innerHTML = '<p>No friends added yet.</p>';
      return;
    }
    friends.forEach((friend, index) => {
      const card = document.createElement('div');
      card.className = 'friend-card';
      card.innerHTML = `
        <span>${friend.emoji}</span> <strong>${friend.name}</strong>
        <button class="editFriendBtn">Edit</button>
        <button class="deleteFriendBtn">Delete</button>
      `;
      card.querySelector('.editFriendBtn').addEventListener('click', () => {
        if (editForm && editNameInput && editEmojiInput && saveEditBtn) {
          editNameInput.value = friend.name;
          editEmojiInput.value = friend.emoji;
          showSection('editFriendSection');
          saveEditBtn.onclick = () => {
            const newName = editNameInput.value.trim();
            const newEmoji = editEmojiInput.value.trim() || '👤';
            if (!newName) {
              alert('Friend name is required.');
              return;
            }
            friends[index] = { name: newName, emoji: newEmoji };
            try {
              localStorage.setItem('friends', JSON.stringify(friends));
            } catch (e) {
              console.warn('Failed to save friends:', e);
            }
            renderFriends();
            showSection('friendsSection');
          };
        }
      });
      card.querySelector('.deleteFriendBtn').addEventListener('click', () => {
        friends.splice(index, 1);
        try {
          localStorage.setItem('friends', JSON.stringify(friends));
        } catch (e) {
          console.warn('Failed to save friends:', e);
        }
        renderFriends();
      });
      list.appendChild(card);
    });
  }

  renderFriends();

  btn.addEventListener('click', () => showSection('friendsSection'));

  addBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const emoji = emojiInput.value.trim() || '👤';
    if (!name) return alert('Enter name!');
    friends.push({ name, emoji });
    try {
      localStorage.setItem('friends', JSON.stringify(friends));
    } catch (e) {
      console.warn('Failed to save friends:', e);
    }
    nameInput.value = '';
    emojiInput.value = '';
    renderFriends();
  });
}

// === Logout ===
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem('loggedInUser');
        localStorage.removeItem('pinUnlocked');
        localStorage.removeItem('pinRetries');
      } catch (e) {
        console.warn('Failed to clear localStorage:', e);
      }
      window.location.href = 'login.html';
    });
  }
}

