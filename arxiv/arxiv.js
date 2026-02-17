/**
 * arXiv Feed Renderer
 * Loads papers.json and renders a grid of paper cards with expandable abstracts.
 */

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function escapeAttr(text) {
  return text.replace(/"/g, '&quot;');
}

function formatDate(isoString) {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return isoString;
  }
}

function renderPaper(paper) {
  const titleHtml = escapeHtml(paper.title || 'Untitled');
  const authorsHtml = escapeHtml((paper.authors || []).join(', '));
  const abstractHtml = escapeHtml(paper.abstract || 'No abstract available');
  const dateHtml = escapeHtml(formatDate(paper.updated || ''));
  const pdfUrl = escapeAttr(paper.pdf_url || '#');

  return `
    <div class="paper-card">
      <h3><a href="${pdfUrl}" target="_blank" rel="noopener noreferrer">${titleHtml}</a></h3>
      <p class="authors">${authorsHtml}</p>
      <p class="date">${dateHtml}</p>
      <details>
        <summary>Abstract</summary>
        <p class="abstract">${abstractHtml}</p>
      </details>
      <a class="pdf-link" href="${pdfUrl}" target="_blank" rel="noopener noreferrer">📄 View PDF</a>
    </div>
  `;
}

function renderPapers(papers) {
  const container = document.getElementById('papers-container');
  if (!papers || papers.length === 0) {
    container.innerHTML = '<div class="error">No papers found.</div>';
    return;
  }

  const html = papers.map(renderPaper).join('');
  container.innerHTML = html;
}

function displayError(message) {
  const container = document.getElementById('papers-container');
  container.innerHTML = `<div class="error">Error loading papers: ${escapeHtml(message)}</div>`;
}

function displayUpdateTime(timestamp) {
  const element = document.getElementById('update-time');
  if (!element || !timestamp) return;

  try {
    const date = new Date(timestamp);
    const localTime = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
    element.textContent = `Updated: ${localTime}`;
  } catch {
    element.textContent = `Updated: ${timestamp}`;
  }
}

// Main execution
document.addEventListener('DOMContentLoaded', () => {
  fetch('./papers.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format');
      }

      const papers = data.papers || [];
      const timestamp = data.metadata?.fetch_timestamp;

      if (!Array.isArray(papers)) {
        throw new Error('Papers data is not an array');
      }

      renderPapers(papers);
      displayUpdateTime(timestamp);
    })
    .catch(error => {
      console.error('Failed to load papers:', error);
      displayError(error.message);
    });
});
