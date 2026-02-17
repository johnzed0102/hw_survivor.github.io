# Homework 1: Code with AI — Report

**Website:** https://johnzed0102.github.io/hw_survivor.github.io/  
**Pac-Man:** https://johnzed0102.github.io/hw_survivor.github.io/pacman/  
**arXiv Feed:** https://johnzed0102.github.io/hw_survivor.github.io/arxiv/

This report documents how I used AI coding tools (VS Code Copilot + Copilot CLI) to complete three tasks:
1) build a GitHub Pages homepage, 2) implement a Valentine's Pac-Man game, 3) scaffold an auto-updating arXiv paper feed using agentic programming.

---

## Problem 1. GitHub Website for My Coding Blog

### Goal
Create a homepage hosted on GitHub Pages that can be extended for future assignments, and link to Problem 2 and 3 pages.

### Tools Used
- VS Code Copilot (inline suggestions / completions)
- Copilot Chat (iterating on HTML/CSS design ideas)

### My Prompting Strategy
I treated Copilot as a UI prototyping partner and iterated in small steps:
- First prompt: generate a clean homepage layout (hero + cards) with a dark theme.
- Follow-up prompts: adjust spacing, typography, responsiveness, and link placement.

Example prompts I used:
- “Design a clean homepage for a coding blog with two featured projects and a future posts section; use a dark theme and responsive layout.”
- “Refactor the layout into reusable cards and add CTA buttons linking to ./pacman/ and ./arxiv/.”

### Result
- `index.html` serves as the homepage and includes links to:
  - `./pacman/` (Problem 2)
  - `./arxiv/` (Problem 3)

---

## Problem 2. Game Coding: Pac-Man (Valentine’s Special)

### Goal
Create a playable Pac-Man game page with:
- Classic Pac-Man mechanics (maze + pellets + ghosts + lives)
- Valentine power-up: a rose randomly spawns; when eaten, Pac-Man continuously shoots hearts
- Heart projectiles eliminate ghosts during the power-up duration

### Tools Used
- VS Code Copilot for rapid JS iteration
- Copilot Chat for debugging logic and gameplay tuning

### How I Decomposed the Task
I broke the implementation into “agent-friendly” modules (even though this part was not CLI-based):
1) Game loop + rendering (canvas)
2) Maze grid + collision rules
3) Pac-Man movement & pellet consumption
4) Ghost movement + chase behavior
5) Rose power-up spawn + timer
6) Projectile system (heart spawn, movement, collision with ghosts)
7) Game states (start/pause/game over) and UI (score/lives/power status)

### Prompt Engineering & Iteration Notes
- I avoided one-shot “write the whole game” prompts.
- I asked Copilot to implement one subsystem at a time, then manually tested and iterated.

Example prompts:
- “Implement pellet collision and scoring; keep the maze grid-based and deterministic.”
- “Add a rose item that spawns at random valid tiles every N seconds; on pickup, enter power state for 6 seconds.”
- “During power state, continuously shoot heart projectiles in current direction; hearts should stop at walls and remove ghosts on hit.”

### Result
- Playable Pac-Man at `/pacman/`
- Rose power-up + heart shooting mechanic implemented

---

## Problem 3. Data Scaffolding from the Internet: Auto-updating arXiv Feed (Copilot CLI)

### Goal
Build a new `/arxiv/` page that lists the latest arXiv papers and updates automatically every midnight via GitHub Actions.

**Feed requirements**
- List latest papers matching chosen categories + keywords
- Each entry shows: title, authors, abstract, and PDF link
- Auto-update nightly (00:00 UTC) using GitHub Actions
- Homepage links to this page
- Repo includes `.github` directory with agent configs + workflow files

### Tools Used (Primary)
- **GitHub Copilot CLI** (agentic programming workflow)
- GitHub Actions (scheduled workflow)
- Python (arXiv API fetcher)
- Vanilla HTML/CSS/JS (frontend rendering)

### Query Design
- Categories: `cs.AI`, `cs.CL`, `cs.LG`
- Keywords: `"table" OR "structured data" OR "time series" OR "forecasting"`
- Fetch count: 20 papers per update

### Agentic Workflow I Followed
Following the course “plan → implement” flow:
1) **Plan phase**: write `.github/prompts/plan.prompt.md`, then run  
   `/plan @.github/prompts/plan.prompt.md`  
   The plan explicitly enumerated deliverables: fetch script, JSON schema, arXiv page, workflow, and validation steps.
2) **Implement phase**: execute the plan in phases (scaffolding → fetcher → frontend → workflow → verification).

### What I Generated
- `scripts/fetch_arxiv.py`  
  - pulls arXiv API results and writes normalized JSON output
- `arxiv/papers.json`  
  - committed data file (updated by workflow)
- `arxiv/index.html` + JS/CSS  
  - renders the feed (title/authors/abstract/PDF link)
- `.github/workflows/update-arxiv.yml`  
  - scheduled workflow that runs nightly and commits changes if papers.json differs
- `.github/` directory also includes the prompts/agents/skills used during development (per assignment requirement)

### Debugging Note (Important CLI Lesson)
During planning, I hit a Copilot CLI failure caused by JSON escaping (“Unterminated string in JSON…”).  
Fix: reduce prompt complexity (shorter plan, fewer nested code blocks), and split tasks into smaller phases. This was a concrete example of why agentic programming requires careful decomposition and prompt constraints.

### Result
- arXiv feed page deployed at `/arxiv/`
- Workflow updates the feed nightly via GitHub Actions

---

## Final Verification Checklist
- [x] Homepage reachable and links to `/pacman/` and `/arxiv/`
- [x] Pac-Man playable with rose power-up + heart projectiles
- [x] arXiv feed page displays latest papers with title/authors/abstract/PDF
- [x] GitHub Actions workflow scheduled nightly (00:00 UTC)
- [x] `.github` directory contains agent and workflow artifacts

---

## Reflection
This homework reinforced two key lessons:
1) AI coding works best with tight feedback loops: implement → test → prompt again.
2) Agentic programming succeeds only when tasks are decomposed into small, verifiable steps with clear constraints and artifacts.
