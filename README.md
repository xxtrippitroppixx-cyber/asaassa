# DASHINDEX — Geometry Dash Demon Progression

A static, responsive Geometry Dash progression tracker inspired by dark leaderboard layouts. It is designed to run on GitHub Pages with no build step and no backend.

## Features

- 100-level suggested route from first Easy Demons through early Medium Demons.
- Search by level, creator, ID, or skill focus.
- Filter by progression stage, cleared status, and coin objectives.
- Mark levels cleared and track coin objectives separately.
- Set an exact coin target (0–3) per level, or keep **All available** as the default.
- Progress statistics and automatic next-level recommendation.
- Local browser saving plus JSON export/import for backups and moving devices.
- Responsive layout for desktop, tablet, and mobile.

## Publish on GitHub Pages

1. Create a new GitHub repository (or open the repository where you want the site).
2. Upload **all five site files** from this folder into the repository's top-level/root folder: `index.html`, `styles.css`, `app.js`, `levels.js`, and `favicon.svg`.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then save.
6. GitHub Pages will show the published address after deployment finishes.

You can also upload the ZIP directly by extracting it first and uploading the files. Do not place the files inside an extra nested folder unless you set that folder as the Pages publishing source.

## Progress and backups

Progress is saved in the browser's `localStorage` for the published site. It does not automatically sync between browsers or devices. Use **Export Data** to download a JSON backup and **Import Data** to restore it elsewhere.

## About the level route and coins

This is a fan-made practice route, not an official Pointercrate ranking and not a claim that every player will find the levels equally difficult. Geometry Dash ratings and player difficulty opinions can change. The level IDs shown are included where available from community references; entries without an ID can be searched by level and creator.

The default coin goal is **all secret coins available in that level**. Exact coin counts are not consistently available for every user level, so the site lets you set the target to 0, 1, 2, or 3 after checking the level in-game. The `All available` setting is the safest default rather than guessing a coin count.

## Files

- `index.html` — page structure
- `styles.css` — responsive dark leaderboard design
- `app.js` — filtering, progress, modal, import/export, local saving
- `levels.js` — the 100-level route and descriptions
- `favicon.svg` — site icon

No server, API key, package manager, or framework is required.
