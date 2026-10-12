// ============ 1. KONFIGURATION ============
const DATA_URL = "data.json";

// ============ 2. ZUSTAND (State) ============
// Eine zentrale Stelle, an der der aktuelle Zustand liegt.
const state = {
  data: null,        // geladener Dialogbaum
  currentId: null,   // aktueller Knoten
  history: []        // besuchte Knoten (für "Zurück")
};

// ============ 3. DOM-REFERENZEN ============
const logEl     = document.getElementById("chat-log");
const optionsEl = document.getElementById("chat-options");
const backBtn   = document.getElementById("btn-back");
const resetBtn  = document.getElementById("btn-restart");

// ============ 4. DATENSCHICHT ============
async function loadData(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Daten konnten nicht geladen werden (${response.status})`);
  }
  return response.json();
}

function getNode(id) {
  return state.data.nodes[id];
}

// ============ 5. DARSTELLUNG (View) ============
function addMessage(text, sender) {
  const div = document.createElement("div");
  div.className = `msg msg--${sender}`;
  const span = document.createElement("span");
  span.textContent = text;          // textContent statt innerHTML -> sicher
  div.appendChild(span);
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}

function renderOptions(node) {
  optionsEl.innerHTML = "";

  const options = node.options || [];

  if (options.length === 0) {
    const btn = document.createElement("button");
    btn.textContent = "Von vorne beginnen";
    btn.addEventListener("click", restart);
    optionsEl.appendChild(btn);
    return;
  }

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option.label;
    btn.addEventListener("click", () => handleChoice(option));
    optionsEl.appendChild(btn);
  });
}

function updateControls() {
  backBtn.disabled = state.history.length === 0;
}

// ============ 6. STEUERUNG (Controller) ============
function goTo(id) {
  const node = getNode(id);
  if (!node) {
    addMessage(`Fehler: Knoten "${id}" existiert nicht.`, "bot");
    return;
  }
  state.currentId = id;
  addMessage(node.text, "bot");
  renderOptions(node);
  updateControls();
}

function handleChoice(option) {
  addMessage(option.label, "user");
  state.history.push(state.currentId);
  goTo(option.next);
}

function goBack() {
  if (state.history.length === 0) return;
  const previousId = state.history.pop();
  addMessage("Zurück", "user");
  goTo(previousId);
}

function restart() {
  state.history = [];
  logEl.innerHTML = "";
  goTo(state.data.start);
}

// ============ 7. START ============
async function init() {
  try {
    state.data = await loadData(DATA_URL);
    backBtn.addEventListener("click", goBack);
    resetBtn.addEventListener("click", restart);
    restart();
  } catch (error) {
    addMessage(error.message, "bot");
  }
}

init();