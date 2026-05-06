const NOTES_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_TO_SHARP = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

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

const metadataSongs = metadataRows.split("\n").map((row) => {
  const [title, genre, mood] = row.split("|");
  return {
    id: crypto.randomUUID(),
    title,
    artist: "",
    key: "G",
    capo: 0,
    transpose: 0,
    fontSize: 22,
    genre,
    mood,
    energy: energyFromMood(mood),
    feel: feelFromMood(mood),
    minutes: 4,
    tags: tagsForSong(genre, mood),
    lyrics: `[Notes]\nAdd chords and lyrics for ${title} here.\n\n[Metadata]\nGenre: ${genre}\nMood: ${mood}`,
  };
});

const defaultSongs = metadataSongs;

const state = {
  songs: [],
  setlist: [],
  activeId: null,
  query: "",
  editing: true,
  scrolling: false,
  scrollSpeed: 0,
  scrollTimer: null,
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
  artistInput: document.querySelector("#artistInput"),
  lyricsInput: document.querySelector("#lyricsInput"),
  keySelect: document.querySelector("#keySelect"),
  displayKey: document.querySelector("#displayKey"),
  capoInput: document.querySelector("#capoInput"),
  energyInput: document.querySelector("#energyInput"),
  feelSelect: document.querySelector("#feelSelect"),
  fitInput: document.querySelector("#fitInput"),
  fontSizeInput: document.querySelector("#fontSizeInput"),
  scrollSpeedInput: document.querySelector("#scrollSpeedInput"),
  transposeValue: document.querySelector("#transposeValue"),
  chartTitle: document.querySelector("#chartTitle"),
  chartArtist: document.querySelector("#chartArtist"),
  chartKeyBadge: document.querySelector("#chartKeyBadge"),
  chartCapoBadge: document.querySelector("#chartCapoBadge"),
  chartBody: document.querySelector("#chartBody"),
  chartPane: document.querySelector("#chartPane"),
  editorPane: document.querySelector("#editorPane"),
  editToggle: document.querySelector("#editToggle"),
  saveButton: document.querySelector("#saveButton"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  addToSetButton: document.querySelector("#addToSetButton"),
  clearSetButton: document.querySelector("#clearSetButton"),
  transposeDown: document.querySelector("#transposeDown"),
  transposeUp: document.querySelector("#transposeUp"),
  autoScrollButton: document.querySelector("#autoScrollButton"),
  stageModeButton: document.querySelector("#stageModeButton"),
  newSongButton: document.querySelector("#newSongButton"),
  toast: document.querySelector("#toast"),
};

function load() {
  const saved = localStorage.getItem("stage-chords-data");
  if (saved) {
    const parsed = JSON.parse(saved);
    const savedSongs = (parsed.songs || []).filter((song) => !demoSongTitles.has((song.title || "").toLowerCase()));
    state.songs = mergeSongs(savedSongs, defaultSongs).map(normalizeSong);
    state.setlist = (parsed.setlist || []).filter((id) => state.songs.some((song) => song.id === id));
    state.activeId = parsed.activeId || state.songs[0]?.id;
    if (!state.songs.some((song) => song.id === state.activeId)) state.activeId = state.songs[0]?.id;
    state.crowd = { ...state.crowd, ...(parsed.crowd || {}) };
    if (state.songs.length !== savedSongs.length) persist();
  } else {
    state.songs = defaultSongs.map(normalizeSong);
    state.setlist = state.songs.slice(0, 8).map((song) => song.id);
    state.activeId = state.songs[0].id;
    persist();
  }
}

function persist() {
  localStorage.setItem(
    "stage-chords-data",
    JSON.stringify({ songs: state.songs, setlist: state.setlist, activeId: state.activeId, crowd: state.crowd })
  );
}

function normalizeSong(song) {
  return {
    id: song.id || crypto.randomUUID(),
    title: song.title || "Untitled",
    artist: song.artist || "",
    key: song.key || "C",
    capo: Number(song.capo || 0),
    transpose: Number(song.transpose || 0),
    fontSize: Number(song.fontSize || 22),
    genre: song.genre || "",
    mood: song.mood || "",
    energy: clamp(Number(song.energy || 5), 1, 10),
    feel: song.feel || guessFeel(song.tags || []),
    minutes: Math.max(1, Number(song.minutes || 4)),
    tags: Array.isArray(song.tags) ? song.tags : tagsFromText(song.tags || ""),
    lyrics: song.lyrics || "",
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
  const tags = [genre.toLowerCase(), mood.toLowerCase()];
  if (["Driving", "Gritty", "Upbeat", "Tense"].includes(mood)) tags.push("dance");
  if (["Nostalgic", "Upbeat", "Warm", "Classic Rock"].includes(mood) || /classic/i.test(genre)) tags.push("singalong");
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

function normalizeNote(note) {
  return FLAT_TO_SHARP[note] || note;
}

function transposeNote(note, steps) {
  const normalized = normalizeNote(note);
  const index = NOTES_SHARP.indexOf(normalized);
  if (index < 0) return note;
  return NOTES_SHARP[(index + steps + 120) % 12];
}

function transposeChord(chord, steps) {
  return chord.replace(/^([A-G](?:#|b)?)(.*)$/u, (_, root, rest) => `${transposeNote(root, steps)}${rest}`);
}

function displayKey(song) {
  return transposeNote(song.key, Number(song.transpose || 0));
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderChordLine(line, transpose) {
  if (/^\[[^\]]+\]$/u.test(line.trim())) {
    return `<span class="section-label">${escapeHtml(line.replace(/\[|\]/gu, ""))}</span>`;
  }

  const html = escapeHtml(line).replace(/\[([^\]]+)\]/gu, (_, chord) => {
    return `<span class="chord">${escapeHtml(transposeChord(chord, transpose))}</span>`;
  });
  return `<p class="song-line">${html || "&nbsp;"}</p>`;
}

function renderChart() {
  const song = activeSong();
  if (!song) return;

  document.documentElement.style.setProperty("--chart-font", `${song.fontSize || 22}px`);
  els.chartTitle.textContent = song.title || "Untitled";
  els.chartArtist.textContent = song.artist || "";
  els.chartKeyBadge.textContent = `Key ${displayKey(song)}`;
  els.chartCapoBadge.textContent = `Capo ${song.capo || 0}`;
  els.chartBody.innerHTML = song.lyrics
    .split("\n")
    .map((line) => renderChordLine(line, Number(song.transpose || 0)))
    .join("");
}

function renderLibrary() {
  const query = state.query.trim().toLowerCase();
  const filtered = state.songs.filter((song) => {
    const haystack = `${song.title} ${song.artist} ${(song.tags || []).join(" ")}`.toLowerCase();
    return haystack.includes(query);
  });

  els.songList.innerHTML = "";
  filtered.forEach((song) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = `song-row${song.id === state.activeId ? " active" : ""}`;
    row.innerHTML = `<span><span class="song-title">${escapeHtml(song.title)}</span><span class="song-subtitle">${escapeHtml(
      song.artist || "No artist"
    )} · ${escapeHtml(song.key)} · energy ${song.energy}</span>${renderTags(song.tags)}</span>`;
    row.addEventListener("click", () => selectSong(song.id));
    els.songList.appendChild(row);
  });

  els.songCount.textContent = `${filtered.length} songs`;
}

function renderTags(tags = []) {
  const visible = tags.slice(0, 3);
  if (!visible.length) return "";
  return `<span class="song-tags">${visible.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</span>`;
}

function renderSetlist() {
  els.setList.innerHTML = "";
  state.setlist.forEach((id, index) => {
    const song = state.songs.find((item) => item.id === id);
    if (!song) return;

    const row = document.createElement("div");
    row.className = `set-row${song.id === state.activeId ? " active" : ""}`;
    row.innerHTML = `<button class="set-main" type="button"><span><span class="song-title">${index + 1}. ${escapeHtml(song.title)}</span><span class="song-subtitle">${escapeHtml(
      displayKey(song)
    )} · capo ${song.capo || 0} · energy ${song.energy}</span></span></button>
    <span class="set-row-actions">
      <button class="mini-button" type="button" data-action="up" aria-label="Move up">↑</button>
      <button class="mini-button" type="button" data-action="down" aria-label="Move down">↓</button>
      <button class="mini-button" type="button" data-action="remove" aria-label="Remove">×</button>
    </span>`;
    row.querySelector(".set-main").addEventListener("click", () => selectSong(song.id));
    row.querySelector('[data-action="up"]').addEventListener("click", () => reorderSetItem(index, index - 1));
    row.querySelector('[data-action="down"]').addEventListener("click", () => reorderSetItem(index, index + 1));
    row.querySelector('[data-action="remove"]').addEventListener("click", () => removeSetItem(index));
    els.setList.appendChild(row);
  });
  els.setCount.textContent = `${state.setlist.length} songs`;
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
  els.artistInput.value = song.artist || "";
  els.lyricsInput.value = song.lyrics || "";
  els.keySelect.value = song.key || "C";
  els.displayKey.value = `plays ${displayKey(song)}`;
  els.capoInput.value = song.capo || 0;
  els.energyInput.value = song.energy || 5;
  els.feelSelect.value = song.feel || "anthem";
  els.fitInput.value = (song.tags || []).join(", ");
  els.fontSizeInput.value = song.fontSize || 22;
  els.transposeValue.value = signed(song.transpose || 0);
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
  renderChart();
  renderGeneratorNote();
}

function selectSong(id) {
  state.activeId = id;
  stopScroll();
  persist();
  renderAll();
  els.chartPane.scrollTop = 0;
}

function updateSong(patch, renderMode = "all") {
  const song = activeSong();
  Object.assign(song, patch);
  persist();
  if (renderMode === "chart") {
    renderChart();
    renderSetlist();
    return;
  }
  if (renderMode === "library") {
    renderLibrary();
    renderSetlist();
    renderChart();
    return;
  }
  renderAll();
}

function signed(number) {
  const value = Number(number);
  return value > 0 ? `+${value}` : `${value}`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");
  window.setTimeout(() => els.toast.classList.remove("show"), 1600);
}

function addNewSong() {
  const song = {
    id: crypto.randomUUID(),
    title: "New Song",
    artist: "",
    key: "C",
    capo: 0,
    transpose: 0,
    fontSize: 22,
    energy: 5,
    feel: "anthem",
    genre: "",
    mood: "",
    minutes: 4,
    tags: [],
    lyrics: `[Verse]\n[C]Start typing your [F]song here\n[G]Chords in brackets will [C]transpose`,
  };
  state.songs.unshift(song);
  state.activeId = song.id;
  persist();
  renderAll();
  els.titleInput.focus();
  els.titleInput.select();
}

function addActiveToSet() {
  if (!state.setlist.includes(state.activeId)) {
    state.setlist.push(state.activeId);
    persist();
    renderSetlist();
    showToast("Added to tonight");
  }
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
  score += tags.has("request") ? 5 : 0;

  if (index === 0 && tags.has("opener")) score += 16;
  if (index === total - 1 && tags.has("closer")) score += 18;

  const venue = crowd.venue;
  if (venue === "listening" && ["story", "ballad"].includes(song.feel)) score += 10;
  if (venue === "bar" && (tags.has("singalong") || tags.has("dance"))) score += 10;
  if (venue === "dance" && tags.has("dance")) score += 14;
  if (venue === "dinner" && Number(song.energy || 5) <= 5) score += 12;

  const recent = chosen.slice(-3).map((id) => state.songs.find((item) => item.id === id)).filter(Boolean);
  recent.forEach((previous) => {
    if (previous.feel === song.feel) score -= crowd.variety * 1.3;
    if (previous.genre && previous.genre === song.genre) score -= crowd.variety * 0.8;
  });

  return score;
}

function generateSetlist() {
  const total = clamp(Number(state.crowd.setLength || 10), 3, Math.min(36, state.songs.length));
  const chosen = [];
  const pool = state.songs.filter((song) => song.title && song.lyrics !== "");

  for (let index = 0; index < total; index += 1) {
    const candidates = pool
      .filter((song) => !chosen.includes(song.id))
      .map((song) => ({ song, score: scoreSongForSlot(song, index, total, chosen) }))
      .sort((a, b) => b.score - a.score);

    if (candidates[0]) chosen.push(candidates[0].song.id);
  }

  state.setlist = chosen;
  state.activeId = chosen[0] || state.activeId;
  persist();
  renderAll();
  renderGeneratorNote();
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

function exportData() {
  const payload = JSON.stringify({ songs: state.songs, setlist: state.setlist, crowd: state.crowd }, null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "setlist-generator-songbook.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      state.songs = Array.isArray(parsed.songs) ? mergeSongs(parsed.songs, defaultSongs).map(normalizeSong) : state.songs;
      state.setlist = Array.isArray(parsed.setlist) ? parsed.setlist : [];
      state.crowd = { ...state.crowd, ...(parsed.crowd || {}) };
      state.activeId = state.songs[0]?.id || null;
      persist();
      renderAll();
      showToast("Songbook imported");
    } catch {
      showToast("Import failed");
    }
  };
  reader.readAsText(file);
}

function startScroll() {
  state.scrolling = true;
  els.autoScrollButton.textContent = "Stop";
  state.scrollTimer = window.setInterval(() => {
    const speed = Number(state.scrollSpeed || 0);
    if (speed > 0) els.chartPane.scrollTop += speed * 0.35;
  }, 24);
}

function stopScroll() {
  state.scrolling = false;
  els.autoScrollButton.textContent = "Start";
  window.clearInterval(state.scrollTimer);
}

function toggleScroll() {
  if (state.scrolling) {
    stopScroll();
  } else {
    startScroll();
  }
}

function moveInSet(direction) {
  const index = state.setlist.indexOf(state.activeId);
  if (index < 0) return;
  const nextId = state.setlist[index + direction];
  if (nextId) selectSong(nextId);
}

function bindEvents() {
  NOTES_SHARP.forEach((note) => {
    const option = document.createElement("option");
    option.value = note;
    option.textContent = note;
    els.keySelect.appendChild(option);
  });

  els.searchInput.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderLibrary();
  });

  els.titleInput.addEventListener("input", (event) => updateSong({ title: event.target.value }, "library"));
  els.artistInput.addEventListener("input", (event) => updateSong({ artist: event.target.value }, "library"));
  els.lyricsInput.addEventListener("input", (event) => updateSong({ lyrics: event.target.value }, "chart"));
  els.keySelect.addEventListener("change", (event) => updateSong({ key: event.target.value }));
  els.capoInput.addEventListener("input", (event) => updateSong({ capo: Number(event.target.value) }));
  els.energyInput.addEventListener("input", (event) => updateSong({ energy: Number(event.target.value) }, "library"));
  els.feelSelect.addEventListener("change", (event) => updateSong({ feel: event.target.value }, "library"));
  els.fitInput.addEventListener("input", (event) => updateSong({ tags: tagsFromText(event.target.value) }, "library"));
  els.fontSizeInput.addEventListener("input", (event) => updateSong({ fontSize: Number(event.target.value) }));
  els.scrollSpeedInput.addEventListener("input", (event) => {
    state.scrollSpeed = Number(event.target.value);
  });
  els.venueSelect.addEventListener("change", (event) => updateCrowd({ venue: event.target.value }));
  els.singalongInput.addEventListener("input", (event) => updateCrowd({ singalong: Number(event.target.value) }));
  els.danceInput.addEventListener("input", (event) => updateCrowd({ dance: Number(event.target.value) }));
  els.chillInput.addEventListener("input", (event) => updateCrowd({ chill: Number(event.target.value) }));
  els.varietyInput.addEventListener("input", (event) => updateCrowd({ variety: Number(event.target.value) }));
  els.setLengthInput.addEventListener("input", (event) => updateCrowd({ setLength: Number(event.target.value) }));

  els.transposeDown.addEventListener("click", () => updateSong({ transpose: Number(activeSong().transpose || 0) - 1 }));
  els.transposeUp.addEventListener("click", () => updateSong({ transpose: Number(activeSong().transpose || 0) + 1 }));
  els.editToggle.addEventListener("click", () => {
    state.editing = !state.editing;
    document.body.classList.toggle("read-only", !state.editing);
    els.editToggle.textContent = state.editing ? "Preview" : "Edit";
  });
  els.saveButton.addEventListener("click", () => {
    persist();
    showToast("Saved offline");
  });
  els.exportButton.addEventListener("click", exportData);
  els.importInput.addEventListener("change", (event) => importData(event.target.files[0]));
  els.addToSetButton.addEventListener("click", addActiveToSet);
  els.clearSetButton.addEventListener("click", clearSet);
  els.generateSetButton.addEventListener("click", generateSetlist);
  els.newSongButton.addEventListener("click", addNewSong);
  els.autoScrollButton.addEventListener("click", toggleScroll);
  els.stageModeButton.addEventListener("click", () => {
    document.body.classList.toggle("stage-mode");
    els.stageModeButton.textContent = document.body.classList.contains("stage-mode") ? "Exit" : "Stage";
  });

  window.addEventListener("keydown", (event) => {
    const typing = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName);
    if (typing && event.key !== "Escape") return;
    if (event.key === " ") {
      event.preventDefault();
      toggleScroll();
    }
    if (event.key === "ArrowRight") moveInSet(1);
    if (event.key === "ArrowLeft") moveInSet(-1);
    if (event.key === "Escape") {
      document.body.classList.remove("stage-mode");
      stopScroll();
    }
  });
}

load();
bindEvents();
renderAll();
