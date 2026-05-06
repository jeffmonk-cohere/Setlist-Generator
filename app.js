const demoSongTitles = new Set(["amazing grace", "stand by me", "house set opener"]);

const metadataRows = `Big Empty|Alternative rock|Dark
Bleed Out|Alternative rock|Dark
Hate Me Acoustic|Alternative rock|Dark
Little Black Submarines|Alternative rock|Dark
Candle in the Wind|Classic rock|Dark
Hotel California|Classic rock|Dark
Broken Window Serenade|Country|Dark
Cover Me Up|Country|Dark
It Ain't the Whiskey|Country|Dark
Shake the Frost|Country|Dark
Nothing Compares 2 U|Grunge|Dark
Nutshell|Grunge|Dark
Rooster|Grunge|Dark
Hard to Handle|Classic Rock|Driving
You Wreck Me|Classic Rock|Driving
Feathered Indians|Country|Driving
White Horse|Country|Driving
Whitehouse Road|Country|Driving
Carousel|Rock|Driving
Tidal Wave|Rock|Driving
Where the Streets Have No Name|Rock|Driving
Chasing Cars|Alternative rock|Emotional
Come Down|Alternative rock|Emotional
Mama, I'm Coming Home|Classic Rock|Emotional
Simple Man|Classic rock|Emotional
Oneida|Country|Emotional
If You're Gone|Rock|Emotional
Black Gold|Alternative rock|Gritty
Lonely Is the Night|Classic rock|Gritty
Backroads|Country|Gritty
Ballad of a Southern Man|Country|Gritty
Fire Away|Country|Gritty
Folsom Prison Blues|Country|Gritty
Nose on the Grindstone|Country|Gritty
Black Chandelier|Alternative rock|Gritty
A Long December|Alternative rock|Lonely
Human|Alternative rock|Lonely
Round Here|Alternative rock|Lonely
Runaway Train|Alternative rock|Lonely
Amarillo by Morning|Country|Lonely
Colder Weather|Country|Lonely
Desperado|Country|Lonely
Ruthless|Country|Lonely
Sand In My Boots|Country|Lonely
Virginia|Country|Lonely
Hang|Rock|Lonely
Losing My Religion|Alternative rock|Nostalgic
Tonight, Tonight|Alternative rock|Nostalgic
When You Were Young|Alternative rock|Nostalgic
Here I Go Again|Classic Rock|Nostalgic
Home Sweet Home|Classic Rock|Nostalgic
Against the Wind|Classic rock|Nostalgic
Hysteria|Classic rock|Nostalgic
Landslide|Classic rock|Nostalgic
The Boys of Summer|Classic rock|Nostalgic
Winds of Change|Classic rock|Nostalgic
Far Behind|Grunge|Nostalgic
Faithfully|Classic rock|Romantic
Beautiful Crazy|Country|Romantic
In Your Love|Country|Romantic
It Would Be You|Country|Romantic
Let Me Down Easy|Country|Romantic
Something Orange|Country|Romantic
Trouble|Country|Romantic
Times Like These|Alternative rock|Soulful
She Talks to Angels|Classic Rock|Soulful
Stone|Country|Soulful
Everglow|Alternative rock|Spiritual
The World I Know|Alternative rock|Spiritual
Broken Halos|Country|Spiritual
Where I Find God|Country|Spiritual
Lyin' Eyes|Classic rock|Story
Hurricane|Country|Story
Where the Wild Things Are|Country|Story
Rock and a Hard Place|Country|Tense
Watching Airplanes|Country|Tense
Alive|Grunge|Tense
Echoes|Rock|Tense
Long Day|Rock|Tense
My Hero|Alternative rock|Upbeat
Nothin' On But the Radio|Country|Upbeat
Right Where I Need to Be|Country|Upbeat
Take It Easy|Country|Upbeat
Wagon Wheel|Country|Upbeat
Backroad Traffic|Country|Warm
Have You Ever Seen the Rain|Country|Warm
Starting Over|Country|Warm
Troubadour|Country|Warm
Wave on Wave|Country|Warm`;

const defaultSongs = metadataRows.split("\n").map((row) => {
  const [title, genre, mood] = row.split("|");
  return normalizeSong({
    id: crypto.randomUUID(),
    title,
    genre,
    mood,
    energy: energyFromMood(mood),
    feel: feelFromMood(mood),
    minutes: 4,
    tags: tagsForSong(genre, mood),
  });
});

const state = {
  songs: [],
  setlist: [],
  activeId: null,
  query: "",
  crowd: {
    venue: "mixed",
    singalong: 7,
    dance: 5,
    chill: 4,
    variety: 6,
    setLength: 10,
  },
};

const els = {
  songList: document.querySelector("#songList"),
  setList: document.querySelector("#setList"),
  setArc: document.querySelector("#setArc"),
  songCount: document.querySelector("#songCount"),
  setCount: document.querySelector("#setCount"),
  setMinutes: document.querySelector("#setMinutes"),
  selectedHint: document.querySelector("#selectedHint"),
  venueSelect: document.querySelector("#venueSelect"),
  singalongInput: document.querySelector("#singalongInput"),
  danceInput: document.querySelector("#danceInput"),
  chillInput: document.querySelector("#chillInput"),
  varietyInput: document.querySelector("#varietyInput"),
  setLengthInput: document.querySelector("#setLengthInput"),
  generateSetButton: document.querySelector("#generateSetButton"),
  generatorNote: document.querySelector("#generatorNote"),
  searchInput: document.querySelector("#searchInput"),
  titleInput: document.querySelector("#titleInput"),
  genreInput: document.querySelector("#genreInput"),
  moodInput: document.querySelector("#moodInput"),
  energyInput: document.querySelector("#energyInput"),
  feelSelect: document.querySelector("#feelSelect"),
  minutesInput: document.querySelector("#minutesInput"),
  fitInput: document.querySelector("#fitInput"),
  addToSetButton: document.querySelector("#addToSetButton"),
  copySetButton: document.querySelector("#copySetButton"),
  exportSetButton: document.querySelector("#exportSetButton"),
  clearSetButton: document.querySelector("#clearSetButton"),
  newSongButton: document.querySelector("#newSongButton"),
  toast: document.querySelector("#toast"),
};

function load() {
  const saved = localStorage.getItem("setlist-generator-data") || localStorage.getItem("stage-chords-data");
  if (!saved) {
    state.songs = defaultSongs;
    state.setlist = state.songs.slice(0, 8).map((song) => song.id);
    state.activeId = state.songs[0].id;
    persist();
    return;
  }

  const parsed = JSON.parse(saved);
  const savedSongs = (parsed.songs || [])
    .filter((song) => !demoSongTitles.has((song.title || "").toLowerCase()))
    .map(normalizeSong);

  state.songs = mergeSongs(savedSongs, defaultSongs);
  state.setlist = (parsed.setlist || []).filter((id) => state.songs.some((song) => song.id === id));
  state.activeId = state.songs.some((song) => song.id === parsed.activeId) ? parsed.activeId : state.songs[0]?.id;
  state.crowd = { ...state.crowd, ...(parsed.crowd || {}) };
  persist();
}

function persist() {
  localStorage.setItem(
    "setlist-generator-data",
    JSON.stringify({ songs: state.songs, setlist: state.setlist, activeId: state.activeId, crowd: state.crowd })
  );
}

function normalizeSong(song) {
  const genre = song.genre || "";
  const mood = song.mood || "";
  const tags = Array.isArray(song.tags) ? song.tags : tagsFromText(song.tags || "");
  return {
    id: song.id || crypto.randomUUID(),
    title: song.title || "Untitled",
    genre,
    mood,
    energy: clamp(Number(song.energy || energyFromMood(mood)), 1, 10),
    feel: song.feel || feelFromMood(mood) || guessFeel(tags),
    minutes: Math.max(1, Number(song.minutes || 4)),
    tags: tags.length ? tags : tagsForSong(genre, mood),
  };
}

function mergeSongs(primary, additions) {
  const seen = new Set();
  const merged = [];
  [...primary, ...additions].forEach((song) => {
    const key = `${song.title || ""}`.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(song);
  });
  return merged;
}

function energyFromMood(mood) {
  const map = {
    Dark: 3,
    Driving: 8,
    Emotional: 4,
    Gritty: 7,
    Lonely: 3,
    Nostalgic: 5,
    Romantic: 4,
    Soulful: 5,
    Spiritual: 4,
    Story: 5,
    Tense: 7,
    Upbeat: 8,
    Warm: 6,
  };
  return map[mood] || 5;
}

function feelFromMood(mood) {
  const map = {
    Dark: "ballad",
    Driving: "groove",
    Emotional: "ballad",
    Gritty: "groove",
    Lonely: "story",
    Nostalgic: "anthem",
    Romantic: "ballad",
    Soulful: "anthem",
    Spiritual: "story",
    Story: "story",
    Tense: "wildcard",
    Upbeat: "anthem",
    Warm: "anthem",
  };
  return map[mood] || "anthem";
}

function tagsForSong(genre, mood) {
  const tags = [genre.toLowerCase(), mood.toLowerCase()].filter(Boolean);
  if (["Driving", "Gritty", "Upbeat", "Tense"].includes(mood)) tags.push("dance");
  if (["Nostalgic", "Upbeat", "Warm"].includes(mood) || /classic/i.test(genre)) tags.push("singalong");
  if (["Dark", "Lonely", "Emotional", "Romantic", "Spiritual"].includes(mood)) tags.push("chill");
  if (["Story", "Lonely", "Spiritual"].includes(mood)) tags.push("story");
  if (["Driving", "Upbeat", "Warm"].includes(mood)) tags.push("opener");
  if (["Nostalgic", "Spiritual", "Emotional", "Warm"].includes(mood)) tags.push("closer");
  return [...new Set(tags)];
}

function activeSong() {
  return state.songs.find((song) => song.id === state.activeId) || state.songs[0];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function tagsFromText(value) {
  return String(value)
    .split(/[,#]/u)
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function guessFeel(tags) {
  const tagText = tags.join(" ");
  if (/ballad|slow|quiet|chill/u.test(tagText)) return "ballad";
  if (/dance|groove|funk|shuffle/u.test(tagText)) return "groove";
  if (/story|original/u.test(tagText)) return "story";
  if (/wild|deep|curve/u.test(tagText)) return "wildcard";
  return "anthem";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderTags(tags = []) {
  const visible = tags.slice(0, 3);
  if (!visible.length) return "";
  return `<span class="song-tags">${visible.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</span>`;
}

function renderLibrary() {
  const query = state.query.trim().toLowerCase();
  const filtered = state.songs.filter((song) => {
    const haystack = `${song.title} ${song.genre} ${song.mood} ${(song.tags || []).join(" ")}`.toLowerCase();
    return haystack.includes(query);
  });

  els.songList.innerHTML = "";
  filtered.forEach((song) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `song-row${song.id === state.activeId ? " active" : ""}`;
    row.innerHTML = `<span><span class="song-title">${escapeHtml(song.title)}</span><span class="song-subtitle">${escapeHtml(
      song.genre || "No genre"
    )} · ${escapeHtml(song.mood || "No mood")} · energy ${song.energy}</span>${renderTags(song.tags)}</span>`;
    row.addEventListener("click", () => selectSong(song.id));
    els.songList.appendChild(row);
  });

  els.songCount.textContent = `${filtered.length} songs`;
}

function renderSetlist() {
  els.setList.innerHTML = "";
  state.setlist.forEach((id, index) => {
    const song = state.songs.find((item) => item.id === id);
    if (!song) return;

    const row = document.createElement("div");
    row.className = `set-row${song.id === state.activeId ? " active" : ""}`;
    row.innerHTML = `<span class="set-number">${index + 1}</span>
      <button class="song-row-main" type="button">
        <span class="song-title">${escapeHtml(song.title)}</span>
        <span class="song-subtitle">${escapeHtml(song.genre || "No genre")} · ${escapeHtml(song.mood || "No mood")} · ${song.minutes} min</span>
      </button>
      <span class="set-row-actions">
        <button class="mini-button" type="button" data-action="up" aria-label="Move up">↑</button>
        <button class="mini-button" type="button" data-action="down" aria-label="Move down">↓</button>
        <button class="mini-button" type="button" data-action="remove" aria-label="Remove">×</button>
      </span>`;
    row.querySelector(".song-row-main").addEventListener("click", () => selectSong(song.id));
    row.querySelector('[data-action="up"]').addEventListener("click", () => reorderSetItem(index, index - 1));
    row.querySelector('[data-action="down"]').addEventListener("click", () => reorderSetItem(index, index + 1));
    row.querySelector('[data-action="remove"]').addEventListener("click", () => removeSetItem(index));
    els.setList.appendChild(row);
  });

  els.setCount.textContent = state.setlist.length;
  renderSetArc();
  renderSetMinutes();
}

function renderSetArc() {
  els.setArc.innerHTML = "";
  state.setlist.forEach((id) => {
    const song = state.songs.find((item) => item.id === id);
    if (!song) return;
    const bar = document.createElement("span");
    bar.className = "arc-bar";
    bar.style.height = `${clamp(song.energy, 1, 10) * 10}%`;
    bar.title = `${song.title}: energy ${song.energy}`;
    els.setArc.appendChild(bar);
  });
}

function renderSetMinutes() {
  const minutes = state.setlist.reduce((total, id) => {
    const song = state.songs.find((item) => item.id === id);
    return total + Number(song?.minutes || 0);
  }, 0);
  els.setMinutes.textContent = `${minutes} min`;
}

function renderInputs() {
  const song = activeSong();
  if (!song) return;

  els.titleInput.value = song.title || "";
  els.genreInput.value = song.genre || "";
  els.moodInput.value = song.mood || "";
  els.energyInput.value = song.energy || 5;
  els.feelSelect.value = song.feel || "anthem";
  els.minutesInput.value = song.minutes || 4;
  els.fitInput.value = (song.tags || []).join(", ");
  els.selectedHint.textContent = song.title || "";
  els.venueSelect.value = state.crowd.venue;
  els.singalongInput.value = state.crowd.singalong;
  els.danceInput.value = state.crowd.dance;
  els.chillInput.value = state.crowd.chill;
  els.varietyInput.value = state.crowd.variety;
  els.setLengthInput.value = state.crowd.setLength;
}

function renderAll() {
  renderLibrary();
  renderSetlist();
  renderInputs();
  renderGeneratorNote();
}

function selectSong(id) {
  state.activeId = id;
  persist();
  renderAll();
}

function updateSong(patch) {
  const song = activeSong();
  Object.assign(song, patch);
  persist();
  renderAll();
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 1600);
}

function addNewSong() {
  const song = normalizeSong({
    id: crypto.randomUUID(),
    title: "New Song",
    genre: "",
    mood: "",
    energy: 5,
    feel: "anthem",
    minutes: 4,
    tags: [],
  });
  state.songs.unshift(song);
  state.activeId = song.id;
  persist();
  renderAll();
  els.titleInput.focus();
  els.titleInput.select();
}

function addActiveToSet() {
  if (!state.activeId || state.setlist.includes(state.activeId)) return;
  state.setlist.push(state.activeId);
  persist();
  renderSetlist();
  showToast("Added to set");
}

function clearSet() {
  state.setlist = [];
  persist();
  renderSetlist();
  showToast("Setlist cleared");
}

function reorderSetItem(fromIndex, toIndex) {
  if (toIndex < 0 || toIndex >= state.setlist.length) return;
  const next = [...state.setlist];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  state.setlist = next;
  persist();
  renderSetlist();
}

function removeSetItem(index) {
  state.setlist.splice(index, 1);
  persist();
  renderSetlist();
}

function updateCrowd(patch) {
  state.crowd = { ...state.crowd, ...patch };
  persist();
  renderGeneratorNote();
}

function targetEnergyForSlot(index, total) {
  if (total <= 1) return 7;
  const position = index / (total - 1);
  if (index === 0) return 7;
  if (index === total - 1) return 9;
  if (position < 0.28) return 6 + Math.round(position * 8);
  if (position < 0.48) return 4;
  if (position < 0.75) return 7;
  return 8;
}

function scoreSongForSlot(song, index, total, chosen) {
  const crowd = state.crowd;
  const tags = new Set((song.tags || []).map((tag) => tag.toLowerCase()));
  const targetEnergy = targetEnergyForSlot(index, total);
  let score = 40 - Math.abs(Number(song.energy || 5) - targetEnergy) * 5;

  score += (tags.has("singalong") ? crowd.singalong : 0) * 2.4;
  score += (tags.has("dance") ? crowd.dance : 0) * 2.2;
  score += (tags.has("chill") ? crowd.chill : 0) * 2;

  if (index === 0 && tags.has("opener")) score += 16;
  if (index === total - 1 && tags.has("closer")) score += 18;

  if (crowd.venue === "listening" && ["story", "ballad"].includes(song.feel)) score += 10;
  if (crowd.venue === "bar" && (tags.has("singalong") || tags.has("dance"))) score += 10;
  if (crowd.venue === "dance" && tags.has("dance")) score += 14;
  if (crowd.venue === "dinner" && Number(song.energy || 5) <= 5) score += 12;

  const recent = chosen.slice(-3).map((id) => state.songs.find((item) => item.id === id)).filter(Boolean);
  recent.forEach((previous) => {
    if (previous.feel === song.feel) score -= crowd.variety * 1.3;
    if (previous.genre && previous.genre === song.genre) score -= crowd.variety * 0.8;
  });

  return score;
}

function generateSetlist() {
  const total = clamp(Number(state.crowd.setLength || 10), 3, Math.min(50, state.songs.length));
  const chosen = [];

  for (let index = 0; index < total; index += 1) {
    const candidates = state.songs
      .filter((song) => !chosen.includes(song.id))
      .map((song) => ({ song, score: scoreSongForSlot(song, index, total, chosen) }))
      .sort((a, b) => b.score - a.score);

    if (candidates[0]) chosen.push(candidates[0].song.id);
  }

  state.setlist = chosen;
  state.activeId = chosen[0] || state.activeId;
  persist();
  renderAll();
  showToast("Setlist generated");
}

function renderGeneratorNote() {
  const crowd = state.crowd;
  const strongest = [
    ["singalong", crowd.singalong],
    ["dance", crowd.dance],
    ["chill", crowd.chill],
    ["variety", crowd.variety],
  ].sort((a, b) => b[1] - a[1])[0][0];
  const room = els.venueSelect.options[els.venueSelect.selectedIndex]?.textContent || "Mixed room";
  els.generatorNote.textContent = `${room}: prioritizing ${strongest}, with opener lift, mid-set breather, and strong closer.`;
}

function setlistText() {
  return state.setlist
    .map((id, index) => {
      const song = state.songs.find((item) => item.id === id);
      if (!song) return "";
      return `${index + 1}. ${song.title}`;
    })
    .filter(Boolean)
    .join("\n");
}

async function copySetlist() {
  const text = setlistText();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Setlist copied");
  } catch {
    showToast("Copy failed");
  }
}

function exportSetlist() {
  const text = setlistText();
  if (!text) return;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "setlist.txt";
  anchor.click();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderLibrary();
  });

  els.titleInput.addEventListener("input", (event) => updateSong({ title: event.target.value }));
  els.genreInput.addEventListener("input", (event) => updateSong({ genre: event.target.value }));
  els.moodInput.addEventListener("input", (event) => updateSong({ mood: event.target.value }));
  els.energyInput.addEventListener("input", (event) => updateSong({ energy: Number(event.target.value) }));
  els.feelSelect.addEventListener("change", (event) => updateSong({ feel: event.target.value }));
  els.minutesInput.addEventListener("input", (event) => updateSong({ minutes: Number(event.target.value) }));
  els.fitInput.addEventListener("input", (event) => updateSong({ tags: tagsFromText(event.target.value) }));

  els.venueSelect.addEventListener("change", (event) => updateCrowd({ venue: event.target.value }));
  els.singalongInput.addEventListener("input", (event) => updateCrowd({ singalong: Number(event.target.value) }));
  els.danceInput.addEventListener("input", (event) => updateCrowd({ dance: Number(event.target.value) }));
  els.chillInput.addEventListener("input", (event) => updateCrowd({ chill: Number(event.target.value) }));
  els.varietyInput.addEventListener("input", (event) => updateCrowd({ variety: Number(event.target.value) }));
  els.setLengthInput.addEventListener("input", (event) => updateCrowd({ setLength: Number(event.target.value) }));

  els.generateSetButton.addEventListener("click", generateSetlist);
  els.addToSetButton.addEventListener("click", addActiveToSet);
  els.copySetButton.addEventListener("click", copySetlist);
  els.exportSetButton.addEventListener("click", exportSetlist);
  els.clearSetButton.addEventListener("click", clearSet);
  els.newSongButton.addEventListener("click", addNewSong);
}

load();
bindEvents();
renderAll();
