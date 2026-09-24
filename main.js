const hoursElement = document.querySelector("#hours");
const minutesElement = document.querySelector("#minutes");
const secondsElement = document.querySelector("#seconds");
const longDateElement = document.querySelector("#long-date");
const timezoneElement = document.querySelector("#timezone");
const themeButtons = document.querySelectorAll("[data-theme-choice]");
const modeButtons = document.querySelectorAll("[data-mode-choice]");
const modeViews = document.querySelectorAll("[data-mode-view]");
const timerDisplay = document.querySelector("#timer-display");
const timerProgressBar = document.querySelector("#timer-progress-bar");
const stopwatchDisplay = document.querySelector("#stopwatch-display");
const lapList = document.querySelector("#lap-list");
const toolKicker = document.querySelector("#tool-kicker");
const toolTitle = document.querySelector("#tool-title");
const toolStatus = document.querySelector("#tool-status");
const startButton = document.querySelector("#start-button");
const startLabel = document.querySelector("#start-label");
const lapButton = document.querySelector("#lap-button");
const resetButton = document.querySelector("#reset-button");
const focusButton = document.querySelector("#focus-button");
const fullscreenButton = document.querySelector("#fullscreen-button");
const focusStage = document.querySelector("#focus-stage");
const focusDisplay = document.querySelector("#focus-display");
const focusStatus = document.querySelector("#focus-status");
const focusThemeLabel = document.querySelector("#focus-theme-label");
const focusToggle = document.querySelector("#focus-toggle");
const exitFocusButton = document.querySelector("#exit-focus-button");
const customMinutesInput = document.querySelector("#custom-minutes");
const presetButtons = document.querySelectorAll("[data-duration]");

const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const dateFormatter = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const timezoneFormatter = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" });
const themeNames = { pixel: "Pixel arcade", minecraft: "Minecraft", noir: "Midnight noir", botanical: "Botanical studio", sunset: "Soft sunset", ocean: "Ocean air" };
const modeDetails = {
  timer: { kicker: "Deep work interval", title: "Focus timer" },
  stopwatch: { kicker: "Track the moment", title: "Stopwatch" },
  clock: { kicker: "Your local time", title: "Clock" },
};

const state = {
  mode: localStorage.getItem("clockwork-mode") || "timer",
  timerDuration: Number(localStorage.getItem("clockwork-duration")) || 1500,
  timerRemaining: Number(localStorage.getItem("clockwork-duration")) * 1000 || 1500000,
  timerRunning: false,
  timerEndAt: 0,
  stopwatchElapsed: 0,
  stopwatchStartedAt: 0,
  stopwatchRunning: false,
  laps: [],
};

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTimer(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

function formatStopwatch(milliseconds) {
  const totalCentiseconds = Math.floor(milliseconds / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;
  return `${pad(minutes)}:${pad(seconds)}.${pad(centiseconds)}`;
}

function getStopwatchElapsed() {
  return state.stopwatchRunning ? state.stopwatchElapsed + Date.now() - state.stopwatchStartedAt : state.stopwatchElapsed;
}

function updateClock() {
  const now = new Date();
  const parts = timeFormatter.formatToParts(now);
  const time = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  hoursElement.textContent = pad(time.hour);
  minutesElement.textContent = pad(time.minute);
  secondsElement.textContent = pad(time.second);
  longDateElement.textContent = dateFormatter.format(now);
  timezoneElement.textContent = timezoneFormatter.formatToParts(now).find((part) => part.type === "timeZoneName")?.value ?? "Local time";
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  focusThemeLabel.textContent = themeNames[theme] || themeNames.pixel;
  themeButtons.forEach((button) => {
    const isActive = button.dataset.themeChoice === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  localStorage.setItem("clockwork-theme", theme);
}

function setMode(mode) {
  state.mode = mode;
  localStorage.setItem("clockwork-mode", mode);
  modeButtons.forEach((button) => {
    const isActive = button.dataset.modeChoice === mode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  modeViews.forEach((view) => { view.hidden = view.dataset.modeView !== mode; });
  toolKicker.textContent = modeDetails[mode].kicker;
  toolTitle.textContent = modeDetails[mode].title;
  lapButton.hidden = mode !== "stopwatch";
  focusButton.hidden = mode !== "timer";
  startButton.hidden = mode === "clock";
  resetButton.hidden = mode === "clock";
  render();
}

function setTimerDuration(seconds) {
  state.timerDuration = seconds;
  state.timerRemaining = seconds * 1000;
  state.timerRunning = false;
  state.timerEndAt = 0;
  localStorage.setItem("clockwork-duration", String(seconds));
  presetButtons.forEach((button) => button.classList.toggle("is-selected", Number(button.dataset.duration) === seconds));
  customMinutesInput.value = "";
  render();
}

function toggleTimer() {
  if (state.timerRunning) {
    state.timerRemaining = Math.max(0, state.timerEndAt - Date.now());
    state.timerRunning = false;
    state.timerEndAt = 0;
  } else {
    if (state.timerRemaining <= 0) state.timerRemaining = state.timerDuration * 1000;
    state.timerEndAt = Date.now() + state.timerRemaining;
    state.timerRunning = true;
  }
  render();
}

function toggleStopwatch() {
  if (state.stopwatchRunning) {
    state.stopwatchElapsed = getStopwatchElapsed();
    state.stopwatchStartedAt = 0;
    state.stopwatchRunning = false;
  } else {
    state.stopwatchStartedAt = Date.now();
    state.stopwatchRunning = true;
  }
  render();
}

function resetCurrentTool() {
  if (state.mode === "timer") {
    state.timerRunning = false;
    state.timerEndAt = 0;
    state.timerRemaining = state.timerDuration * 1000;
  } else if (state.mode === "stopwatch") {
    state.stopwatchRunning = false;
    state.stopwatchStartedAt = 0;
    state.stopwatchElapsed = 0;
    state.laps = [];
  }
  render();
}

function renderLaps() {
  lapList.replaceChildren();
  if (!state.laps.length) {
    const empty = document.createElement("p");
    empty.className = "empty-laps";
    empty.textContent = "Laps will appear here as you work.";
    lapList.append(empty);
    return;
  }
  state.laps.slice().reverse().forEach((lap, index) => {
    const row = document.createElement("div");
    row.className = "lap-row";
    row.innerHTML = `<span>Lap ${state.laps.length - index}</span><strong>${formatStopwatch(lap)}</strong>`;
    lapList.append(row);
  });
}

function render() {
  const timerMilliseconds = state.timerRunning ? Math.max(0, state.timerEndAt - Date.now()) : state.timerRemaining;
  if (timerMilliseconds === 0 && state.timerRunning) {
    state.timerRunning = false;
    state.timerEndAt = 0;
    state.timerRemaining = 0;
  } else if (state.timerRunning) {
    state.timerRemaining = timerMilliseconds;
  }
  timerDisplay.textContent = formatTimer(state.timerRemaining);
  const progress = state.timerDuration ? Math.max(0, Math.min(100, (state.timerRemaining / (state.timerDuration * 1000)) * 100)) : 0;
  timerProgressBar.style.width = `${progress}%`;
  stopwatchDisplay.textContent = formatStopwatch(getStopwatchElapsed());
  renderLaps();

  const timerComplete = !state.timerRemaining && !state.timerRunning;
  if (state.mode === "timer") {
    toolStatus.textContent = state.timerRunning ? "Running" : timerComplete ? "Complete" : state.timerRemaining < state.timerDuration * 1000 ? "Paused" : "Ready";
    startLabel.textContent = state.timerRunning ? "Pause timer" : timerComplete ? "Restart timer" : "Start timer";
  } else if (state.mode === "stopwatch") {
    toolStatus.textContent = state.stopwatchRunning ? "Running" : state.stopwatchElapsed ? "Paused" : "Ready";
    startLabel.textContent = state.stopwatchRunning ? "Pause stopwatch" : "Start stopwatch";
  } else {
    toolStatus.textContent = "Live";
  }
  focusDisplay.textContent = formatTimer(state.timerRemaining);
  focusStatus.textContent = state.timerRunning ? "In focus" : timerComplete ? "Interval complete" : state.timerRemaining < state.timerDuration * 1000 ? "Paused" : "Ready when you are";
  focusToggle.textContent = state.timerRunning ? "Pause timer" : timerComplete ? "Restart timer" : "Start timer";
}

async function enterFocusMode() {
  setMode("timer");
  focusStage.hidden = false;
  if (focusStage.requestFullscreen) {
    try {
      await focusStage.requestFullscreen();
    } catch {
      document.body.classList.add("focus-fallback");
    }
  } else {
    document.body.classList.add("focus-fallback");
  }
  render();
}

async function exitFocusMode() {
  document.body.classList.remove("focus-fallback");
  if (document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
  focusStage.hidden = true;
}

themeButtons.forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.themeChoice)));
modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.modeChoice)));
presetButtons.forEach((button) => button.addEventListener("click", () => setTimerDuration(Number(button.dataset.duration))));
customMinutesInput.addEventListener("change", () => {
  const value = Number(customMinutesInput.value);
  if (!Number.isFinite(value) || value < 1) return;
  setTimerDuration(Math.min(999, Math.floor(value)) * 60);
});
startButton.addEventListener("click", () => state.mode === "timer" ? toggleTimer() : toggleStopwatch());
resetButton.addEventListener("click", resetCurrentTool);
lapButton.addEventListener("click", () => { if (state.stopwatchRunning) { state.laps.push(getStopwatchElapsed()); render(); } });
focusButton.addEventListener("click", enterFocusMode);
fullscreenButton.addEventListener("click", enterFocusMode);
focusToggle.addEventListener("click", toggleTimer);
exitFocusButton.addEventListener("click", exitFocusMode);
document.addEventListener("fullscreenchange", () => { if (document.fullscreenElement !== focusStage && !document.body.classList.contains("focus-fallback")) focusStage.hidden = true; });

const savedTheme = localStorage.getItem("clockwork-theme");
setTheme(savedTheme && themeNames[savedTheme] ? savedTheme : "pixel");
setMode(modeDetails[state.mode] ? state.mode : "timer");
updateClock();
render();
setInterval(() => { updateClock(); render(); }, 100);