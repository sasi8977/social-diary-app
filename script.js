
let selectedMood = '';
let entries = [];

document.addEventListener("DOMContentLoaded", () => {
  // Mood selection
  document.querySelectorAll(".mood-option").forEach(option => {
    option.addEventListener("click", () => {
      selectedMood = option.dataset.mood;
      document.getElementById("selected-mood").textContent = \`You feel: \${selectedMood}\`;
    });
  });

  // Handle entry form submission
  document.getElementById("diary-form").addEventListener("submit", e => {
    e.preventDefault();

    const title = document.getElementById("entry-title").value.trim();
    const content = document.getElementById("entry-content").value.trim();
    const date = document.getElementById("entry-date").value;
    const tagsInput = document.getElementById("tag-input").value.trim();

    if (!title || !content || !date || !selectedMood) {
      alert("Please fill in all fields and select a mood.");
      return;
    }

    const tags = tagsInput ? tagsInput.split(",").map(tag => tag.trim()) : [];

    const newEntry = {
      id: Date.now(),
      title,
      content,
      date,
      mood: selectedMood,
      tags
    };

    entries.push(newEntry);
    saveEntries();
    displayEntries();
    renderstats();
    document.getElementById("diary-form").reset();
    document.getElementById("selected-mood").textContent = "";
    selectedMood = "";
  });

  displayEntries();
});

// Save entries to localStorage
function saveEntries() {
  localStorage.setItem("diaryEntries", JSON.stringify(entries));
}

// Load entries from localStorage
function loadEntries() {
  const saved = localStorage.getItem("diaryEntries");
  if (saved) entries = JSON.parse(saved);
}

// Display entries on the page
entries.forEach(entry=> {
renderEntry(entry);
});
  // clear the old list
  document.getElementById('entrieslist').innerHTML = '';

  // loop through entries
  entries.forEach(entry => {
    // OLD CODE: build entry HTML (probably as a list or basic div)

    // 🔥 Replace that block with the new renderEntry(entry)
  });
}
  loadEntries();
  const list = document.getElementById("entries-list");
  list.innerHTML = "";

  if (entries.length === 0) {
    list.innerHTML = "<p>No entries yet.</p>";
    return;
  }

  entries.forEach(entry => {
    const card = document.createElement("div");
    card.className = "entry-card";

    card.innerHTML = \`
      <h3>\${entry.title}</h3>
      <div class="entry-meta">
        <span>\${entry.date}</span> • <span>Mood: \${entry.mood}</span>
      </div>
      <p>\${entry.content.substring(0, 150)}...</p>
      <div class="entry-tags">
        \${entry.tags.map(tag => \`<span>#\${tag}</span>\`).join("")}
      </div>
    \`;

    list.appendChild(card);
    const dateDisplay = document.getElementById("today-date");
const today = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "short",
  day: "numeric"
});
dateDisplay.textContent = `Today is ${today}`;
 });
}
function renderEntry(entry) {
  const card = document.createElement('div');
  card.classList.add('entry-card');

  const title = document.createElement('h3');
  title.textContent = entry.title;

  const meta = document.createElement('div');
  meta.classList.add('entry-meta');
  meta.textContent = `${entry.date} • ${entry.mood}`;

  const content = document.createElement('div');
  content.classList.add('entry-content-preview');
  content.textContent = entry.content;

  const tags = document.createElement('div');
  tags.classList.add('entry-tags');
  entry.tags.forEach(tag => {
    const tagEl = document.createElement('span');
    tagEl.classList.add('entry-tag');
    tagEl.textContent = tag;
    tags.appendChild(tagEl);
  });

  card.append(title, meta, content, tags);
  document.getElementById('entrieslist').appendChild(card);
}
function renderStats() {
  const total = entries.length;
  document.getElementById("totalEntries").textContent = total;

  // Mood count
  const counts = {};
  entries.forEach(e => {
    counts[e.mood] = (counts[e.mood] || 0) + 1;
  });

  // Most frequent mood
  const frequent = Object.entries(counts).sort((a,b) => b[1] - a[1])[0];
  document.getElementById("frequentMood").textContent = frequent ? frequent[0] : "-";

  // Mood chart bars
  const chart = document.getElementById("moodChart");
  chart.innerHTML = "";
  Object.entries(counts).forEach(([mood, count]) => {
    const pct = Math.round((count/total) * 100);
    const row = document.createElement("div");
    row.className = "mood-bar";
    row.innerHTML = `
      <span>${mood.charAt(0).toUpperCase()+mood.slice(1)}</span>
      <div style="width:${pct}%;"></div>
      <span style="margin-left:0.5rem">${pct}%</span>
    `;
    chart.appendChild(row);
  });

  // Word cloud
  const wc = document.getElementById("wordCloud");
  wc.innerHTML = "";
  const freq = {};
  entries.forEach(e => {
    e.content.toLowerCase().split(/\W+/).forEach(w => {
      if (w.length > 3) freq[w] = (freq[w] || 0) + 1;
    });
  });
  const sorted = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 30);
  sorted.forEach(([word, count]) => {
    const span = document.createElement("span");
    const size = 12 + count * 2;
    span.textContent = word;
    span.style.fontSize = size + "px";
    wc.appendChild(span);
  });
}
