# Prompt: Fetch arXiv Papers and Validate JSON

**Goal**: Run the arXiv fetch script locally, generate `papers.json`, and validate that it meets schema requirements.

## Steps to Execute

### 1. Run the Fetch Script
```bash
cd /Users/john/Desktop/BST236/hw_survivor.github.io
python3 scripts/fetch_arxiv.py
```

**Expected output**:
```
Fetching arXiv papers...
Query: (cat:cs.AI OR cat:cs.CL OR cat:cs.LG) AND (all:"table" OR all:"structured data" OR all:"time series" OR all:"forecasting")
Fetched 20 papers.
Wrote arxiv/papers.json
```

### 2. Verify JSON Exists and Is Valid
```bash
test -f arxiv/papers.json && echo "✓ File exists" || echo "✗ File missing"
python3 -m json.tool arxiv/papers.json > /dev/null && echo "✓ Valid JSON" || echo "✗ Invalid JSON"
```

### 3. Validate Schema Compliance
```bash
python3 << 'EOF'
import json
import re

with open('arxiv/papers.json', 'r', encoding='utf-8') as f:
    content = f.read()

# Check trailing newline
if not content.endswith('\n'):
    print("✗ Missing trailing newline")
else:
    print("✓ Trailing newline present")

data = json.loads(content)

# Check structure
if 'papers' not in data or not isinstance(data['papers'], list):
    print("✗ Invalid root structure")
else:
    print(f"✓ Found {len(data['papers'])} papers")

# Validate each paper
errors = []
for i, paper in enumerate(data.get('papers', [])):
    required = ['arxiv_id', 'title', 'authors', 'abstract', 'pdf_url', 'updated']
    for field in required:
        if field not in paper:
            errors.append(f"Paper {i}: Missing {field}")
    
    if not re.match(r'^\d{4}\.\d{4,5}', paper.get('arxiv_id', '')):
        errors.append(f"Paper {i}: Invalid arxiv_id")
    
    if not isinstance(paper.get('authors'), list) or not paper['authors']:
        errors.append(f"Paper {i}: authors must be non-empty list")
    
    if not paper.get('pdf_url', '').startswith('http'):
        errors.append(f"Paper {i}: Invalid PDF URL")

if errors:
    print("✗ Schema validation failed:")
    for e in errors:
        print(f"  - {e}")
else:
    print("✓ All papers pass schema validation")
EOF
```

### 4. Inspect Sample Paper
```bash
python3 << 'EOF'
import json
with open('arxiv/papers.json', 'r') as f:
    data = json.load(f)
if data['papers']:
    p = data['papers'][0]
    print(f"Title: {p['title']}")
    print(f"Authors: {', '.join(p['authors'][:3])}{'...' if len(p['authors']) > 3 else ''}")
    print(f"Updated: {p['updated']}")
    print(f"PDF: {p['pdf_url']}")
    print(f"Abstract preview: {p['abstract'][:100]}...")
EOF
```

## Success Criteria
- ✅ Script runs without errors
- ✅ `arxiv/papers.json` exists
- ✅ JSON is valid (parseable)
- ✅ All 20 papers present (or API limited results)
- ✅ Each paper has: arxiv_id, title, authors, abstract, pdf_url, updated
- ✅ File ends with newline
- ✅ Keys are deterministic (should be consistent across runs)

## Troubleshooting
- **"Connection refused"**: arXiv API might be temporarily down. Try again in 1 minute.
- **"Permission denied"**: Ensure `scripts/fetch_arxiv.py` is in correct directory.
- **"No papers returned"**: Check search query in script matches requirements.
