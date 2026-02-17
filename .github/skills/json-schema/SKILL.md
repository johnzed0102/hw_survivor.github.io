# Skill: JSON Schema for Papers

**Objective**: Define the canonical JSON schema for arXiv papers and implement validation.

## Paper Object Schema
```json
{
  "arxiv_id": "string (e.g., '2302.12345')",
  "title": "string (whitespace collapsed)",
  "authors": ["string", "..."],
  "abstract": "string (whitespace collapsed)",
  "pdf_url": "string (full URL starting with http)",
  "updated": "string (ISO 8601, e.g., '2023-02-23T18:15:22Z')",
  "submitted_date": "string (ISO 8601 if available, else null)"
}
```

## Root Object Schema
```json
{
  "metadata": {
    "fetch_timestamp": "string (ISO 8601 when papers.json was generated)",
    "total_papers": "integer (number of entries)"
  },
  "papers": [
    { ... paper objects ... }
  ]
}
```

## File Format Requirements
- **Encoding**: UTF-8
- **Trailing newline**: REQUIRED (Unix convention)
- **Key ordering**: Sorted alphabetically within each object (for determinism)
- **Indentation**: 2 spaces (not tabs)
- **No trailing commas**: Strict JSON

## Validation Checklist
- [ ] File ends with newline character
- [ ] All required fields present in each paper
- [ ] `pdf_url` is a valid http/https URL
- [ ] `authors` is a non-empty list
- [ ] `arxiv_id` matches pattern `\d{4}\.\d{4,5}`
- [ ] `updated` is ISO 8601 format
- [ ] Keys are sorted alphabetically

## Python Validation Helper
```python
import json
import re

def validate_papers_json(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check trailing newline
    if not content.endswith('\n'):
        raise ValueError("Missing trailing newline")
    
    data = json.loads(content)
    
    # Validate structure
    assert isinstance(data, dict), "Root must be object"
    assert 'papers' in data and isinstance(data['papers'], list)
    
    for paper in data['papers']:
        required = ['arxiv_id', 'title', 'authors', 'abstract', 'pdf_url', 'updated']
        for field in required:
            assert field in paper, f"Missing {field}"
        
        assert isinstance(paper['authors'], list) and len(paper['authors']) > 0
        assert re.match(r'^\d{4}\.\d{4,5}', paper['arxiv_id'])
        assert paper['pdf_url'].startswith('http')
    
    return True
```
