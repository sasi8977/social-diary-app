let selectedMood = '';
let entries = JSON.parse(localStorage.getItem("entries")) || [];

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

  // === Emoji Picker ===
  const emojiPickerBtn = document.getElementById("toggleEmojiPicker");
  const emojiList = document.getElementById("emojiList");
  const entryContent = document.getElementById("entryContent");

  const emojis = ["😊", "😢", "😂", "😍", "😠", "😎", "👍", "🎉", "💖", "🙏", "🌈", "🔥"];

  emojiPickerBtn?.addEventListener("click", () => {
    emojiList.style.display = emojiList.style.display === "none" ? "flex" : "none";
  });

  if (emojiList) {
    emojiList.innerHTML = emojis.map(e => `<span>${e}</span>`).join("");
    emojiList.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        entryContent.value += e.target.textContent;
      }
    });
  }
});

// 📅 Date Display
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
      tags: Array.from(document.querySelectorAll('#tagsDisplay .tag')).map(tag => tag.textContent),
      gifUrl: document.getElementById('gifUrl')?.value || ""
    };

    entries.push(entry);
    localStorage.setItem('entries', JSON.stringify(entries));
    alert('Diary entry saved!');
    diaryForm.reset();
    document.getElementById('tagsDisplay').innerHTML = '';
    selectedMood = '';
    document.getElementById('selectedMood').textContent = '';
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

// 👤 Username Display from localStorage
const usernameDisplay = document.getElementById('usernameDisplay');
const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));
if (currentUser && currentUser.username) {
  usernameDisplay.textContent = currentUser.username;
}

// 📲 PWA Install Button
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = 'inline-block';
});

installBtn?.addEventListener('click', () => {
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(choice => {
    if (choice.outcome === 'accepted') {
      installBtn.style.display = 'none';
    }
  });
});

// 🔗 Share Button
const shareBtn = document.getElementById('shareBtn');
if (navigator.share) {
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

profilePicInput?.addEventListener('change', function () {
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

// Load saved avatar
const savedAvatar = localStorage.getItem('avatarImage');
if (savedAvatar) {
  profilePic.src = savedAvatar;
}
// 🎉 Emoji Picker Logic
const emojiList = ['😀', '😅', '😍', '😢', '😠', '🤔', '🎉', '❤️', '👍', '👎'];
const emojiListDiv = document.getElementById('emojiList');
const toggleEmojiPicker = document.getElementById('toggleEmojiPicker');
const entryContent = document.getElementById('entryContent');

emojiList.forEach(emoji => {
  const btn = document.createElement('button');
  btn.textContent = emoji;
  btn.className = 'emoji-btn';
  btn.addEventListener('click', () => {
    entryContent.value += emoji;
  });
  emojiListDiv.appendChild(btn);
});

toggleEmojiPicker.addEventListener('click', () => {
  emojiListDiv.style.display = emojiListDiv.style.display === 'none' ? 'flex' : 'none';
});

// 🖼️ Show GIF in entry
const gifUrlInput = document.getElementById('gifUrl');
const saveEntryBtn = document.getElementById('saveEntryBtn');

if (saveEntryBtn) {
  saveEntryBtn.addEventListener('click', () => {
    const gifUrl = gifUrlInput.value.trim();
    if (gifUrl) {
      const img = document.createElement('img');
      img.src = gifUrl;
      img.alt = "GIF";
      img.style.maxWidth = "100%";
      entryContent.value += `\n[GIF]: ${gifUrl}`;
    }
  });
}
