// ==========================================================
// SOPA DE LETRAS ELECTORAL - motor del juego
// ==========================================================

const ACCENTS = {"Á":"A","É":"E","Í":"I","Ó":"O","Ú":"U","Ñ":"Ñ"};
function normalizeLetter(ch){
  ch = ch.toUpperCase();
  return ACCENTS[ch] || ch;
}

let currentLevel = 0;
let score = 0;
let secondsElapsed = 0;
let timerId = null;
let grid = [];
let gridSize = 0;
let foundWords = new Set();
let levelWords = [];
let hiddenWords = [];
let foundHidden = new Set();
let isSelecting = false;
let selStartCell = null;
let selectedCells = [];

function shuffle(arr){
  const a = [...arr];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// Elige palabras al azar del banco de 27 con dificultad progresiva:
// nivel 1 favorece palabras largas (más fáciles), niveles avanzados permiten
// palabras cortas (más difíciles) sin restricción.
function pickWordsForLevel(levelIdx, count){
  const allWords = Object.keys(WORD_BANK);
  let minLength;
  if(levelIdx === 0) minLength = 9;       // nivel 1: solo palabras largas/fáciles
  else if(levelIdx === 1) minLength = 7;  // nivel 2: largas + medianas
  else if(levelIdx === 2) minLength = 6;  // nivel 3: se suman más medianas
  else minLength = 0;                     // resto: cualquier palabra, incluidas las cortas/difíciles

  let pool = allWords.filter(w => w.length >= minLength);
  if(pool.length < count) pool = allWords; // seguridad por si el filtro deja muy pocas
  return shuffle(pool).slice(0, count);
}

// Elige 2 palabras ocultas bonus (no mostradas en la lista) que no se repitan
// con las palabras visibles del nivel.
function pickHiddenWords(visibleWords, count){
  const allWords = Object.keys(WORD_BANK);
  const remaining = allWords.filter(w => !visibleWords.includes(w));
  return shuffle(remaining).slice(0, count);
}

const DIRS = [
  [0,1],[1,0],[1,1],[1,-1],
  [0,-1],[-1,0],[-1,-1],[-1,1]
];

// ---------- pantallas ----------
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- generación de sopa de letras ----------
function buildGrid(words){
  const longest = Math.max(...words.map(w=>w.length));
  const sizeBoost = Math.floor(words.length/3); // más palabras -> tablero más grande
  gridSize = Math.max(longest + 2, 10 + sizeBoost);
  gridSize = Math.min(gridSize, 20);

  let attempt = 0;
  while(attempt < 80){
    attempt++;
    const g = Array.from({length:gridSize},()=>Array(gridSize).fill(null));
    const sorted = [...words].sort((a,b)=>b.length-a.length);
    let ok = true;
    for(const w of sorted){
      if(!placeWord(g,w)){ ok=false; break; }
    }
    if(ok){
      // rellenar espacios vacíos con letras al azar
      const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      for(let r=0;r<gridSize;r++){
        for(let c=0;c<gridSize;c++){
          if(!g[r][c]) g[r][c] = ALPHA[Math.floor(Math.random()*ALPHA.length)];
        }
      }
      return g;
    }
  }
  // si falla tras varios intentos, agrandar
  gridSize++;
  return buildGrid(words);
}

function placeWord(g,word){
  const letters = word.split("");
  const tries = 200;
  for(let t=0;t<tries;t++){
    const dir = DIRS[Math.floor(Math.random()*DIRS.length)];
    const row0 = Math.floor(Math.random()*gridSize);
    const col0 = Math.floor(Math.random()*gridSize);
    const endRow = row0 + dir[0]*(letters.length-1);
    const endCol = col0 + dir[1]*(letters.length-1);
    if(endRow<0||endRow>=gridSize||endCol<0||endCol>=gridSize) continue;
    let fits = true;
    for(let i=0;i<letters.length;i++){
      const r = row0+dir[0]*i, c = col0+dir[1]*i;
      const existing = g[r][c];
      if(existing && existing !== letters[i]){ fits=false; break; }
    }
    if(!fits) continue;
    for(let i=0;i<letters.length;i++){
      const r = row0+dir[0]*i, c = col0+dir[1]*i;
      g[r][c] = letters[i];
    }
    return true;
  }
  return false;
}

// ---------- render ----------
function renderBoard(){
  const board = document.getElementById("board");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
  const cellPx = gridSize <= 12 ? 34 : gridSize <= 16 ? 28 : 22;
  board.style.setProperty("--cellpx", cellPx+"px");
  for(let r=0;r<gridSize;r++){
    for(let c=0;c<gridSize;c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = grid[r][c];
      cell.dataset.r = r;
      cell.dataset.c = c;
      board.appendChild(cell);
    }
  }
}

function renderWordList(){
  const ul = document.getElementById("wordlist");
  ul.innerHTML = "";
  levelWords.forEach(w=>{
    const li = document.createElement("li");
    li.textContent = w;
    li.dataset.word = w;
    if(foundWords.has(w)) li.classList.add("found");
    ul.appendChild(li);
  });
}

// ---------- selección de celdas ----------
function cellAt(r,c){
  return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

function clearSelectionStyle(){
  selectedCells.forEach(({r,c})=>{
    const el = cellAt(r,c);
    if(el && !el.classList.contains("found")) el.classList.remove("selected");
  });
}

function getLineCells(r0,c0,r1,c1){
  const dr = Math.sign(r1-r0), dc = Math.sign(c1-c0);
  const lenR = Math.abs(r1-r0), lenC = Math.abs(c1-c0);
  if(!(dr===0 || dc===0 || lenR===lenC)) return null; // no es línea recta válida
  const len = Math.max(lenR,lenC);
  const cells = [];
  for(let i=0;i<=len;i++){
    cells.push({r:r0+dr*i, c:c0+dc*i});
  }
  return cells;
}

function attachBoardEvents(){
  const board = document.getElementById("board");

  function startSel(r,c){
    isSelecting = true;
    selStartCell = {r,c};
    selectedCells = [{r,c}];
    playSound('flip');
    updateSelectionStyle();
  }
  function moveSel(r,c){
    if(!isSelecting) return;
    const cells = getLineCells(selStartCell.r, selStartCell.c, r, c);
    if(cells){
      clearSelectionStyle();
      selectedCells = cells;
      updateSelectionStyle();
    }
  }
  function endSel(){
    if(!isSelecting) return;
    isSelecting = false;
    checkSelection();
    clearSelectionStyle();
    selectedCells = [];
  }
  function updateSelectionStyle(){
    selectedCells.forEach(({r,c})=>{
      const el = cellAt(r,c);
      if(el && !el.classList.contains("found")) el.classList.add("selected");
    });
  }

  board.addEventListener("mousedown", e=>{
    const cell = e.target.closest(".cell");
    if(!cell) return;
    startSel(+cell.dataset.r, +cell.dataset.c);
  });
  board.addEventListener("mouseover", e=>{
    const cell = e.target.closest(".cell");
    if(!cell) return;
    moveSel(+cell.dataset.r, +cell.dataset.c);
  });
  window.addEventListener("mouseup", endSel);

  board.addEventListener("touchstart", e=>{
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX,t.clientY);
    const cell = el && el.closest(".cell");
    if(!cell) return;
    startSel(+cell.dataset.r, +cell.dataset.c);
    e.preventDefault();
  },{passive:false});
  board.addEventListener("touchmove", e=>{
    const t = e.touches[0];
    const el = document.elementFromPoint(t.clientX,t.clientY);
    const cell = el && el.closest(".cell");
    if(!cell) return;
    moveSel(+cell.dataset.r, +cell.dataset.c);
    e.preventDefault();
  },{passive:false});
  window.addEventListener("touchend", endSel);
}

function selectionToWord(){
  return selectedCells.map(({r,c})=>grid[r][c]).join("");
}

function checkSelection(){
  if(selectedCells.length < 2) return;
  const word = selectionToWord();
  const reversed = word.split("").reverse().join("");
  let match = null;
  if(levelWords.includes(word) && !foundWords.has(word)) match = word;
  else if(levelWords.includes(reversed) && !foundWords.has(reversed)) match = reversed;
  if(match){
    markWordFound(match);
    return;
  }
  // ¿coincide con una palabra oculta bonus?
  let hiddenMatch = null;
  if(hiddenWords.includes(word) && !foundHidden.has(word)) hiddenMatch = word;
  else if(hiddenWords.includes(reversed) && !foundHidden.has(reversed)) hiddenMatch = reversed;
  if(hiddenMatch){
    markHiddenWordFound(hiddenMatch);
  }
}

function markWordFound(word){
  foundWords.add(word);
  selectedCells.forEach(({r,c})=>{
    const el = cellAt(r,c);
    if(el) el.classList.add("found");
  });
  score += 100;
  document.getElementById("score").textContent = score;
  renderWordList();
  showBanner(word);
  playSound('match');
  playAcierto();

  if(foundWords.size === levelWords.length){
    setTimeout(levelComplete, 1200);
  }
}

function markHiddenWordFound(word){
  foundHidden.add(word);
  selectedCells.forEach(({r,c})=>{
    const el = cellAt(r,c);
    if(el) el.classList.add("found","hidden-found");
  });
  score += 250;
  document.getElementById("score").textContent = score;
  playSound('match');
  playAcierto();
  showBonusThenBanner(word);

  if(hiddenWords.length && foundHidden.size === hiddenWords.length){
    setTimeout(playBonusVideo, 2400);
  }
}

// ---------- video bonus (al completar las 2 palabras ocultas) ----------
function playBonusVideo(){
  const overlay = document.getElementById("bonus-overlay");
  const video = document.getElementById("bonus-video");
  const clip = BONUS_VIDEOS[Math.floor(Math.random()*BONUS_VIDEOS.length)];

  let closed = false;
  const closeOverlay = () => {
    if(closed) return;
    closed = true;
    overlay.classList.remove("show");
    video.pause();
  };

  video.muted = true; // asegura que el navegador permita reproducirlo automáticamente
  video.src = clip;
  video.currentTime = 0;
  overlay.classList.add("show");

  video.onended = closeOverlay;
  video.onerror = closeOverlay;
  overlay.onclick = closeOverlay; // por si el jugador quiere saltarlo

  const playPromise = video.play();
  if(playPromise && playPromise.catch){
    playPromise.catch(closeOverlay); // si el navegador bloquea la reproducción, no se queda trabado
  }

  // Respaldo: si por lo que sea nunca dispara "ended", se cierra solo a los 10s
  setTimeout(closeOverlay, 10000);
}

// ---------- banner de definición ----------
let bannerTimeout = null;
function showBanner(word){
  const data = WORD_BANK[word];
  if(!data) return;
  const banner = document.getElementById("banner");
  document.getElementById("banner-icon").src = data.icon;
  document.getElementById("banner-title").textContent = word;
  document.getElementById("banner-def").textContent = data.def;
  banner.classList.remove("bonus");
  banner.classList.add("show");
  clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(()=>{ banner.classList.remove("show"); }, 8000);
}

function showBonusThenBanner(word){
  const data = WORD_BANK[word];
  if(!data) return;
  const banner = document.getElementById("banner");
  clearTimeout(bannerTimeout);
  // Etapa 1: aviso especial de palabra secreta
  document.getElementById("banner-icon").src = data.icon;
  document.getElementById("banner-title").textContent = "¡Palabra secreta encontrada! +250";
  document.getElementById("banner-def").textContent = `Encontraste "${word}" escondida en el tablero, ¡buen ojo!`;
  banner.classList.add("bonus");
  banner.classList.add("show");
  // Etapa 2: después de un momento, mostramos su definición normal
  bannerTimeout = setTimeout(()=>{
    banner.classList.remove("bonus");
    document.getElementById("banner-title").textContent = word;
    document.getElementById("banner-def").textContent = data.def;
    bannerTimeout = setTimeout(()=>{ banner.classList.remove("show"); }, 8000);
  }, 2200);
}

// ---------- sonido (Web Audio API, igual sistema que el memorama) ----------
let audioCtx = null;
let soundOn = true;
function initAudio(){ if(!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }
function playSound(type){
  if(!soundOn || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain); gain.connect(audioCtx.destination);
  const t = audioCtx.currentTime;
  if(type === 'flip'){
    osc.frequency.setValueAtTime(400,t);
    osc.frequency.exponentialRampToValueAtTime(200,t+0.1);
    gain.gain.setValueAtTime(0.15,t);
    gain.gain.exponentialRampToValueAtTime(0.01,t+0.1);
    osc.start(t); osc.stop(t+0.1);
  } else if(type === 'match'){
    osc.frequency.setValueAtTime(523,t);
    osc.frequency.setValueAtTime(659,t+0.1);
    osc.frequency.setValueAtTime(784,t+0.2);
    gain.gain.setValueAtTime(0.2,t);
    gain.gain.exponentialRampToValueAtTime(0.01,t+0.4);
    osc.start(t); osc.stop(t+0.4);
  }
}

// ---------- mascota / video ----------
function playIdle(){
  const v = document.getElementById("mascota-video");
  if(!v) return;
  if(v.getAttribute("src") !== IDLE_VIDEO) v.src = IDLE_VIDEO;
  v.loop = true;
  v.play().catch(()=>{});
}
function playAcierto(){
  const clip = ACIERTO_VIDEOS[Math.floor(Math.random()*ACIERTO_VIDEOS.length)];
  const v = document.getElementById("mascota-video");
  if(!v) return;
  v.src = clip;
  v.loop = false;
  v.play().catch(()=>{});
  v.onended = () => playIdle();
}

// ---------- temporizador ----------
function startTimer(){
  clearInterval(timerId);
  timerId = setInterval(()=>{
    secondsElapsed++;
    const m = String(Math.floor(secondsElapsed/60)).padStart(2,"0");
    const s = String(secondsElapsed%60).padStart(2,"0");
    document.getElementById("tiempo").textContent = `${m}:${s}`;
  },1000);
}

// ---------- música de fondo ----------
let musicOn = true;
function playLevelMusic(idx){
  const music = document.getElementById("bg-music");
  const track = MUSIC_TRACKS[idx % MUSIC_TRACKS.length];
  if(music.getAttribute("src") !== track){
    music.src = track;
  }
  music.volume = 0.5;
  if(musicOn) music.play().catch(()=>{});
}
function toggleMusic(){
  const music = document.getElementById("bg-music");
  musicOn = !musicOn;
  document.getElementById("btn-sound").textContent = musicOn ? "🔊" : "🔇";
  if(musicOn) music.play().catch(()=>{});
  else music.pause();
}
document.getElementById("btn-sound").addEventListener("click", toggleMusic);

// ---------- videos de historia (intro / mitad / final) ----------
function playStoryVideo(src, onDone, resumeMusicAfter=true){
  const overlay = document.getElementById("story-overlay");
  const video = document.getElementById("story-video");
  const skipBtn = document.getElementById("btn-skip-story");
  const music = document.getElementById("bg-music");

  const wasMusicPlaying = !music.paused;
  music.pause();

  let done = false;
  const finish = () => {
    if(done) return;
    done = true;
    overlay.classList.remove("show");
    video.pause();
    video.onended = null;
    skipBtn.onclick = null;
    if(resumeMusicAfter && musicOn && wasMusicPlaying) music.play().catch(()=>{});
    if(onDone) onDone();
  };

  video.muted = false;
  video.src = src;
  video.currentTime = 0;
  overlay.classList.add("show");

  video.onended = finish;
  video.onerror = finish;
  skipBtn.onclick = finish;

  const playPromise = video.play();
  if(playPromise && playPromise.catch){
    playPromise.catch(()=>{}); // si el navegador bloquea el audio, el botón de saltar sigue disponible
  }
}

// ---------- niveles ----------
function loadLevel(idx){
  currentLevel = idx;
  const bg = LEVEL_BACKGROUNDS[idx];
  const count = LEVEL_WORD_COUNTS[idx];

  levelWords = pickWordsForLevel(idx, count);
  hiddenWords = pickHiddenWords(levelWords, HIDDEN_WORDS_PER_LEVEL);
  foundWords = new Set();
  foundHidden = new Set();
  grid = buildGrid([...levelWords, ...hiddenWords]);

  document.getElementById("screen-juego").style.backgroundImage = `url('${bg}')`;
  document.getElementById("nivel-num").textContent = idx+1;

  renderBoard();
  renderWordList();
  playLevelMusic(idx);
  document.getElementById("bonus-overlay").classList.remove("show");
  showScreen("screen-juego");
}

function levelComplete(){
  if(currentLevel >= LEVEL_BACKGROUNDS.length - 1){
    clearInterval(timerId);
    playStoryVideo(STORY_FINAL_VIDEO, () => {
      showScreen("screen-inicio");
    }, false);
    return;
  }

  const justFinishedLevel5 = (currentLevel === 4); // idx4 = nivel 5

  const goNext = () => {
    const screenJuego = document.getElementById("screen-juego");
    screenJuego.style.opacity = 0;
    setTimeout(()=>{
      loadLevel(currentLevel+1);
      screenJuego.style.opacity = 1;
    }, 320);
  };

  if(justFinishedLevel5){
    playStoryVideo(STORY_MID_VIDEO, goNext);
  } else {
    goNext();
  }
}

// ---------- init ----------
document.getElementById("btn-empezar").addEventListener("click", ()=>{
  initAudio();
  score = 0; secondsElapsed = 0;
  document.getElementById("score").textContent = 0;
  attachBoardEvents();
  playStoryVideo(STORY_INTRO_VIDEO, () => {
    playIdle();
    startTimer();
    loadLevel(0);
  });
});

document.getElementById("btn-reiniciar").addEventListener("click", ()=>{
  score = 0; secondsElapsed = 0;
  document.getElementById("score").textContent = 0;
  startTimer();
  loadLevel(0);
});

// ---------- ATAJOS DE PRUEBA (solo para ti, no aparecen en el juego) ----------
// Tecla W: gana instantáneamente el nivel actual (dispara la transición normal,
//          incluyendo el video de historia si acabas de completar el nivel 5 o el 9).
// Teclas 1-9: salta directo a ese nivel (sin intro), para probar rápido.
function debugWinLevel(){
  if(!document.getElementById("screen-juego").classList.contains("active")) return;
  levelWords.forEach(w => foundWords.add(w));
  score += 100 * levelWords.length;
  document.getElementById("score").textContent = score;
  renderWordList();
  levelComplete();
}
function debugGoToLevel(n){
  score = 0; secondsElapsed = 0;
  document.getElementById("score").textContent = 0;
  attachBoardEvents();
  playIdle();
  startTimer();
  loadLevel(n-1);
}
window.addEventListener("keydown", (e)=>{
  if(e.key === "w" || e.key === "W"){ debugWinLevel(); }
  else if(e.key >= "1" && e.key <= "9"){ debugGoToLevel(parseInt(e.key,10)); }
});
