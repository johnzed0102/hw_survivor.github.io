# Prompt: Render arXiv Page and Verify Locally

**Goal**: Test the frontend `/arxiv/index.html` page locally to ensure papers load, render correctly, and all interactions work.

## Steps to Execute

### 1. Start Local HTTP Server
```bash
cd /Users/john/Desktop/BST236/hw_survivor.github.io
python3 -m http.server 8000
# Server running at http://localhost:8000/
```

### 2. Open in Browser
- Visit: http://localhost:8000/arxiv/index.html
- You should see a list of paper cards

### 3. Verify Visual Rendering
Check that each paper card displays:
- ✅ **Title** (clickable link to PDF)
- ✅ **Authors** (comma-separated list)
- ✅ **Date** (formatted publication date)
- ✅ **Abstract** (collapsed by default, expandable)
- ✅ **PDF Link** (button or link labeled "📄 View PDF")

### 4. Test Interactions
- Click on a title → should open PDF in new tab (may fail in local mode, expected)
- Click "Abstract" header → abstract should expand
- Click again → abstract should collapse
- Verify no JavaScript errors in browser console (F12 → Console tab)

### 5. Check Responsive Design
- Desktop view (full width) → cards in grid
- Mobile view (F12 → toggle device toolbar, set to iPhone 12):
  - Cards should stack vertically
  - All text readable
  - Links tappable

### 6. Validate HTML/JS Syntax
```bash
# Check HTML validity (if html5validator installed)
html5validator --root arxiv/ || echo "html5validator not installed (OK)"

# Validate JSON loads correctly
python3 << 'EOF'
import json
with open('arxiv/papers.json', 'r') as f:
    data = json.load(f)
print(f"✓ JSON loads: {len(data['papers'])} papers ready")
EOF
```

### 7. Test Error Handling
In browser console, rename `papers.json` temporarily:
```bash
mv arxiv/papers.json arxiv/papers.json.bak
```

Refresh page → should display user-friendly error message (not blank)

Restore file:
```bash
mv arxiv/papers.json.bak arxiv/papers.json
```

## Success Criteria
- ✅ Page loads without 404 errors
- ✅ Paper cards render (≥1 paper visible)
- ✅ All required fields displayed per card
- ✅ Abstract expand/collapse works
- ✅ No JavaScript errors in console
- ✅ Responsive on mobile
- ✅ Error message displays gracefully if JSON unavailable

## Troubleshooting
- **Blank page**: Check browser console (F12) for JS errors. Papers.json might not be loading due to path.
- **No papers show**: Verify `arxiv/papers.json` exists and contains valid data.
- **Styling looks wrong**: Check `arxiv/arxiv.css` loaded (F12 → Network tab).
- **PDF links don't work locally**: Expected behavior. Will work on GitHub Pages.

## Cleanup
```bash
# Stop server: Ctrl+C in terminal
```

## Next Step
Once rendering works locally, proceed to testing the GitHub Actions workflow.
