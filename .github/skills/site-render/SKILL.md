# Skill: Frontend Rendering (HTML/CSS/JS)

**Objective**: Implement vanilla (non-framework) HTML/CSS/JS to render arXiv papers from JSON with no external dependencies.

## Architecture
- **HTML (`/arxiv/index.html`)**: Static shell + container div for JS injection
- **JavaScript (`/arxiv/arxiv.js`)**: Load papers.json, render grid of cards, handle interactions
- **CSS (`/arxiv/arxiv.css`)**: Styling matching homepage dark theme (glass morphism, sci-fi aesthetic)

## HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>arXiv Feed</title>
  <link rel="stylesheet" href="./arxiv.css">
</head>
<body>
  <div id="papers-container"></div>
  <script src="./arxiv.js"></script>
</body>
</html>
```

## JavaScript Pattern
```javascript
// 1. Fetch papers.json relative to current page
fetch('./papers.json')
  .then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  })
  .then(data => {
    if (!data.papers || !Array.isArray(data.papers)) {
      throw new Error('Invalid papers data');
    }
    renderPapers(data.papers);
  })
  .catch(err => {
    document.getElementById('papers-container').innerHTML = 
      `<div class="error">Error loading papers: ${escapeHtml(err.message)}</div>`;
  });

// 2. Render each paper as card
function renderPapers(papers) {
  const container = document.getElementById('papers-container');
  container.innerHTML = papers.map(p => `
    <div class="paper-card">
      <h3><a href="${escapeAttr(p.pdf_url)}" target="_blank">${escapeHtml(p.title)}</a></h3>
      <p class="authors">${escapeHtml(p.authors.join(', '))}</p>
      <p class="date">${new Date(p.updated).toLocaleDateString()}</p>
      <details>
        <summary>Abstract</summary>
        <p class="abstract">${escapeHtml(p.abstract)}</p>
      </details>
      <a class="pdf-link" href="${escapeAttr(p.pdf_url)}" target="_blank">📄 View PDF</a>
    </div>
  `).join('');
}

// 3. Security: XSS prevention
function escapeHtml(text) {
  const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  return text.replace(/[&<>"']/g, m => map[m]);
}

function escapeAttr(text) {
  return text.replace(/"/g, '&quot;');
}
```

## CSS Pattern (matches homepage)
- Dark background (var(--bg0), var(--bg1))
- Glass morphism cards (backdrop-filter: blur)
- Subtle sci-fi gradients (cyan, violet, mint accents)
- Responsive grid (12-column on desktop, 1 on mobile)
- Expandable abstracts via `<details>` native element

## Key Requirements
- [ ] No external JS frameworks (React, Vue, Angular, etc.)
- [ ] No external CSS framework (Bootstrap, Tailwind, etc.)
- [ ] Fetch relative path: `./papers.json` (works on GitHub Pages)
- [ ] XSS prevention: escape HTML in title, authors, abstract
- [ ] Handle missing/empty papers gracefully
- [ ] Works in modern browsers (Chrome, Firefox, Safari)
- [ ] Mobile responsive

## Testing Locally
```bash
python3 -m http.server 8000
# Visit http://localhost:8000/arxiv/index.html
# Verify: papers load, cards render, abstract expand/collapse, PDF links work
```
