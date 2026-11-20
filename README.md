# DASH//100 — Geometry Dash progression tracker

A static, responsive Geometry Dash progress tracker for GitHub Pages. The route starts at **Stereo Madness**, runs through the 22 official main levels in their in-game order, then moves into community Easy Demons, upper Easy Demons, and Medium Demons.

## Included

- 100 levels, ordered from Stereo Madness through a community Medium Demon route.
- Filters for official levels, first demons, Easy Demons, upper Easy Demons, and Medium Demons.
- Search by level, creator, level ID, difficulty, or skill focus.
- Clear tracking and per-level coin goals.
- Automatic next-level target and route completion stats.
- Browser-local saves, JSON export/import, and reset.
- Responsive layout for desktop and mobile; no build step or framework required.

## Publish with GitHub Pages

1. Download and extract `gd-demon-roadmap-github-pages.zip`.
2. Upload the contents of this folder to the **root** of your GitHub repository. Keep `index.html`, `styles.css`, `app.js`, `levels.js`, and `favicon.svg` together.
3. Open **Settings → Pages** in your repository.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/(root)`, then save.
6. Open the Pages URL shown by GitHub after deployment.

## Progress and backups

The tracker stores progress in this browser's `localStorage`. It does not automatically sync between browsers or devices. Use **Export** to download a JSON backup and **Import** to restore it elsewhere.

## About the route and coin goals

This is an unofficial practice route, not a Pointercrate ranking or an official RobTop list. The first 22 entries are the official main levels, in their normal order. Community levels after those are suggested practice milestones; individual difficulty can vary by player and may change with in-game ratings.

Official main levels have a known three-coin target. For custom levels, the default is **all available coins** rather than guessing exact counts; open a level's details to set a target from 0–3 and track coins collected.

## Files

- `index.html` — page layout
- `styles.css` — design and responsive styling
- `app.js` — filters, progress, modal, and import/export
- `levels.js` — 100-level route data
- `favicon.svg` — site icon

No server, API key, package manager, or framework is required.
