let selectedMood = '';
let entries = JSON.parse(localStorage.getItem('entries')) || [];
let friends = JSON.parse(localStorage.getItem('friends')) || [];

// === Firebase Imports ===
import { getDoc, setDoc, doc, collection, getDocs, query, where, updateDoc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js';

// === Utility Functions ===
function updateDateField() {
  const dateField = document.getElementById('today-date');
  if (dateField) dateField.textContent = new Date().toDateString();
}

function showErrorBanner(message) {
  const banner = document.getElementById('error-banner');
  if (banner) {
    banner.textContent = message;
    banner.hidden = false;
    banner.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      banner.hidden = true;
      banner.setAttribute('aria-hidden', 'true');
    }, 5000);
  }
}

// === DOM Content Loaded ===
document.addEventListener('DOMContentLoaded', () => {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    window.location.href = 'login.html';
    return;
  }

  const splash = document.getElementById('splashScreen');
  if (splash) {
    setTimeout(() => splash.classList.add('hide'), 2000);
  }

  updateDateField();
  setupEnhancedPinLock();
  setupLocalization();
  setupMoodPicker();
  setupDiaryForm();
  setupTags();
  setupViewEntries();
  setupFriends();
  setupStats();
  setupSettings();
  setupCalendar();
  setupChatbot();
  setupExportImport();
  setupPWA();
  setupFavoritesFilter();
  setupDailyReminder();
  setupStickers();
  setupLogout();
  setupSearch();
});

// === Enhanced PIN Lock ===
async function setupEnhancedPinLock() {
  const pinLock = document.getElementById('pin-lock');
  const unlockBtn = document.getElementById('unlockBtn');
  const pinInput = document.getElementById('pinInput');
  const pinError = document.getElementById('pinError');
  let retryCount = parseInt(localStorage.getItem('pinRetries')) || 0;
  const maxRetries = 3;
  const lockoutTime = 60000;

  if (!localStorage.getItem('pinUnlocked')) {
    if (pinLock) pinLock.style.display = 'flex';
    if (retryCount >= maxRetries) {
      pinInput.disabled = true;
      pinError.textContent = 'Too many attempts. Try again in 1 minute.';
      setTimeout(() => {
        retryCount = 0;
        localStorage.setItem('pinRetries', retryCount);
        pinInput.disabled = false;
        pinError.textContent = '';
      }, lockoutTime);
    }
  }

  if (unlockBtn && pinInput) {
    unlockBtn.addEventListener('click', async () => {
      const pin = pinInput.value;
      const valid = await checkPinWithFirestore(pin);
      if (valid) {
        localStorage.setItem('pinUnlocked', 'true');
        localStorage.setItem('pinRetries', '0');
        pinLock.style.display = 'none';
      } else {
        retryCount++;
        localStorage.setItem('pinRetries', retryCount);
        pinError.textContent = `Incorrect PIN. ${maxRetries - retryCount} attempts left.`;
        if (retryCount >= maxRetries) {
          pinInput.disabled = true;
          pinError.textContent = 'Too many attempts. Try again in 1 minute.';
          setTimeout(() => {
            retryCount = 0;
            localStorage.setItem('pinRetries', retryCount);
            pinInput.disabled = false;
            pinError.textContent = '';
          }, lockoutTime);
        }
      }
    });
  }
}

async function checkPinWithFirestore(pin) {
  const user = auth.currentUser;
  if (!user) {
    showErrorBanner('User not authenticated.');
    return false;
  }
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    return userDoc.exists() && userDoc.data().pin === pin;
  } catch (e) {
    showErrorBanner('Error checking PIN: ' + e.message);
    return false;
  }
}

// === Localization ===
function setupLocalization() {
  i18next.init({
    lng: localStorage.getItem('language') || 'en',
    resources: {
      en: { translation: {} },
      es: { translation: {} },
      zh: { translation: {} },
      hi: { translation: {} }
    }
  }, () => {
    ['en', 'es', 'zh', 'hi'].forEach(lang => {
      fetch(`/languages/${lang}.json`)
        .then(res => res.json())
        .then(data => i18next.addResourceBundle(lang, 'translation', data))
        .then(updateTranslations);
    });
  });

  const langSelect = document.getElementById('language-select');
  if (langSelect) {
    langSelect.addEventListener('change', () => {
      i18next.changeLanguage(langSelect.value, () => {
        localStorage.setItem('language', langSelect.value);
        updateTranslations();
      });
    });
  }
}

function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18next.t(el.dataset.i18n);
  });
}

// === Mood Picker ===
function setupMoodPicker() {
  const moodOptions = document.querySelectorAll('.mood-option');
  moodOptions.forEach(option => {
    option.addEventListener('click', () => {
      selectedMood = option.dataset.mood;
      const selectedMoodEl = document.getElementById('selectedMood');
      if (selectedMoodEl) selectedMoodEl.textContent = i18next.t('mood.selected', { mood: selectedMood });
      generateAIPrompt();
    });
  });
}

// === Diary Form ===
function setupDiaryForm() {
  const imageInput = document.getElementById('imageInput');
  const videoInput = document.getElementById('videoInput');
  const voiceInput = document.getElementById('voiceInput');
  const recordVoiceBtn = document.getElementById('recordVoiceBtn');
  const previewContainer = document.getElementById('previewImages');
  const removeBtn = document.getElementById('removeImageBtn');
  const form = document.getElementById('diaryForm');
  const errorDiv = document.getElementById('formError');
  let selectedImages = [];
  let selectedVideos = [];
  let selectedVoice = [];

  if (imageInput && previewContainer && removeBtn) {
    imageInput.addEventListener('change', () => {
      const files = Array.from(imageInput.files);
      const maxSize = 2 * 1024 * 1024; // 2MB
      let valid = true;

      files.forEach(file => {
        if (!['image/jpeg', 'image/png'].includes(file.type)) {
          errorDiv.textContent = i18next.t('error.image_format');
          valid = false;
          return;
        }
        if (file.size > maxSize) {
          errorDiv.textContent = i18next.t('error.image_size');
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

      if (valid) errorDiv.textContent = '';
    });

    videoInput.addEventListener('change', () => {
      const files = Array.from(videoInput.files);
      const maxSize = 10 * 1024 * 1024; // 10MB
      let valid = true;

      files.forEach(file => {
        if (!['video/mp4', 'video/webm'].includes(file.type)) {
          errorDiv.textContent = i18next.t('error.video_format');
          valid = false;
          return;
        }
        if (file.size > maxSize) {
          errorDiv.textContent = i18next.t('error.video_size');
          valid = false;
          return;
        }
        const url = URL.createObjectURL(file);
        selectedVideos.push(file);
        const video = document.createElement('video');
        video.src = url;
        video.className = 'video-preview';
        video.controls = true;
        previewContainer.appendChild(video);
      });

      if (valid) errorDiv.textContent = '';
    });

    voiceInput.addEventListener('change', () => {
      const files = Array.from(voiceInput.files);
      const maxSize = 5 * 1024 * 1024; // 5MB
      let valid = true;

      files.forEach(file => {
        if (!['audio/mp3', 'audio/wav'].includes(file.type)) {
          errorDiv.textContent = i18next.t('error.audio_format');
          valid = false;
          return;
        }
        if (file.size > maxSize) {
          errorDiv.textContent = i18next.t('error.audio_size');
          valid = false;
          return;
        }
        const url = URL.createObjectURL(file);
        selectedVoice.push(file);
        const audio = document.createElement('audio');
        audio.src = url;
        audio.className = 'audio-preview';
        audio.controls = true;
        previewContainer.appendChild(audio);
      });

      if (valid) errorDiv.textContent = '';
    });

    let mediaRecorder;
    let recordedChunks = [];
    recordVoiceBtn.addEventListener('click', async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        recordVoiceBtn.textContent = '🎙️ Record';
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];
        mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
        mediaRecorder.onstop = async () => {
          const blob = new Blob(recordedChunks, { type: 'audio/wav' });
          if (blob.size > 5 * 1024 * 1024) {
            errorDiv.textContent = i18next.t('error.audio_size');
            return;
          }
          selectedVoice.push(blob);
          const url = URL.createObjectURL(blob);
          const audio = document.createElement('audio');
          audio.src = url;
          audio.className = 'audio-preview';
          audio.controls = true;
          previewContainer.appendChild(audio);
          transcribeVoice(blob);
        };
        mediaRecorder.start();
        recordVoiceBtn.textContent = '⏹️ Stop';
      } catch (e) {
        showErrorBanner('Recording error: ' + e.message);
      }
    });

    removeBtn.addEventListener('click', () => {
      imageInput.value = '';
      videoInput.value = '';
      voiceInput.value = '';
      selectedImages = [];
      selectedVideos = [];
      selectedVoice = [];
      previewContainer.innerHTML = '';
      errorDiv.textContent = '';
    });
  }

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const title = document.getElementById('entryTitle').value.trim();
      const content = document.getElementById('entryContent').value.trim();

      if (!title || !content) {
        errorDiv.textContent = i18next.t('error.enter_text_mood');
        return;
      }

      await saveEntry(selectedImages, selectedVideos, selectedVoice);
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

async function saveEntry(selectedImages, selectedVideos, selectedVoice) {
  const dateField = document.getElementById('today-date');
  const title = document.getElementById('entryTitle').value.trim();
  const content = document.getElementById('entryContent').value.trim();
  const tagsDisplay = document.getElementById('tagsDisplay');
  const imageInput = document.getElementById('imageInput');
  const videoInput = document.getElementById('videoInput');
  const voiceInput = document.getElementById('voiceInput');
  const previewContainer = document.getElementById('previewImages');
  const errorDiv = document.getElementById('formError');

  const entry = {
    id: Date.now(),
    date: dateField.textContent,
    title,
    content,
    mood: selectedMood,
    tags: tagsDisplay ? Array.from(tagsDisplay.querySelectorAll('.tag')).map(t => t.textContent) : [],
    photos: selectedImages,
    videos: [],
    voice: [],
    favorite: false
  };

  const user = auth.currentUser;
  if (user && navigator.onLine) {
    try {
      entry.videos = await Promise.all(selectedVideos.map(async (file, i) => {
        const ref = storageRef(storage, `entries/${user.uid}/${entry.id}/video-${i}.${file.type.split('/')[1]}`);
        await uploadBytes(ref, file);
        return await getDownloadURL(ref);
      }));
      entry.voice = await Promise.all(selectedVoice.map(async (file, i) => {
        const ref = storageRef(storage, `entries/${user.uid}/${entry.id}/voice-${i}.${file.type.split('/')[1]}`);
        await uploadBytes(ref, file);
        return await getDownloadURL(ref);
      }));
      await setDoc(doc(db, 'entries', user.uid, 'userEntries', String(entry.id)), entry);
    } catch (e) {
      console.warn('Failed to save to Firestore:', e);
      queueEntryOffline(entry);
    }
  } else {
    queueEntryOffline(entry);
  }

  entries.push(entry);
  try {
    localStorage.setItem('entries', JSON.stringify(entries));
  } catch (e) {
    console.warn('Failed to save entries:', e);
    errorDiv.textContent = i18next.t('error.storage_full');
    return;
  }

  showErrorBanner(i18next.t('success.saved'));
  const form = document.getElementById('diaryForm');
  if (form) form.reset();
  updateDateField();
  selectedMood = '';
  document.getElementById('selectedMood').textContent = '';
  tagsDisplay.innerHTML = '';
  imageInput.value = '';
  videoInput.value = '';
  voiceInput.value = '';
  previewContainer.innerHTML = '';
  errorDiv.textContent = '';
  loadEntries();
  analyzeMood(entry);
  autoTagEntry(entry);
}

// === Offline Syncing ===
function queueEntryOffline(entry) {
  const dbRequest = indexedDB.open('SocialDiaryDB', 1);
  dbRequest.onupgradeneeded = e => {
    e.target.result.createObjectStore('entries', { keyPath: 'id' });
  };
  dbRequest.onsuccess = e => {
    const tx = e.target.result.transaction(['entries'], 'readwrite');
    tx.objectStore('entries').put(entry);
  };
}

async function syncEntries() {
  const user = auth.currentUser;
  if (!user || !navigator.onLine) return;
  const dbRequest = indexedDB.open('SocialDiaryDB', 1);
  dbRequest.onsuccess = e => {
    const tx = e.target.result.transaction(['entries'], 'readwrite');
    const store = tx.objectStore('entries');
    store.getAll().onsuccess = async evt => {
      const offlineEntries = evt.target.result;
      for (const entry of offlineEntries) {
        try {
          await setDoc(doc(db, 'entries', user.uid, 'userEntries', String(entry.id)), entry);
          store.delete(entry.id);
        } catch (e) {
          console.warn('Sync failed:', e);
        }
      }
    };
  };
}

// === AI Features ===
async function generateAIPrompt() {
  const promptDiv = document.getElementById('ai-prompt');
  if (!selectedMood || !promptDiv) return;
  try {
    const generatePrompt = httpsCallable(functions, 'generatePrompt');
    const result = await generatePrompt({ mood: selectedMood });
    promptDiv.textContent = result.data.prompt || i18next.t('prompt.default');
  } catch (e) {
    promptDiv.textContent = i18next.t('prompt.default');
  }
}

async function analyzeMood(entry) {
  try {
    const analyze = httpsCallable(functions, 'analyzeMood');
    const result = await analyze({ text: entry.content });
    const sentiment = result.data.sentiment;
    await setDoc(doc(db, 'entries', auth.currentUser.uid, 'userEntries', String(entry.id)), { sentiment }, { merge: true });
    updateStats();
  } catch (e) {
    console.warn('Mood analysis failed:', e);
  }
}

async function autoTagEntry(entry) {
  try {
    const autoTag = httpsCallable(functions, 'autoTag');
    const result = await autoTag({ text: entry.content });
    const tags = result.data.tags || [];
    entry.tags = [...new Set([...entry.tags, ...tags])];
    await setDoc(doc(db, 'entries', auth.currentUser.uid, 'userEntries', String(entry.id)), { tags: entry.tags }, { merge: true });
    localStorage.setItem('entries', JSON.stringify(entries));
  } catch (e) {
    console.warn('Auto-tagging failed:', e);
  }
}

async function transcribeVoice(blob) {
  try {
    const ref = storageRef(storage, `transcriptions/${auth.currentUser.uid}/${Date.now()}.wav`);
    await uploadBytes(ref, blob);
    const url = await getDownloadURL(ref);
    const transcribe = httpsCallable(functions, 'transcribeVoice');
    const result = await transcribe({ url });
    const content = document.getElementById('entryContent');
    content.value += result.data.text;
    analyzeMood({ content: result.data.text });
  } catch (e) {
    showErrorBanner('Transcription failed: ' + e.message);
  }
}

function setupChatbot() {
  const sendBtn = document.getElementById('send-chat');
  const input = document.getElementById('chat-input');
  const messages = document.getElementById('chat-messages');
  if (!sendBtn || !input || !messages) return;

  sendBtn.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) return;
    const userMsg = document.createElement('div');
    userMsg.textContent = `You: ${text}`;
    messages.appendChild(userMsg);
    input.value = '';
    try {
      const chat = httpsCallable(functions, 'chatWithAI');
      const result = await chat({ message: text });
      const aiMsg = document.createElement('div');
      aiMsg.textContent = `AI: ${result.data.response}`;
      messages.appendChild(aiMsg);
      messages.scrollTop = messages.scrollHeight;
    } catch (e) {
      showErrorBanner('Chat error: ' + e.message);
    }
  });
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
      tagSuggestions.innerHTML = '';
    }
  });

  input.addEventListener('input', () => updateSuggestions(input.value));
}

// === View Entries ===
async function loadEntries(filter = '', sort = 'date-desc', favoritesOnly = false) {
  const list = document.getElementById('entriesList');
  if (!list) return;
  list.innerHTML = '';

  const user = auth.currentUser;
  let firestoreEntries = [];
  if (user && navigator.onLine) {
    try {
      const querySnapshot = await getDocs(collection(db, 'entries', user.uid, 'userEntries'));
      firestoreEntries = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      entries = firestoreEntries;
      localStorage.setItem('entries', JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to load Firestore entries:', e);
    }
  }

  const lowerFilter = filter.toLowerCase();
  let filteredEntries = entries.filter(entry =>
    (favoritesOnly ? entry.favorite : true) &&
    ((entry.title || '').toLowerCase().includes(lowerFilter) ||
     (entry.mood || '').toLowerCase().includes(lowerFilter) ||
     (entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(lowerFilter))))
  );

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

    let mediaHtml = '';
    if (entry.photos?.length || entry.videos?.length || entry.voice?.length) {
      if (typeof Swiper !== 'undefined') {
        mediaHtml = `
          <div class="swiper-container">
            <div class="swiper-wrapper">
              ${entry.photos?.map(img => `
                <div class="swiper-slide">
                  <img src="${img}" class="entry-thumb" alt="photo"/>
                </div>
              `).join('') || ''}
              ${entry.videos?.map(video => `
                <div class="swiper-slide">
                  <video src="${video}" class="video-preview" controls></video>
                </div>
              `).join('') || ''}
              ${entry.voice?.map(audio => `
                <div class="swiper-slide">
                  <audio src="${audio}" class="audio-preview" controls></audio>
                </div>
              `).join('') || ''}
            </div>
            <div class="swiper-pagination"></div>
            <div class="swiper-button-prev"></div>
            <div class="swiper-button-next"></div>
          </div>
        `;
      } else {
        mediaHtml = `
          <div class="image-grid">
            ${entry.photos?.map(img => `<img src="${img}" class="entry-thumb" alt="photo"/>`).join('') || ''}
            ${entry.videos?.map(video => `<video src="${video}" class="video-preview" controls></video>`).join('') || ''}
            ${entry.voice?.map(audio => `<audio src="${audio}" class="audio-preview" controls></audio>`).join('') || ''}
          </div>
        `;
      }
    }

    card.innerHTML = `
      <h3>${entry.title || 'No title'}</h3>
      <p class="entry-date">${entry.date || 'No date'}</p>
      <p>${entry.mood || 'No mood'}</p>
      ${mediaHtml}
      <button class="favoriteBtn">${entry.favorite ? '💖 Favorited' : '🤍 Add Favorite'}</button>
      <button class="share-x" data-entry-id="${entry.id}">Share to X</button>
    `;

    const favoriteBtn = card.querySelector('.favoriteBtn');
    favoriteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      entry.favorite = !entry.favorite;
      try {
        localStorage.setItem('entries', JSON.stringify(entries));
        if (user && navigator.onLine) {
          await setDoc(doc(db, 'entries', user.uid, 'userEntries', String(entry.id)), { favorite: entry.favorite }, { merge: true });
        }
      } catch (e) {
        console.warn('Failed to save entries:', e);
      }
      loadEntries(filter, sort, favoritesOnly);
    });

    card.querySelector('.share-x').addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const createLink = httpsCallable(functions, 'createDynamicLink');
        const result = await createLink({
          entryId: entry.id,
          title: entry.title,
          userId: user.uid
        });
        await navigator.share({
          title: entry.title,
          text: `Check out my diary entry: ${entry.title}`,
          url: result.data.shortLink
        });
      } catch (e) {
        showErrorBanner('Sharing failed: ' + e.message);
      }
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
    offlineWarning.textContent = i18next.t('warning.offline');
    list.prepend(offlineWarning);
  }
}

async function filterEntriesByDate(date) {
  const user = auth.currentUser;
  let filteredEntries = entries;
  if (user && navigator.onLine) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    try {
      const q = query(
        collection(db, 'entries', user.uid, 'userEntries'),
        where('date', '>=', start.toISOString()),
        where('date', '<', end.toISOString())
      );
      const querySnapshot = await getDocs(q);
      filteredEntries = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (e) {
      console.warn('Failed to filter entries:', e);
    }
  }
  loadEntries('', 'date-desc', false);
}

function showEntryDetail(entry) {
  const sections = document.querySelectorAll('.section');
  const detailSection = document.getElementById('entryDetailSection');
  const editForm = document.getElementById('editEntryForm');
  const editImages = document.getElementById('editImages');
  const editImageInput = document.getElementById('editImageInput');
  const editVideoInput = document.getElementById('editVideoInput');
  const editVoiceInput = document.getElementById('editVoiceInput');
  const removeEditImages = document.getElementById('removeEditImages');
  let selectedEditImages = entry.photos || [];
  let selectedEditVideos = entry.videos || [];
  let selectedEditVoice = entry.voice || [];

  sections.forEach(s => s.classList.remove('active'));
  detailSection.classList.add('active');

  document.getElementById('detailTitle').textContent = entry.title || 'No title';
  document.getElementById('detailDate').textContent = entry.date || 'No date';
  document.getElementById('detailMood').textContent = entry.mood || 'No mood';
  document.getElementById('detailContent').textContent = entry.content || '';
  const detailTags = document.getElementById('detailTags');
  detailTags.innerHTML = (entry.tags || []).map(t => `<span class="tag">${t}</span>`).join('');

  const imageSlider = document.getElementById('imageSlider');
  let mediaHtml = '';
  if (entry.photos?.length || entry.videos?.length || entry.voice?.length) {
    if (typeof Swiper !== 'undefined') {
      mediaHtml = `
        <div class="swiper-container">
          <div class="swiper-wrapper">
            ${entry.photos?.map(img => `
              <div class="swiper-slide">
                <img src="${img}" class="entry-thumb" alt="photo"/>
              </div>
            `).join('') || ''}
            ${entry.videos?.map(video => `
              <div class="swiper-slide">
                <video src="${video}" class="video-preview" controls></video>
              </div>
            `).join('') || ''}
            ${entry.voice?.map(audio => `
              <div class="swiper-slide">
                <audio src="${audio}" class="audio-preview" controls></audio>
              </div>
            `).join('') || ''}
          </div>
          <div class="swiper-pagination"></div>
          <div class="swiper-button-prev"></div>
          <div class="swiper-button-next"></div>
        </div>
      `;
    } else {
      mediaHtml = `
        <div class="image-grid">
          ${entry.photos?.map(img => `<img src="${img}" class="entry-thumb" alt="photo"/>`).join('') || ''}
          ${entry.videos?.map(video => `<video src="${video}" class="video-preview" controls></video>`).join('') || ''}
          ${entry.voice?.map(audio => `<audio src="${audio}" class="audio-preview" controls></audio>`).join('') || ''}
        </div>
      `;
    }
  }
  imageSlider.innerHTML = mediaHtml;

  document.getElementById('editTitle').value = entry.title || '';
  document.getElementById('editContent').value = entry.content || '';
  document.getElementById('editMood').value = entry.mood || '';
  const editTagsDisplay = document.getElementById('editTagsDisplay');
  editTagsDisplay.innerHTML = (entry.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  editImages.innerHTML = '';
  entry.photos?.forEach(img => {
    const imgEl = document.createElement('img');
    imgEl.src = img;
    imgEl.className = 'entry-thumb';
    editImages.appendChild(imgEl);
  });
  entry.videos?.forEach(video => {
    const videoEl = document.createElement('video');
    videoEl.src = video;
    videoEl.className = 'video-preview';
    videoEl.controls = true;
    editImages.appendChild(videoEl);
  });
  entry.voice?.forEach(audio => {
    const audioEl = document.createElement('audio');
    audioEl.src = audio;
    audioEl.className = 'audio-preview';
    audioEl.controls = true;
    editImages.appendChild(audioEl);
  });

  editImageInput.addEventListener('change', () => {
    const files = Array.from(editImageInput.files);
    files.forEach(file => {
      compressImage(file, (compressedData) => {
        selectedEditImages.push(compressedData);
        const img = document.createElement('img');
        img.src = compressedData;
        img.className = 'entry-thumb';
        editImages.appendChild(img);
      });
    });
  });

  editVideoInput.addEventListener('change', () => {
    const files = Array.from(editVideoInput.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      selectedEditVideos.push(file);
      const video = document.createElement('video');
      video.src = url;
      video.className = 'video-preview';
      video.controls = true;
      editImages.appendChild(video);
    });
  });

  editVoiceInput.addEventListener('change', () => {
    const files = Array.from(editVoiceInput.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      selectedEditVoice.push(file);
      const audio = document.createElement('audio');
      audio.src = url;
      audio.className = 'audio-preview';
      audio.controls = true;
      editImages.appendChild(audio);
    });
  });

  removeEditImages.addEventListener('click', () => {
    selectedEditImages = [];
    selectedEditVideos = [];
    selectedEditVoice = [];
    editImages.innerHTML = '';
    editImageInput.value = '';
    editVideoInput.value = '';
    editVoiceInput.value = '';
  });

  editForm.addEventListener('submit', async e => {
    e.preventDefault();
    const updatedEntry = {
      title: document.getElementById('editTitle').value.trim(),
      content: document.getElementById('editContent').value.trim(),
      mood: document.getElementById('editMood').value,
      tags: Array.from(editTagsDisplay.querySelectorAll('.tag')).map(t => t.textContent),
      photos: selectedEditImages,
      videos: [],
      voice: []
    };

    const user = auth.currentUser;
    if (user && navigator.onLine) {
      try {
        updatedEntry.videos = await Promise.all(selectedEditVideos.map(async (file, i) => {
          const ref = storageRef(storage, `entries/${user.uid}/${entry.id}/video-${i}.${file.type.split('/')[1]}`);
          await uploadBytes(ref, file);
          return await getDownloadURL(ref);
        }));
        updatedEntry.voice = await Promise.all(selectedEditVoice.map(async (file, i) => {
          const ref = storageRef(storage, `entries/${user.uid}/${entry.id}/voice-${i}.${file.type.split('/')[1]}`);
          await uploadBytes(ref, file);
          return await getDownloadURL(ref);
        }));
        await setDoc(doc(db, 'entries', user.uid, 'userEntries', String(entry.id)), updatedEntry, { merge: true });
      } catch (e) {
        console.warn('Failed to update Firestore:', e);
      }
    }

    const index = entries.findIndex(e => e.id === entry.id);
    entries[index] = { ...entry, ...updatedEntry };
    localStorage.setItem('entries', JSON.stringify(entries));
    showErrorBanner(i18next.t('success.updated'));
    document.getElementById('viewEntriesSection').classList.add('active');
    detailSection.classList.remove('active');
    loadEntries();
  });

  document.getElementById('backToListBtn').addEventListener('click', () => {
    document.getElementById('viewEntriesSection').classList.add('active');
    detailSection.classList.remove('active');
  });

  document.getElementById('deleteEntryBtn').addEventListener('click', async () => {
    if (confirm(i18next.t('confirm.delete'))) {
      const user = auth.currentUser;
      if (user && navigator.onLine) {
        try {
          await deleteDoc(doc(db, 'entries', user.uid, 'userEntries', String(entry.id)));
          for (let i = 0; i < entry.photos?.length; i++) {
            await deleteObject(storageRef(storage, `entries/${user.uid}/${entry.id}/photo-${i}.jpg`));
          }
          for (let i = 0; i < entry.videos?.length; i++) {
            await deleteObject(storageRef(storage, `entries/${user.uid}/${entry.id}/video-${i}.mp4`));
          }
          for (let i = 0; i < entry.voice?.length; i++) {
            await deleteObject(storageRef(storage, `entries/${user.uid}/${entry.id}/voice-${i}.wav`));
          }
        } catch (e) {
          console.warn('Failed to delete from Firestore:', e);
        }
      }
      entries = entries.filter(e => e.id !== entry.id);
      localStorage.setItem('entries', JSON.stringify(entries));
      document.getElementById('viewEntriesSection').classList.add('active');
      detailSection.classList.remove('active');
      loadEntries();
    }
  });

  if (typeof Swiper !== 'undefined') {
    setTimeout(() => {
      imageSlider.querySelectorAll('.swiper-container').forEach(container => {
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
}

// === Friends ===
function setupFriends() {
  const friendForm = document.querySelector('.friend-form');
  const friendList = document.getElementById('friendList');
  const createGroupBtn = document.getElementById('create-group');
  const groupList = document.getElementById('group-list');

  friendForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('friendNameInput').value.trim();
    const emoji = document.getElementById('friendEmojiInput').value.trim();
    if (name) {
      const friend = { id: Date.now(), name, emoji };
      friends.push(friend);
      localStorage.setItem('friends', JSON.stringify(friends));
      document.getElementById('friendNameInput').value = '';
      document.getElementById('friendEmojiInput').value = '';
      loadFriends();
    }
  });

  createGroupBtn.addEventListener('click', async () => {
    const groupName = prompt(i18next.t('prompt.group_name'));
    if (groupName) {
      const group = { id: Date.now(), name: groupName, members: [auth.currentUser.uid] };
      try {
        await setDoc(doc(db, 'groups', String(group.id)), group);
        loadGroups();
      } catch (e) {
        showErrorBanner('Failed to create group: ' + e.message);
      }
    }
  });

  function loadFriends() {
    friendList.innerHTML = '';
    friends.forEach(friend => {
      const div = document.createElement('div');
      div.className = 'friend-item';
      div.innerHTML = `
        <span>${friend.emoji} ${friend.name}</span>
        <button class="edit-friend" data-id="${friend.id}">Edit</button>
        <button class="delete-friend" data-id="${friend.id}">Delete</button>
      `;
      div.querySelector('.edit-friend').addEventListener('click', () => editFriend(friend));
      div.querySelector('.delete-friend').addEventListener('click', () => {
        friends = friends.filter(f => f.id !== friend.id);
        localStorage.setItem('friends', JSON.stringify(friends));
        loadFriends();
      });
      friendList.appendChild(div);
    });
  }

  async function loadGroups() {
    groupList.innerHTML = '';
    const user = auth.currentUser;
    if (user && navigator.onLine) {
      const q = query(collection(db, 'groups'), where('members', 'array-contains', user.uid));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(doc => {
        const group = { ...doc.data(), id: doc.id };
        const div = document.createElement('div');
        div.className = 'group-item';
        div.innerHTML = `
          <span>${group.name}</span>
          <button class="add-member" data-id="${group.id}">Add Member</button>
          <button class="view-group" data-id="${group.id}">View</button>
        `;
        div.querySelector('.add-member').addEventListener('click', () => {
          const email = prompt(i18next.t('prompt.add_member'));
          if (email) {
            addGroupMember(group.id, email);
          }
        });
        div.querySelector('.view-group').addEventListener('click', () => viewGroupDiary(group.id));
        groupList.appendChild(div);
      });
    }
  }

  async function addGroupMember(groupId, email) {
    try {
      const userQuery = query(collection(db, 'users'), where('email', '==', email));
      const userSnap = await getDocs(userQuery);
      if (!userSnap.empty) {
        const userId = userSnap.docs[0].id;
        await updateDoc(doc(db, 'groups', groupId), {
          members: arrayUnion(userId)
        });
        loadGroups();
      } else {
        showErrorBanner('User not found.');
      }
    } catch (e) {
      showErrorBanner('Failed to add member: ' + e.message);
    }
  }

  async function viewGroupDiary(groupId) {
    const section = document.getElementById('viewEntriesSection');
    section.classList.add('active');
    const list = document.getElementById('entriesList');
    list.innerHTML = '';
    try {
      const querySnapshot = await getDocs(collection(db, 'groups', groupId, 'entries'));
      querySnapshot.forEach(doc => {
        const entry = { ...doc.data(), id: doc.id };
        const card = document.createElement('div');
        card.className = 'entry-card';
        card.innerHTML = `
          <h3>${entry.title}</h3>
          <p class="entry-date">${entry.date}</p>
          <p>${entry.mood}</p>
        `;
        card.addEventListener('click', () => showEntryDetail(entry));
        list.appendChild(card);
      });
    } catch (e) {
      showErrorBanner('Failed to load group diary: ' + e.message);
    }
  }

  function editFriend(friend) {
    const sections = document.querySelectorAll('.section');
    const editSection = document.getElementById('editFriendSection');
    sections.forEach(s => s.classList.remove('active'));
    editSection.classList.add('active');
    document.getElementById('editFriendName').value = friend.name;
    document.getElementById('editFriendEmoji').value = friend.emoji;

    document.getElementById('editFriendForm').addEventListener('submit', e => {
      e.preventDefault();
      const newName = document.getElementById('editFriendName').value.trim();
      const newEmoji = document.getElementById('editFriendEmoji').value.trim();
      friends = friends.map(f => f.id === friend.id ? { ...f, name: newName, emoji: newEmoji } : f);
      localStorage.setItem('friends', JSON.stringify(friends));
      document.getElementById('friendsSection').classList.add('active');
      editSection.classList.remove('active');
      loadFriends();
    });

    document.getElementById('backFriendBtn').addEventListener('click', () => {
      document.getElementById('friendsSection').classList.add('active');
      editSection.classList.remove('active');
    });
  }

  loadFriends();
  loadGroups();
}

// === Statistics ===
function setupStats() {
  const moodChart = new Chart(document.getElementById('moodChart'), {
    type: 'pie',
    data: {
      labels: ['Happy', 'Sad', 'Excited', 'Angry', 'Calm'],
      datasets: [{
        data: [0, 0, 0, 0, 0],
        backgroundColor: ['#FFD700', '#1E90FF', '#FF69B4', '#FF4500', '#32CD32']
      }]
    },
    options: { responsive: true }
  });

  const tagChart = new Chart(document.getElementById('tagChart'), {
    type: 'bar',
    data: {
      labels: [],
      datasets: [{
        label: i18next.t('stats.tag_frequency'),
        data: [],
        backgroundColor: '#5e60ce'
      }]
    },
    options: { responsive: true }
  });

  function updateStats() {
    const moodCounts = { Happy: 0, Sad: 0, Excited: 0, Angry: 0, Calm: 0 };
    const tagCounts = {};
    entries.forEach(entry => {
      if (entry.mood) moodCounts[entry.mood]++;
      (entry.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    moodChart.data.datasets[0].data = Object.values(moodCounts);
    tagChart.data.labels = Object.keys(tagCounts);
    tagChart.data.datasets[0].data = Object.values(tagCounts);
    moodChart.update();
    tagChart.update();
  }

  updateStats();
}

// === Settings ===
function setupSettings() {
  const profilePicInput = document.getElementById('profilePicInput');
  const themeSelect = document.getElementById('themeSelect');
  const newPinInput = document.getElementById('newPinInput');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');

  profilePicInput.addEventListener('change', async () => {
    const file = profilePicInput.files[0];
    if (file) {
      compressImage(file, async (compressedData) => {
        document.getElementById('profilePic').src = compressedData;
        document.getElementById('profilePicHeader').src = compressedData;
        const user = auth.currentUser;
        if (user && navigator.onLine) {
          const ref = storageRef(storage, `profiles/${user.uid}/profile.jpg`);
          const blob = await (await fetch(compressedData)).blob();
          await uploadBytes(ref, blob);
          const url = await getDownloadURL(ref);
          await updateProfile(user, { photoURL: url });
        }
        localStorage.setItem('profilePic', compressedData);
      });
    }
  });

  themeSelect.addEventListener('change', () => {
    document.body.className = themeSelect.value;
    localStorage.setItem('theme', themeSelect.value);
  });

  saveSettingsBtn.addEventListener('click', async () => {
    const pin = newPinInput.value.trim();
    if (pin && (pin.length < 4 || pin.length > 6 || !/^\d+$/.test(pin))) {
      showErrorBanner('PIN must be 4-6 digits.');
      return;
    }
    if (pin) {
      localStorage.setItem('userPin', pin);
      const user = auth.currentUser;
      if (user && navigator.onLine) {
        await setDoc(doc(db, 'users', user.uid), { pin }, { merge: true });
      }
    }
    showErrorBanner(i18next.t('success.settings_saved'));
  });
}

// === Calendar ===
function setupCalendar() {
  const calendarEl = document.getElementById('calendar');
  if (calendarEl) {
    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      dateClick: (info) => filterEntriesByDate(info.dateStr),
      events: entries.map(entry => ({
        title: entry.title,
        start: entry.date,
        id: entry.id
      }))
    });
    calendar.render();
  }

  const toggleViewBtn = document.getElementById('toggle-view');
  if (toggleViewBtn) {
    toggleViewBtn.addEventListener('click', () => {
      const entriesList = document.getElementById('entriesList');
      calendarEl.style.display = calendarEl.style.display === 'none' ? 'block' : 'none';
      entriesList.style.display = calendarEl.style.display === 'none' ? 'block' : 'none';
      toggleViewBtn.textContent = calendarEl.style.display === 'none' ? i18next.t('calendar.switch') : i18next.t('calendar.list');
    });
  }
}

// === Export/Import ===
function setupExportImport() {
  const exportBtn = document.getElementById('exportDataBtn');
  const importBtn = document.getElementById('importDataBtn');
  const importInput = document.getElementById('importDataInput');
  const exportPDFBtn = document.getElementById('export-entries');

  exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify(entries);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'social_diary_export.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener('click', () => {
    importInput.click();
  });

  importInput.addEventListener('change', async () => {
    const file = importInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const importedEntries = JSON.parse(e.target.result);
          entries = [...entries, ...importedEntries];
          localStorage.setItem('entries', JSON.stringify(entries));
          const user = auth.currentUser;
          if (user && navigator.onLine) {
            for (const entry of importedEntries) {
              await setDoc(doc(db, 'entries', user.uid, 'userEntries', String(entry.id)), entry);
            }
          }
          loadEntries();
          showErrorBanner(i18next.t('success.imported'));
        } catch (e) {
          showErrorBanner('Import failed: ' + e.message);
        }
      };
      reader.readAsText(file);
    }
  });

  exportPDFBtn.addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    entries.forEach((entry, i) => {
      doc.text(`${entry.date}: ${entry.title}`, 10, y);
      doc.text(entry.content.substring(0, 100), 10, y + 10);
      y += 30;
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
    });
    doc.save('social_diary.pdf');
  });
}

// === PWA ===
function setupPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    const installBtn = document.createElement('button');
    installBtn.textContent = i18next.t('pwa.install');
    installBtn.className = 'install-btn';
    document.body.appendChild(installBtn);
    installBtn.addEventListener('click', () => {
      e.prompt();
      e.userChoice.then(choice => {
        if (choice.outcome === 'accepted') {
          installBtn.remove();
        }
      });
    });
  });
}

// === Favorites Filter ===
function setupFavoritesFilter() {
  const filterBtn = document.getElementById('filterFavoritesBtn');
  filterBtn.addEventListener('click', () => {
    loadEntries('', document.getElementById('sortSelect').value, true);
  });
}

// === Daily Reminder ===
function setupDailyReminder() {
  const reminderTime = document.getElementById('reminderTime');
  const reminderToggle = document.getElementById('reminderToggle');
  reminderToggle.addEventListener('change', () => {
    if (reminderToggle.checked && reminderTime.value) {
      const [hours, minutes] = reminderTime.value.split(':');
      const now = new Date();
      const reminder = new Date();
      reminder.setHours(hours, minutes, 0, 0);
      if (reminder < now) reminder.setDate(reminder.getDate() + 1);
      const msUntilReminder = reminder - now;
      setTimeout(() => {
        if (Notification.permission === 'granted') {
          new Notification(i18next.t('reminder.message'), { body: i18next.t('reminder.body') });
        }
        setInterval(() => {
          if (Notification.permission === 'granted') {
            new Notification(i18next.t('reminder.message'), { body: i18next.t('reminder.body') });
          }
        }, 24 * 60 * 60 * 1000);
      }, msUntilReminder);
    }
  });
}

// === Stickers ===
function setupStickers() {
  const toggleEmojiBtn = document.getElementById('toggleEmojiPicker');
  const emojiList = document.getElementById('emojiList');
  const emojis = ['😊', '🎉', '🌟', '💖', '🚀'];

  toggleEmojiBtn.addEventListener('click', () => {
    emojiList.style.display = emojiList.style.display === 'none' ? 'block' : 'none';
    emojiList.setAttribute('aria-hidden', emojiList.style.display === 'none');
    emojiList.innerHTML = emojis.map(e => `<span class="emoji">${e}</span>`).join('');
    emojiList.querySelectorAll('.emoji').forEach(emoji => {
      emoji.addEventListener('click', () => {
        document.getElementById('entryContent').value += emoji.textContent;
        emojiList.style.display = 'none';
      });
    });
  });
}

// === Logout ===
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('pinUnlocked');
      window.location.href = 'login.html';
    } catch (e) {
      showErrorBanner('Logout failed: ' + e.message);
    }
  });
}

// === Search ===
function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  searchInput.addEventListener('input', () => {
    loadEntries(searchInput.value, sortSelect.value);
  });
  sortSelect.addEventListener('change', () => {
    loadEntries(searchInput.value, sortSelect.value);
  });
}
