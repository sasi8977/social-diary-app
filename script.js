import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithPhoneNumber, RecaptchaVerifier } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-functions.js';
import { getAnalytics, logEvent } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js';
import { initializeI18n, loadTranslations, t } from 'https://cdn.jsdelivr.net/npm/i18next@21.9.2/dist/esm/i18next.js';
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@3.9.1/dist/chart.min.js';
import { jsPDF } from 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.es.min.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD0iJWnkuinWVCtsO5vjqohrCA4ws6fb8Q",
  authDomain: "social-diary-b6754.firebaseapp.com",
  projectId: "social-diary-b6754",
  storageBucket: "social-diary-b6754.appspot.com",
  messagingSenderId: "324502839373",
  appId: "1:324502839373:web:05b3f62f18dd78f14bbc04",
  measurementId: "G-6NSE70KRLB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);
const analytics = getAnalytics(app);

// Initialize i18n for multilingual support
await initializeI18n({
  lng: 'en',
  resources: {
    en: { translation: await fetch('/languages/en.json').then(res => res.json()) },
    es: { translation: await fetch('/languages/es.json').then(res => res.json()) },
    zh: { translation: await fetch('/languages/zh.json').then(res => res.json()) },
    hi: { translation: await fetch('/languages/hi.json').then(res => res.json()) }
  }
});

// Check user authentication
auth.onAuthStateChanged(user => {
  if (!user) window.location.href = 'login.html';
  loadEntries();
  loadFriends();
  loadGroups();
  generatePrompt();
  updateAnalytics();
});

// DOM elements
const entryText = document.getElementById('entry-text');
const moodSelect = document.getElementById('mood-select');
const imageUpload = document.getElementById('image-upload');
const videoUpload = document.getElementById('video-upload');
const voiceUpload = document.getElementById('voice-upload');
const voiceRecord = document.getElementById('voice-record');
const saveEntry = document.getElementById('save-entry');
const entryList = document.getElementById('entry-list');
const calendar = document.getElementById('calendar');
const toggleView = document.getElementById('toggle-view');
const moodChart = document.getElementById('mood-chart').getContext('2d');
const tagChart = document.getElementById('tag-chart').getContext('2d');
const friendEmail = document.getElementById('friend-email');
const addFriend = document.getElementById('add-friend');
const friendList = document.getElementById('friend-list');
const createGroup = document.getElementById('create-group');
const groupList = document.getElementById('group-list');
const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const chatMessages = document.getElementById('chat-messages');
const aiPrompt = document.getElementById('ai-prompt');
const exportEntries = document.getElementById('export-entries');
const languageSelect = document.getElementById('language-select');
const themeToggle = document.getElementById('theme-toggle');
const errorBanner = document.getElementById('error-banner');

// Show error banner
function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
  setTimeout(() => errorBanner.hidden = true, 3000);
}

// Save entry to Firestore and IndexedDB
async function saveEntry() {
  try {
    const text = entryText.value;
    const mood = moodSelect.value;
    const user = auth.currentUser;
    if (!text || !mood) return showError(t('error.enter_text_mood'));

    const entry = { text, mood, timestamp: new Date(), userId: user.uid };
    let imageUrl, videoUrl, voiceUrl;

    // Handle media uploads
    if (imageUpload.files[0]) {
      const imageRef = ref(storage, `images/${user.uid}/${Date.now()}`);
      await uploadBytes(imageRef, imageUpload.files[0]);
      imageUrl = await getDownloadURL(imageRef);
      entry.image = imageUrl;
    }
    if (videoUpload.files[0]) {
      const videoRef = ref(storage, `videos/${user.uid}/${Date.now()}`);
      await uploadBytes(videoRef, videoUpload.files[0]);
      videoUrl = await getDownloadURL(videoRef);
      entry.video = videoUrl;
    }
    if (voiceUpload.files[0]) {
      const voiceRef = ref(storage, `voice/${user.uid}/${Date.now()}`);
      await uploadBytes(voiceRef, voiceUpload.files[0]);
      voiceUrl = await getDownloadURL(voiceRef);
      entry.voice = voiceUrl;
    }

    // AI auto-tagging
    const tagFunction = httpsCallable(functions, 'generateTags');
    const tags = await tagFunction({ text }).then(res => res.data.tags);
    entry.tags = tags;

    // Save to Firestore
    await addDoc(collection(db, 'entries'), entry);

    // Save to IndexedDB for offline
    const dbRequest = indexedDB.open('SocialDiaryDB', 1);
    dbRequest.onsuccess = () => {
      const idb = dbRequest.result;
      const tx = idb.transaction('entries', 'readwrite');
      tx.objectStore('entries').add(entry);
    };

    logEvent(analytics, 'entry_saved');
    entryText.value = '';
    imageUpload.value = '';
    videoUpload.value = '';
    voiceUpload.value = '';
    loadEntries();
    generatePrompt();
  } catch (error) {
    showError(t('error.save_entry_failed'));
  }
}

// Load entries from Firestore or IndexedDB
async function loadEntries(date = null) {
  try {
    const user = auth.currentUser;
    let q = query(collection(db, 'entries'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
    if (date) q = query(q, where('timestamp', '>=', date), where('timestamp', '<', new Date(date.getTime() + 86400000)));
    const snapshot = await getDocs(q);
    entryList.innerHTML = '';
    snapshot.forEach(doc => {
      const entry = doc.data();
      const div = document.createElement('div');
      div.className = 'entry';
      div.innerHTML = `
        <p>${entry.text}</p>
        <p>Mood: ${entry.mood}</p>
        ${entry.image ? `<img src="${entry.image}" alt="Entry image">` : ''}
        ${entry.video ? `<video src="${entry.video}" controls></video>` : ''}
        ${entry.voice ? `<audio src="${entry.voice}" controls></audio>` : ''}
        <p>Tags: ${entry.tags.join(', ')}</p>
        <button class="share-x" data-id="${doc.id}">${t('share_x')}</button>
      `;
      entryList.appendChild(div);
    });

    // Load from IndexedDB if offline
    if (!navigator.onLine) {
      const dbRequest = indexedDB.open('SocialDiaryDB', 1);
      dbRequest.onsuccess = () => {
        const idb = dbRequest.result;
        const tx = idb.transaction('entries', 'readonly');
        tx.objectStore('entries').getAll().onsuccess = e => {
          e.target.result.forEach(entry => {
            const div = document.createElement('div');
            div.className = 'entry';
            div.innerHTML = `
              <p>${entry.text}</p>
              <p>Mood: ${entry.mood}</p>
              ${entry.image ? `<img src="${entry.image}" alt="Entry image">` : ''}
              ${entry.video ? `<video src="${entry.video}" controls></video>` : ''}
              ${entry.voice ? `<audio src="${entry.voice}" controls></audio>` : ''}
              <p>Tags: ${entry.tags.join(', ')}</p>
            `;
            entryList.appendChild(div);
          });
        };
      }
    }

    updateCharts();
  } catch (error) {
    showError(t('error.load_entries_failed'));
  }
}

// Initialize calendar
const calendarInstance = new FullCalendar.Calendar(calendar, {
  initialView: 'dayGridMonth',
  dateClick: info => loadEntries(new Date(info.dateStr))
});
calendarInstance.render();

// Toggle calendar/list view
toggleView.addEventListener('click', () => {
  calendar.hidden = !calendar.hidden;
  entryList.hidden = !entryList.hidden;
  toggleView.textContent = calendar.hidden ? t('switch_calendar') : t('switch_list');
});

// Update mood and tag charts
async function updateCharts() {
  const user = auth.currentUser;
  const snapshot = await getDocs(query(collection(db, 'entries'), where('userId', '==', user.uid)));
  const moods = {};
  const tags = {};
  snapshot.forEach(doc => {
    const entry = doc.data();
    moods[entry.mood] = (moods[entry.mood] || 0) + 1;
    entry.tags.forEach(tag => tags[tag] = (tags[tag] || 0) + 1);
  });

  new Chart(moodChart, {
    type: 'line',
    data: {
      labels: Object.keys(moods),
      datasets: [{ label: t('mood_trend'), data: Object.values(moods), borderColor: '#5e60ce' }]
    }
  });
  new Chart(tagChart, {
    type: 'bar',
    data: {
      labels: Object.keys(tags),
      datasets: [{ label: t('tag_frequency'), data: Object.values(tags), backgroundColor: '#5e60ce' }]
    }
  });
}

// Voice recording
let mediaRecorder;
voiceRecord.addEventListener('click', async () => {
  if (!mediaRecorder) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    mediaRecorder.ondataavailable = e => chunks.push(e.data);
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      voiceUpload.files = new DataTransfer().files;
      voiceUpload.files[0] = new File([blob], 'voice.webm');
    };
    mediaRecorder.start();
    voiceRecord.textContent = '🛑 Stop';
  } else {
    mediaRecorder.stop();
    mediaRecorder = null;
    voiceRecord.textContent = '🎙️ Record';
  }
});

// Generate AI prompt
async function generatePrompt() {
  try {
    const promptFunction = httpsCallable(functions, 'generatePrompt');
    const result = await promptFunction({ userId: auth.currentUser.uid });
    aiPrompt.textContent = result.data.prompt;
    aiPrompt.hidden = false;
  } catch (error) {
    showError(t('error.generate_prompt_failed'));
  }
}

// Chat with AI
sendChat.addEventListener('click', async () => {
  const message = chatInput.value;
  if (!message) return;
  const div = document.createElement('div');
  div.textContent = `You: ${message}`;
  chatMessages.appendChild(div);
  try {
    const chatFunction = httpsCallable(functions, 'chatWithAI');
    const result = await chatFunction({ userId: auth.currentUser.uid, message });
    const aiDiv = document.createElement('div');
    aiDiv.textContent = `AI: ${result.data.response}`;
    chatMessages.appendChild(aiDiv);
    chatInput.value = '';
  } catch (error) {
    showError(t('error.chat_failed'));
  }
});

// Add friend
addFriend.addEventListener('click', async () => {
  const email = friendEmail.value;
  try {
    await addDoc(collection(db, 'friends'), { userId: auth.currentUser.uid, friendEmail: email });
    friendEmail.value = '';
    loadFriends();
  } catch (error) {
    showError(t('error.add_friend_failed'));
  }
});

// Load friends
async function loadFriends() {
  const snapshot = await getDocs(query(collection(db, 'friends'), where('userId', '==', auth.currentUser.uid)));
  friendList.innerHTML = '';
  snapshot.forEach(doc => {
    const friend = doc.data();
    const div = document.createElement('div');
    div.textContent = friend.friendEmail;
    friendList.appendChild(div);
  });
}

// Create group diary
createGroup.addEventListener('click', async () => {
  const name = prompt(t('enter_group_name'));
  if (!name) return;
  try {
    await addDoc(collection(db, 'groups'), { name, ownerId: auth.currentUser.uid, members: [auth.currentUser.uid] });
    loadGroups();
  } catch (error) {
    showError(t('error.create_group_failed'));
  }
});

// Load group diaries
async function loadGroups() {
  const snapshot = await getDocs(query(collection(db, 'groups'), where('members', 'array-contains', auth.currentUser.uid)));
  groupList.innerHTML = '';
  snapshot.forEach(doc => {
    const group = doc.data();
    const div = document.createElement('div');
    div.textContent = group.name;
    groupList.appendChild(div);
  });
}

// Share to X
entryList.addEventListener('click', async e => {
  if (e.target.classList.contains('share-x')) {
    const entryId = e.target.dataset.id;
    try {
      const linkFunction = httpsCallable(functions, 'createDynamicLink');
      const result = await linkFunction({ entryId });
      const link = result.data.link;
      window.open(`https://x.com/intent/tweet?text=${t('check_entry')}&url=${link}`);
    } catch (error) {
      showError(t('error.share_failed'));
    }
  }
});

// Export entries
exportEntries.addEventListener('click', async () => {
  try {
    const snapshot = await getDocs(query(collection(db, 'entries'), where('userId', '==', auth.currentUser.uid)));
    const doc = new jsPDF();
    snapshot.forEach(entry => {
      doc.text(entry.data().text, 10, 10);
      doc.addPage();
    });
    doc.save('entries.pdf');
  } catch (error) {
    showError(t('error.export_failed'));
  }
});

// Language switch
languageSelect.addEventListener('change', () => {
  i18n.changeLanguage(languageSelect.value);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
});

// Theme toggle
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('eye-protection');
});

// Save entry on click
saveEntry.addEventListener('click', saveEntry);


