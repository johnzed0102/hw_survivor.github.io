# Pac-Man (Valentine’s Special 💘)

You are an experienced software engineer. Build a **playable, classic Pac-Man** game that runs **entirely in the browser** by opening `pacman/index.html` (no server). Use **vanilla HTML/CSS/JavaScript** + **Canvas** only (no external libraries).

## Absolute priority (do in this order)
1) **Phase 1: Classic Pac-Man core (must be playable and recognizable)**
2) **Phase 2: Add Valentine requirements (rose + continuous hearts + ghost elimination)**
3) **Phase 3: Light styling** (subtle Valentine + minimal sci-fi; do NOT distort classic readability)

If anything conflicts, choose correctness and classic feel.

## Deliverables (must create)
- `pacman/index.html`
- `pacman/pacman.css`
- `pacman/pacman.js`

Everything must work when hosted at GitHub Pages under `/pacman/` and opened at `.../pacman/`.

---

# Phase 1 — Classic Pac-Man Core (must be correct)

## Gameplay requirements
- Maze with **walls** and **pellets**.
- **Pac-Man** controlled by arrow keys (WASD optional).
- **At least 2 ghosts** that chase Pac-Man (simple chase is OK).
- **3 lives**, lose 1 life on contact with a ghost, then reset positions.
- Game ends when lives reach 0 (**Game Over**).
- Win when all pellets are eaten (**You Win**).
- Show HUD: score, lives, status.
- Start screen: “Press Space to Start”. Restart: “Press R to Restart”.

## Technical requirements (non-negotiable)
- Use **grid-based maze** as a 2D array. Recommended tile size: 24px.
- Use **frame-rate independent motion**:
  - requestAnimationFrame loop
  - dt (seconds) is clamped (e.g., max 0.05s) OR fixed timestep
  - Movement uses `speedPerSecond * dt` (never per-frame constant increments)
- Separate logic:
  - `update(dt)` for game state
  - `render()` for drawing

## Visual requirements (classic, simple)
- Pac-Man: yellow circle with a mouth wedge pointing direction.
- Pellets: small dots.
- Ghosts: simple ghost silhouette with eyes (different colors).
- Walls: solid blocks/lines clearly readable.
- No heavy Valentine styling in Phase 1.

## Movement and collision
- Pac-Man cannot enter walls.
- Use `direction` and `queuedDirection` so turning at intersections feels responsive.
- Collision:
  - If Pac-Man touches ghost: lose life, reset Pac-Man and ghosts, 1s invulnerability.

---

# Phase 2 — Valentine Special (add on top of stable core)

## Rose power-up 🌹
- A rose appears on a random walkable tile every **8–15 seconds** if none exists.
- Eating rose triggers `poweredUp=true` for **5 seconds**.
- Show power timer in HUD.

## Continuous heart projectiles 💕
- While powered up, Pac-Man automatically shoots a heart every **200ms** in current facing direction.
- Hearts move along the grid; if they hit a wall, they disappear.

## Hearts eliminate ghosts
- If a heart hits a ghost:
  - ghost is removed/reset and respawns after 2 seconds (or reset immediately to spawn)
  - add score bonus (e.g., +50)

After power-up ends, Pac-Man stops shooting.

---

# Phase 3 — Styling (light)
- Keep readability and classic shapes.
- Add subtle Valentine accents (rose icon and hearts are enough).
- Optional: minimal sci-fi HUD (glassy panel, subtle neon lines) but no clutter.

---

# Implementation notes
- Maze encoding suggestion:
  - `#` wall
  - `.` pellet
  - ` ` empty path
  - `P` pacman spawn
  - `G` ghost spawn
- Provide a reasonable built-in maze (about 21x21) and count pellets.
- Must have no console errors.
- Provide complete working code with brief comments; no TODOs.
