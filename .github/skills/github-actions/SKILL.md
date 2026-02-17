# Skill: GitHub Actions Workflow

**Objective**: Understand GitHub Actions YAML syntax and implement nightly arXiv update workflow.

## Workflow Structure
```yaml
name: Update arXiv Feed
on:
  schedule:
    - cron: '0 0 * * *'  # Nightly at 00:00 UTC
  workflow_dispatch:     # Manual trigger via GitHub UI

jobs:
  update-arxiv:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: python scripts/fetch_arxiv.py
      - name: Check for changes
        id: diff
        run: |
          if git diff --quiet arxiv/papers.json; then
            echo "has_changes=false" >> $GITHUB_OUTPUT
          else
            echo "has_changes=true" >> $GITHUB_OUTPUT
          fi
      - name: Commit and push
        if: steps.diff.outputs.has_changes == 'true'
        run: |
          git config user.name "GitHub Actions Bot"
          git config user.email "actions@github.com"
          git add arxiv/papers.json
          git commit -m "chore: update arXiv papers feed [skip ci]"
          git push
```

## Key Concepts
- **`on.schedule.cron`**: Unix cron syntax (min hour day month dow). UTC always.
- **`on.workflow_dispatch`**: Allows manual trigger from GitHub UI
- **`actions/checkout@v4`**: Clone repo with write permissions
- **`actions/setup-python@v4`**: Install Python 3.x
- **`$GITHUB_OUTPUT`**: Set outputs for subsequent steps (GitHub Actions v4+)
- **`git diff --quiet`**: Check for changes without output (exit 0 if no changes)
- **`[skip ci]`** in commit: Prevents recursive workflow triggering

## GitHub Token & Authentication
- `GITHUB_TOKEN` is automatically available in workflow
- No need to add secrets if using default token
- Bot user is "GitHub Actions Bot" <actions@github.com>
- Token has repo write permissions (can push to main)

## Testing Workflow YAML
```bash
# Syntax validation (install actionlint)
brew install actionlint  # macOS
actionlint .github/workflows/update-arxiv.yml

# Or: manually check YAML validity
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/update-arxiv.yml'))"
```

## Troubleshooting
- Workflow not triggering on schedule? Check: is repo public? Are Actions enabled?
- Commit push rejected? Ensure `actions/checkout@v4` with default settings
- Python script fails? Check stderr in "Run python scripts/fetch_arxiv.py" step
- Use `workflow_dispatch` to test without waiting for midnight

## Edge Cases
- If papers haven't changed: no commit (clean, efficient)
- If API unreachable: `fetch_arxiv.py` exits non-zero, workflow fails, retry next day
- Network transients: Consider adding retry logic in Python script
