# Clockwork

A precise, local-first clock, timer, and stopwatch with selectable visual moods.

## Run it

Open `index.html` directly in a browser. No install or server is required.

## Included

- Focus timer with 5, 15, 25, and 45 minute presets plus custom durations.
- Stopwatch with lap recording and pause/reset controls.
- Reads the computer's local system time with the browser `Date` API and refreshes every second.
- Six visual moods: Pixel arcade, Minecraft, Midnight noir, Botanical studio, Soft sunset, and Ocean air.
- Remembers the selected mood locally in `localStorage`.
- Fullscreen focus view that presents only the timer for screen sharing or a desk display.
- Responsive desktop and mobile layout.
- Reduced-motion support for accessibility.

## Privacy and security

The app has no API calls, external assets, accounts, analytics, cookies, or data collection. Time is read from the device running the browser; the selected theme is the only stored value, and it stays in that browser's local storage.
