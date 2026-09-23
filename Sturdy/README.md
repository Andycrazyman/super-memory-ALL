# Study Hub — 20 Week Workspace

Study Hub has two ways to use it:

## 1. Normal student use — no server required

You can open `index.html` directly in a browser. Your journal, HTML, images, checklist, sticky notes, chalkboard, and quick links are saved in that browser's local storage.

The **Export professor site** button on the home page creates one self-contained HTML file containing the 20-week work you choose to share by default (reflections, HTML, images, resources, checklist, and chalkboard). It intentionally leaves out sticky notes and AI conversations. Send that single `.html` file to your professor. They can double-click it and review it with **no Node.js, server, API key, or setup**.

Each week's **Professor Mode** can also export a focused professor site for that week.

## 2. Optional private AI/server mode

If you want the private AI assistant and server-side share links, install Node.js 20+ and use the included `start-study-hub.bat` after creating `.env` from `.env.example`.

Do not share or upload `.env`; it can contain your API key.

Open `http://127.0.0.1:3000` when the server is running. Do not double-click `index.html` if you want AI/server features.

## Important sharing detail

A browser's local storage is private to that computer/browser. Your professor cannot see your saved student work simply by receiving the original Study Hub folder. Use **Export professor site** to make a portable copy of your work for review.

The exported professor file is a static review copy. It does not give the professor access to your editable local workspace.
