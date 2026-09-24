const hoursElement = document.querySelector("#hours");
const minutesElement = document.querySelector("#minutes");
const secondsElement = document.querySelector("#seconds");
const longDateElement = document.querySelector("#long-date");
const timezoneElement = document.querySelector("#timezone");
const todayLabelElement = document.querySelector("#today-label");
const themeButtons = document.querySelectorAll("[data-theme-choice]");

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});
const timezoneFormatter = new Intl.DateTimeFormat(undefined, { timeZoneName: "short" });

function pad(value) {
  return String(value).padStart(2, "0");
}

function updateClock() {
  const now = new Date();
  const parts = timeFormatter.formatToParts(now);
  const time = Object.fromEntries(parts.map(({ type, value }) => [type, value]));

  hoursElement.textContent = pad(time.hour);
  minutesElement.textContent = pad(time.minute);
  secondsElement.textContent = pad(time.second);
  longDateElement.textContent = dateFormatter.format(now);
  todayLabelElement.textContent = shortDateFormatter.format(now);
  timezoneElement.textContent = timezoneFormatter.formatToParts(now).find((part) => part.type === "timeZoneName")?.value ?? "Local time";
}

function setTheme(theme) {
  document.body.dataset.theme = theme;
  themeButtons.forEach((button) => {
    const isActive = button.dataset.themeChoice === theme;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  localStorage.setItem("clockwork-theme", theme);
}

themeButtons.forEach((button) => {
  button.addEventListener("click", () => setTheme(button.dataset.themeChoice));
});

const savedTheme = localStorage.getItem("clockwork-theme");
if (savedTheme && [...themeButtons].some((button) => button.dataset.themeChoice === savedTheme)) {
  setTheme(savedTheme);
}

updateClock();
setInterval(updateClock, 1000);