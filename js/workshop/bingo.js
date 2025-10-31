// Random Utility
function Mulberry32(a) 
{
  return function() 
  {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Color palette
const colors = 
[
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#10b981', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan

  '#0ea5e9', // Sky Blue
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#a855f7', // Purple
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e'  // Rose
];

// State
const state = 
{
  catalog: null,
  sheetData: [],
  size: 5,
  seed: Date.now(),
  marks: {},
  playerColor: colors[5],
  useFill: false,
  useFreeSpace: false,

  // Active States
  isActive: false,
  startTime: null,
  elapsedTime: 0,
  timerInterval: null,

  hasWon: false
};

// DOM Elements
const topicSelect = document.getElementById('topicSelect');
const sheetSelect = document.getElementById('sheetSelect');
const sizeSelect = document.getElementById('sizeSelect');
const boardContainer = document.getElementById('boardContainer');
const newBoardBtn = document.getElementById('newBoardBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const seedInput = document.getElementById('seedInput');
const setSeedBtn = document.getElementById('setSeedBtn');
const boardTitle = document.getElementById('boardTitle');
const boardSeedEl = document.getElementById('boardSeed');
const catalogInfo = document.getElementById('catalogInfo');
const resetMarksBtn = document.getElementById('resetMarks');
const colorSwatch = document.getElementById('colorSwatch');
const colorPicker = document.getElementById('colorPicker');
const colorGrid = document.getElementById('colorGrid');
const fillToggle = document.getElementById('fillToggle');
const freeSpaceToggle = document.getElementById('freeSpaceToggle');
const banner = document.getElementById('banner');
const timerDisplay = document.getElementById('timerDisplay');
const startPauseBtn = document.getElementById('startPauseBtn');

// Color Picker Functions
function InitializeColorPicker() 
{
  colors.forEach(color => 
  {
    const opt = document.createElement('div');
    opt.className = 'color-option';
    opt.style.background = color;
    opt.addEventListener('click', () => 
    {
      state.playerColor = color;
      UpdatePlayerColor();
      colorPicker.classList.remove('show');
      RenderBoard();
    });

    colorGrid.appendChild(opt);
  });
}

function UpdatePlayerColor() 
{
  colorSwatch.style.background = state.playerColor;
  document.documentElement.style.setProperty('--player-color', state.playerColor);
  
  // Update selected state in picker
  const opts = colorGrid.querySelectorAll('.color-option');
  opts.forEach(opt => 
  {
    opt.classList.toggle('selected', opt.style.background === state.playerColor);
  });
}

// Event Listeners for Color Picker
colorSwatch.addEventListener('click', () => 
{
  colorPicker.classList.toggle('show');
});

// Close color picker when clicking outside
document.addEventListener('click', (e) => 
{
  if (!colorPicker.contains(e.target) && e.target !== colorSwatch) 
  {
    colorPicker.classList.remove('show');
  }
});

// Toggle Handlers
fillToggle.addEventListener('click', () => 
{
  state.useFill = !state.useFill;
  fillToggle.classList.toggle('active', state.useFill);
  RenderBoard();
});

freeSpaceToggle.addEventListener('click', () => 
{
  state.useFreeSpace = !state.useFreeSpace;
  freeSpaceToggle.classList.toggle('active', state.useFreeSpace);
  RenderBoard();
});

setSeedBtn.addEventListener('click', () => 
{
  const customSeed = parseInt(seedInput.value);
  if (!isNaN(customSeed)) 
  {
    state.seed = customSeed;
    CreateBoard(state.size, state.seed);
  } 
  else 
  {
    alert('Please enter a valid number for the seed');
  }
});

// QoL -> Press Enter to set seed instead of using button
seedInput.addEventListener('keypress', (e) => 
{
  if (e.key === 'Enter') 
  {
    setSeedBtn.click();
  }
});

startPauseBtn.addEventListener('click', () => 
{
  if (state.isActive) 
  {
    PauseTimer();
  } 
  else 
  {
    StartTimer();
  }
});

// Catalog Functions
async function LoadCatalog() 
{
  try 
  {
    const res = await fetch('/sheets/catalog.json', {cache: 'no-store'});
    if (!res.ok) 
      throw new Error('Catalog not found');

    state.catalog = await res.json();
    PopulateCatalog();
  } 
  catch (e) 
  {
    catalogInfo.textContent = 'Failed to load catalog. Create sheets/catalog.json';
    console.warn(e);
  }
}

function PopulateCatalog() 
{
  topicSelect.innerHTML = '';
  sheetSelect.innerHTML = '';

  if (!state.catalog || !state.catalog.topics) 
    return;
  
  state.catalog.topics.forEach(t => 
  {
    const o = document.createElement('option');
    o.value = t.name;
    o.textContent = t.name;
    topicSelect.appendChild(o);
  });
  
  topicSelect.addEventListener('change', UpdateSheets);
  UpdateSheets();
  catalogInfo.textContent = 'Loaded catalog: ' + state.catalog.topics.length + ' topics';
}

function UpdateSheets() 
{
  const topic = topicSelect.value;
  sheetSelect.innerHTML = '';

  const t = state.catalog.topics.find(x => x.name === topic);
  if (!t) 
    return;
  
  t.sheets.forEach(s => 
  {
    const o = document.createElement('option');
    o.value = s;
    o.textContent = s;
    sheetSelect.appendChild(o);
  });
  
  LoadSelectedSheet();
}

async function LoadSelectedSheet() 
{
  const topic = topicSelect.value;
  const sheet = sheetSelect.value;
  try 
  {
    const path = `/sheets/${encodeURIComponent(topic)}/${encodeURIComponent(sheet)}.json`;

    const res = await fetch(path, {cache: 'no-store'});
    if (!res.ok) 
      throw new Error('sheet not found');

    state.sheetData = await res.json();
    catalogInfo.textContent = `Loaded ${state.sheetData.length} entries from ${topic}/${sheet}`;
    
    CreateBoard(state.size, state.seed);
  } 
  catch (e) 
  {
    catalogInfo.textContent = 'Failed loading sheet';
    console.warn(e);
  }
}

// Board Functions
function CreateBoard(size, seed) 
{
  state.size = +size;
  state.seed = seed || Date.now();
  state.marks = {};
  state.hasWon = false;

  ResetTimer();

  boardTitle.textContent = `${sheetSelect.value || 'Board'} (${state.size}x${state.size})`;
  boardSeedEl.textContent = `Seed: ${state.seed}`;

  RenderBoard();
}

function GenerateCells() 
{
  const items = state.sheetData.slice();
  const needed = state.size * state.size;
  const rand = Mulberry32(state.seed);
  
  while (items.length < needed)
    items.push(...state.sheetData);
  
  for (let i = items.length - 1; i > 0; i--) 
  {
    const j = Math.floor(rand() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  
  return items.slice(0, needed);
}

function RenderBoard() 
{
  const cells = GenerateCells();
  const n = state.size;
  const centerIdx = Math.floor(n * n / 2);
  
  boardContainer.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
  boardContainer.innerHTML = '';
  
  cells.forEach((c, idx) => 
  {
    const el = document.createElement('div');
    el.className = 'cell';
    el.setAttribute('data-idx', idx);
    
    const isFreeSpace = state.useFreeSpace && n % 2 === 1 && idx === centerIdx;
    
    if (isFreeSpace) 
    {
      el.classList.add('free-space');
      state.marks[idx] = true; // Mark da free spaces
    }
    
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = isFreeSpace ? 'FREE' : (c.title || '(no title)');
    
    const tip = document.createElement('div');
    tip.className = 'tooltip';
    tip.textContent = c.description || '';
    
    el.appendChild(title);

    if (!isFreeSpace) 
      el.appendChild(tip);
    
    // Add marking visualization
    if (state.marks[idx] && !isFreeSpace) 
    {
      if (state.useFill) 
      {
        el.classList.add('marked-fill');
      } 
      else 
      {
        const dots = document.createElement('div');
        dots.className = 'dots';
        const d = document.createElement('div');
        d.className = 'dot';
        d.style.background = state.playerColor;
        dots.appendChild(d);
        el.appendChild(dots);
      }
    }
    
    if (!isFreeSpace) 
    {
      el.addEventListener('click', () => OnCellClick(idx));
    }
    
    boardContainer.appendChild(el);
  });
}

function OnCellClick(idx)
{
  if (!state.isActive) 
  {
    alert('Press Start to begin playing!');
    return;
  }

  state.marks[idx] = !state.marks[idx];
  RenderBoard();
  CheckBingo();
}

// Bingo Check Function
function CheckBingo() 
{
  // This only allows full feature set for 1 row bingo games.
  // We need to implement game modes to handle this better
  if(state.hasWon)
    return;

  const n = state.size;
  const grid = [];
  
  for (let r = 0; r < n; r++) 
  {
    grid[r] = [];

    for (let c = 0; c < n; c++) 
    {
      const idx = r * n + c;
      grid[r][c] = state.marks[idx] ? 1 : 0;
    }
  }
  
  const lines = [];
  
  // Check rows
  for (let r = 0; r < n; r++) 
  {
    if (grid[r].reduce((a, b) => a + b, 0) === n) 
    {
      lines.push({type: 'row', index: r});
    }
  }
  
  // Check columns
  for (let c = 0; c < n; c++) 
  {
    let sum = 0;
    for (let r = 0; r < n; r++) 
      sum += grid[r][c];

    if (sum === n) 
      lines.push({type: 'col', index: c});
  }
  
  // Check diagonals
  let d1 = 0, d2 = 0;
  for (let i = 0; i < n; i++) 
  {
    d1 += grid[i][i];
    d2 += grid[i][n - 1 - i];
  }

  if (d1 === n) 
    lines.push({type: 'diag', index: 1});

  if (d2 === n) 
    lines.push({type: 'diag', index: 2});
  
  if (lines.length > 0) 
  {
    state.hasWon = true;

    PauseTimer();
    const finalTime = timerDisplay.textContent;
    ShowBanner(`🎉 BINGO in ${finalTime}! 🎉`);
  }
}

function ShowBanner(text, timeout = 5000) 
{
  banner.style.display = 'block';
  banner.textContent = text;
  setTimeout(() => 
  {
    banner.style.display = 'none';
  }, timeout);
}

// Timer functions
function StartTimer() 
{
  state.isActive = true;
  state.startTime = Date.now() - state.elapsedTime;
  state.timerInterval = setInterval(UpdateTimer, 100);
  startPauseBtn.textContent = 'Pause';
}

function PauseTimer() 
{
  state.isActive = false;
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  startPauseBtn.textContent = 'Resume';
}

function ResetTimer() 
{
  state.isActive = false;
  state.elapsedTime = 0;
  state.startTime = null;
  state.hasWon = false;
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  timerDisplay.textContent = '00:00';
  startPauseBtn.textContent = 'Start';
}

function UpdateTimer() 
{
  if (state.isActive) 
  {
    state.elapsedTime = Date.now() - state.startTime;

    const minutes = Math.floor(state.elapsedTime / 60000);
    const seconds = Math.floor((state.elapsedTime % 60000) / 1000);
    const milliseconds = Math.floor((state.elapsedTime % 1000));

    timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
  }
}

// UI Event Handlers
newBoardBtn.addEventListener('click', () => 
{
  state.seed = Date.now();
  CreateBoard(state.size, state.seed);
});

shuffleBtn.addEventListener('click', () => 
{
  state.seed = Math.floor(Math.random() * 0xffffffff);
  CreateBoard(state.size, state.seed);
});

sizeSelect.addEventListener('change', () => 
{
  CreateBoard(sizeSelect.value, state.seed);
});

sheetSelect.addEventListener('change', LoadSelectedSheet);

resetMarksBtn.addEventListener('click', () => 
{
  state.marks = {};
  ResetTimer();
  RenderBoard();
});

// Initialize
(async () =>
{
  await LoadCatalog();
  sizeSelect.value = '5';
  InitializeColorPicker();
  UpdatePlayerColor();
})();

