# Skill: Git Commit & Push Pattern

**Objective**: Understand and implement safe Git operations for automated workflows with diff-gated commits.

## Core Pattern: Diff-Gated Commit
Don't commit if nothing changed. This prevents:
- Empty commits cluttering history
- Triggering CI unnecessarily
- Wasting GitHub Actions minutes

```bash
# 1. Check if file has changes
git diff --quiet arxiv/papers.json
if [ $? -eq 0 ]; then
  echo "No changes, skipping commit"
  exit 0
fi

# 2. If changes exist, stage + commit + push
git add arxiv/papers.json
git config user.name "GitHub Actions Bot"
git config user.email "actions@github.com"
git commit -m "chore: update arXiv papers feed"
git push origin main
```

## Commit Message Format
```
chore: update arXiv papers feed

- Fetched latest 20 papers from arXiv (cs.AI, cs.CL, cs.LG)
- Updated /arxiv/papers.json with new results
- Triggered by nightly GitHub Actions workflow
```

## Trailer Requirements (Course-Specific)
All commits must include:
```
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

Add via:
```bash
git commit -m "chore: update arXiv papers feed" --trailer "Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

Or append manually:
```bash
git commit -m "chore: update arXiv papers feed

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

## Best Practices for Automation
- Always configure `user.name` and `user.email` before commit
- Use bot identity (e.g., "GitHub Actions Bot")
- Include `[skip ci]` in commit message if workflow might trigger recursion
- Verify `git push` succeeds before considering task complete
- Exit non-zero on any git command failure

## Testing Locally
```bash
# Verify workflow can push (requires write access)
git config user.name "Test Bot"
git config user.email "test@example.com"

# Make a test commit (on a branch, not main!)
git checkout -b test-commit
git add .
git commit -m "test: this is a test [skip ci]"
git push origin test-commit

# Clean up
git checkout main
git branch -D test-commit
git push origin --delete test-commit
```

## GitHub Actions Integration
When running in workflow context:
- `GITHUB_TOKEN` is pre-authenticated
- Default credentials work without extra setup
- Workflow bot identity is "GitHub Actions Bot" <actions@github.com>
- Branches are checked out at workflow SHA
