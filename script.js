// --- Element Selection ---
const noteForm = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const noteCategory = document.querySelector("#note-category");
const errorMessage = document.querySelector("#error-message");
const searchInput = document.querySelector("#search-input");
const noteCount = document.querySelector("#note-count");
const notesList = document.querySelector("#notes-list");
const clearAllBtn = document.querySelector("#clear-all-btn");

const STORAGE_KEY = "quicknotes_app_data";

// --- State ---
let notes = [];

// --- Helper Functions ---
function getFormattedDate() {
  const now = new Date();
  return now.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      notes = JSON.parse(saved);
    } catch (e) {
      notes = [];
    }
  }
}

function updateNoteCount(count) {
  if (count === 0) {
    noteCount.textContent = "You have no notes yet.";
  } else if (count === 1) {
    noteCount.textContent = "You have 1 note.";
  } else {
    noteCount.textContent = `You have ${count} notes.`;
  }
}

// --- Render Function ---
function render() {
  notesList.innerHTML = "";
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(searchTerm)
  );

  updateNoteCount(filteredNotes.length);

  if (notes.length > 0 && filteredNotes.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "empty-search-msg";
    emptyLi.textContent = "No notes match your search.";
    notesList.appendChild(emptyLi);
    return;
  }

  filteredNotes.forEach((note) => {
    // <li> container
    const li = document.createElement("li");
    li.className = `note-card category-${note.category.toLowerCase()}`;

    // Note content wrapper
    const contentDiv = document.createElement("div");
    contentDiv.className = "note-content";

    // Text (safe with textContent)
    const textP = document.createElement("p");
    textP.className = "note-text";
    textP.textContent = note.text;

    // Metadata (category tag & timestamp)
    const metaDiv = document.createElement("div");
    metaDiv.className = "note-meta";

    const tagSpan = document.createElement("span");
    tagSpan.className = "category-tag";
    tagSpan.textContent = note.category;

    const timeSpan = document.createElement("span");
    timeSpan.className = "note-time";
    timeSpan.textContent = note.createdAt;

    metaDiv.appendChild(tagSpan);
    metaDiv.appendChild(timeSpan);

    contentDiv.appendChild(textP);
    contentDiv.appendChild(metaDiv);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteNote(note.id);
    });

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);

    notesList.appendChild(li);
  });
}

// --- Note Actions ---
function addNote(text, category) {
  const newNote = {
    id: Date.now().toString(),
    text: text,
    category: category,
    createdAt: getFormattedDate(),
  };

  notes.unshift(newNote);
  saveNotes();
  render();
}

function deleteNote(id) {
  notes = notes.filter((n) => n.id !== id);
  saveNotes();
  render();
}

// --- Event Listeners ---
noteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = noteInput.value.trim();

  // Validation
  if (text === "") {
    errorMessage.textContent = "Please type a note first.";
    return;
  }
  if (text.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  errorMessage.textContent = "";
  addNote(text, noteCategory.value);

  noteForm.reset();
  noteInput.focus();
});

// Search input
searchInput.addEventListener("input", () => {
  render();
});

// Bonus: Clear all notes
clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;
  const confirmed = confirm("Delete all notes?");
  if (confirmed) {
    notes = [];
    saveNotes();
    render();
  }
});

// --- Initialize ---
loadNotes();
render();