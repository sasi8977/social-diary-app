// script.js - Social Diary Logic

document.addEventListener("DOMContentLoaded", () => {
  // Navigation between sections
  const sections = document.querySelectorAll(".section");
  const showSection = (id) => {
    sections.forEach((section) => section.classList.remove("active-section"));
    document.getElementById(id).classList.add("active-section");
  };

  document.getElementById("newentrybtn").onclick = () => showSection("newentrysection");
  document.getElementById("viewentriesbtn").onclick = () => showSection("viewentriessection");
  document.getElementById("statsbtn").onclick = () => showSection("statssection");
  document.getElementById("settingsbtn").onclick = () => showSection("settingssection");

  // Mood selection
  const moodOptions = document.querySelectorAll(".mood-option");
  const selectedMoodDisplay = document.getElementById("selected-mood");
  let selectedMood = "";

  moodOptions.forEach(option => {
    option.addEventListener("click", () => {
      selectedMood = option.dataset.mood;
      selectedMoodDisplay.textContent = `Mood: ${selectedMood}`;
    });
  });

  // Tags handling
  const tagInput = document.getElementById("taginput");
  const tagsDisplay = document.getElementById("tagsdisplay");
  const addTagBtn = document.getElementById("addtagbtn");
  let tags = [];

  addTagBtn.addEventListener("click", () => {
    const tag = tagInput.value.trim();
    if (tag && !tags.includes(tag)) {
      tags.push(tag);
      renderTags();
      tagInput.value = "";
    }
  });

  const renderTags = () => {
    tagsDisplay.innerHTML = "";
    tags.forEach((tag) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = tag;
      span.onclick = () => {
        tags = tags.filter(t => t !== tag);
        renderTags();
      };
      tagsDisplay.appendChild(span);
    });
  };

  // Save entry
  const diaryForm = document.getElementById("diaryform");
  const entriesList = document.getElementById("entrieslist");
  let entries = JSON.parse(localStorage.getItem("entries")) || [];

  const saveEntries = () => {
    localStorage.setItem("entries", JSON.stringify(entries));
  };

  const renderEntries = () => {
    entriesList.innerHTML = "";
    entries.forEach((entry, index) => {
      const card = document.createElement("div");
      card.className = "entry-card";
      card.innerHTML = `
        <h3>${entry.title}</h3>
        <div class="entry-meta">
          <span>${entry.date}</span>
          <span>${entry.mood}</span>
        </div>
        <div class="entry-content-preview">${entry.content}</div>
        <div class="entry-tags">${entry.tags.map(t => `<span class='tag'>${t}</span>`).join('')}</div>
      `;
      entriesList.appendChild(card);
    });
  };

  diaryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const date = document.getElementById("entrydate").value;
    const title = document.getElementById("entrytitle").value;
    const content = document.getElementById("entrycontent").value;
    if (!date || !title || !content) return;
    entries.push({ date, title, content, tags: [...tags], mood: selectedMood });
    saveEntries();
    renderEntries();
    diaryForm.reset();
    tags = [];
    renderTags();
    selectedMoodDisplay.textContent = "";
    selectedMood = "";
    showSection("viewentriessection");
  });

  // Initialize
  renderEntries();
});
