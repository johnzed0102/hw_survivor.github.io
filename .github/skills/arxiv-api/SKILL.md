# Skill: arXiv API Integration

**Objective**: Understand and implement arXiv Atom feed API integration for fetching computer science papers.

## API Endpoint
```
https://export.arxiv.org/api/query?
  search_query=(cat:cs.AI OR cat:cs.CL OR cat:cs.LG) 
              AND (all:"table" OR all:"structured data" OR all:"time series" OR all:"forecasting")
  &sortBy=submittedDate
  &sortOrder=descending
  &max_results=20
  &start=0
```

## Response Format (Atom XML)
- Each paper is an `<entry>` element
- Key fields:
  - `<title>` — paper title (may have newlines, should be collapsed)
  - `<author><name>` — author names (multiple elements, list them)
  - `<summary>` — abstract (may have newlines, should be collapsed)
  - `<link rel="related" type="application/pdf" href="..." />` — PDF link (preferred)
  - Fallback: `<id>` contains arXiv ID (e.g., `http://arxiv.org/abs/2302.12345v1` → extract `2302.12345`)
  - `<updated>` — publication date (ISO 8601 format)

## Implementation Notes
- Use Python `urllib.request` to fetch (no external dependencies)
- Use `xml.etree.ElementTree` to parse XML
- Collapse whitespace in title/abstract (split on `\s+`, rejoin with single space, strip)
- Handle missing PDF links gracefully (generate from ID)
- If API unreachable or times out, raise exception with descriptive message
- Request timeout: 10 seconds

## Error Handling
- Network timeout → "API request timed out after 10s"
- Non-200 response → "arXiv API returned {status_code}"
- Parse error → "Failed to parse XML response: {detail}"

## Testing
```bash
# Quick sanity check:
python3 -c "
import urllib.request
url = 'https://export.arxiv.org/api/query?search_query=(cat:cs.AI)&max_results=1&start=0'
with urllib.request.urlopen(url, timeout=10) as r:
    print('Status:', r.status)
"
```
