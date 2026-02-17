#!/usr/bin/env python3
"""
Fetch arXiv papers and generate papers.json for the arXiv feed.

Categories: cs.AI, cs.CL, cs.LG
Keywords: "table" OR "structured data" OR "time series" OR "forecasting"
Max results: 20
Sort: submitted date, descending
"""

import json
import sys
import urllib.request
import urllib.error
import urllib.parse
import xml.etree.ElementTree as ET
import ssl
from datetime import datetime
from pathlib import Path


def fetch_arxiv_papers():
    """Fetch papers from arXiv API and return parsed data."""
    
    # Build query: search in multiple categories and keywords
    # Using simplified query to avoid timeout on complex boolean expressions
    search_terms = [
        'table',
        'structured data',
        'time series',
        'forecasting'
    ]
    
    categories = '(cat:cs.AI OR cat:cs.CL OR cat:cs.LG)'
    
    # Try searching with combined keywords
    keywords = ' OR '.join([f'all:"{term}"' for term in search_terms])
    search_query = f"{categories} AND ({keywords})"
    
    params = {
        'search_query': search_query,
        'sortBy': 'submittedDate',
        'sortOrder': 'descending',
        'max_results': '20',
        'start': '0'
    }
    
    query_string = urllib.parse.urlencode(params)
    url = f"https://export.arxiv.org/api/query?{query_string}"
    
    # Create SSL context (bypass cert verification for local testing)
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    
    try:
        print(f"Fetching from: {url[:80]}...", file=sys.stderr)
        with urllib.request.urlopen(url, timeout=30, context=ctx) as response:
            if response.status != 200:
                raise Exception(f"arXiv API returned {response.status}")
            xml_data = response.read().decode('utf-8')
    except urllib.error.URLError as e:
        raise Exception(f"Network error: {e.reason}")
    except Exception as e:
        raise Exception(f"Failed to fetch arXiv data: {e}")
    
    # Parse XML
    try:
        root = ET.fromstring(xml_data)
    except ET.ParseError as e:
        raise Exception(f"Failed to parse XML response: {e}")
    
    # Define namespace
    ns = {'atom': 'http://www.w3.org/2005/Atom'}
    
    papers = []
    
    for entry in root.findall('atom:entry', ns):
        # Extract fields
        title_elem = entry.find('atom:title', ns)
        title = title_elem.text if title_elem is not None else "Unknown"
        title = ' '.join(title.split())  # Collapse whitespace
        
        # Authors
        authors = []
        for author_elem in entry.findall('atom:author', ns):
            name_elem = author_elem.find('atom:name', ns)
            if name_elem is not None:
                authors.append(name_elem.text)
        
        # Abstract/Summary
        summary_elem = entry.find('atom:summary', ns)
        abstract = summary_elem.text if summary_elem is not None else ""
        abstract = ' '.join(abstract.split())  # Collapse whitespace
        
        # arXiv ID
        id_elem = entry.find('atom:id', ns)
        arxiv_id = ""
        if id_elem is not None:
            # Extract from URL like http://arxiv.org/abs/2302.12345v1
            id_url = id_elem.text
            if '/abs/' in id_url:
                arxiv_id = id_url.split('/abs/')[1]
        
        # PDF URL
        pdf_url = None
        for link_elem in entry.findall('atom:link', ns):
            rel = link_elem.get('rel', '')
            link_type = link_elem.get('type', '')
            if rel == 'related' and link_type == 'application/pdf':
                pdf_url = link_elem.get('href')
                break
        
        # Fallback: generate from arXiv ID
        if not pdf_url and arxiv_id:
            pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
        
        # Updated date
        updated_elem = entry.find('atom:updated', ns)
        updated = updated_elem.text if updated_elem is not None else datetime.utcnow().isoformat() + "Z"
        
        papers.append({
            'abstract': abstract,
            'arxiv_id': arxiv_id,
            'authors': authors,
            'pdf_url': pdf_url or "",
            'title': title,
            'updated': updated,
        })
    
    return papers


def save_papers_json(papers, output_path):
    """Save papers to JSON file with deterministic formatting."""
    
    metadata = {
        'fetch_timestamp': datetime.utcnow().isoformat() + "Z",
        'total_papers': len(papers),
    }
    
    data = {
        'metadata': metadata,
        'papers': papers,
    }
    
    # Write with sorted keys, UTF-8, newline at EOF
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, sort_keys=True, ensure_ascii=False)
        f.write('\n')  # Trailing newline


def main():
    try:
        print("Fetching arXiv papers...")
        print('Query: (cat:cs.AI OR cat:cs.CL OR cat:cs.LG) AND (all:"table" OR all:"structured data" OR all:"time series" OR all:"forecasting")')
        
        papers = fetch_arxiv_papers()
        
        if not papers:
            raise Exception("No papers returned from arXiv API")
        
        print(f"Fetched {len(papers)} papers.")
        
        output_path = Path("arxiv/papers.json")
        save_papers_json(papers, output_path)
        
        print(f"Wrote {output_path}")
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
