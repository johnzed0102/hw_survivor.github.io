# Prompt: Wire GitHub Actions Workflow and Validate

**Goal**: Set up the `.github/workflows/update-arxiv.yml` workflow, verify syntax, and test the diff-gated commit logic locally.

## Steps to Execute

### 1. Verify Workflow File Exists
```bash
test -f .github/workflows/update-arxiv.yml && echo "✓ Workflow file exists" || echo "✗ Workflow file missing"
```

### 2. Validate YAML Syntax
```bash
python3 << 'EOF'
import yaml
import sys
try:
    with open('.github/workflows/update-arxiv.yml', 'r') as f:
        yaml.safe_load(f)
    print("✓ YAML syntax valid")
except Exception as e:
    print(f"✗ YAML error: {e}")
    sys.exit(1)
EOF
```

### 3. Check Workflow Structure
```bash
python3 << 'EOF'
import yaml
with open('.github/workflows/update-arxiv.yml', 'r') as f:
    workflow = yaml.safe_load(f)

required_keys = ['name', 'on', 'jobs']
for key in required_keys:
    if key in workflow:
        print(f"✓ Has '{key}'")
    else:
        print(f"✗ Missing '{key}'")

# Check triggers
triggers = workflow.get('on', {})
if 'schedule' in triggers:
    print("✓ Schedule trigger present")
if 'workflow_dispatch' in triggers:
    print("✓ Manual dispatch trigger present")

# Check jobs
jobs = workflow.get('jobs', {})
if 'update-arxiv' in jobs:
    print("✓ 'update-arxiv' job found")
EOF
```

### 4. Test Diff-Gated Commit Logic Locally

First, understand the pattern. Make a test change:
```bash
cd /Users/john/Desktop/BST236/hw_survivor.github.io

# Check if papers.json exists
if [ ! -f arxiv/papers.json ]; then
  echo "Run fetch-arxiv.prompt.md first to generate papers.json"
  exit 1
fi

# Test: no changes should skip commit
echo "=== Test 1: No changes ==="
git diff --quiet arxiv/papers.json && echo "✓ No changes detected (git diff returned 0)" || echo "✗ Changes detected"

# Test: make a change and verify detection
echo "=== Test 2: Make a change ==="
cp arxiv/papers.json arxiv/papers.json.backup
echo " " >> arxiv/papers.json  # Add whitespace
git diff --quiet arxiv/papers.json && echo "✗ Change not detected" || echo "✓ Change detected (git diff returned 1)"

# Restore
mv arxiv/papers.json.backup arxiv/papers.json
echo "=== Test 3: Verify restored (no changes) ==="
git diff --quiet arxiv/papers.json && echo "✓ Restored, no changes" || echo "✗ Still showing changes"
```

### 5. Verify Python Script Path
```bash
test -f scripts/fetch_arxiv.py && echo "✓ Fetch script exists" || echo "✗ Fetch script missing"
python3 scripts/fetch_arxiv.py --help 2>/dev/null || echo "(Script doesn't support --help, which is OK)"
```

### 6. Inspect Workflow Steps
```bash
cat .github/workflows/update-arxiv.yml | head -40
```

You should see:
- `schedule` with cron `0 0 * * *` (nightly at 00:00 UTC)
- `workflow_dispatch` for manual trigger
- `run: python scripts/fetch_arxiv.py`
- `git diff --quiet` check
- Conditional commit/push if changes exist

## Success Criteria
- ✅ Workflow file `.github/workflows/update-arxiv.yml` exists
- ✅ YAML syntax is valid (parses without errors)
- ✅ Has `schedule` trigger (00:00 UTC daily)
- ✅ Has `workflow_dispatch` trigger
- ✅ Contains step: `python scripts/fetch_arxiv.py`
- ✅ Contains step: `git diff --quiet arxiv/papers.json`
- ✅ Conditional commit/push only if changes exist
- ✅ Fetch script exists at `scripts/fetch_arxiv.py`

## Troubleshooting
- **"Workflow file missing"**: Ensure `.github/workflows/update-arxiv.yml` created in Phase 4.
- **YAML parse errors**: Check indentation (spaces, not tabs). YAML is whitespace-sensitive.
- **Cron syntax wrong**: Should be `0 0 * * *` for daily at midnight UTC.
- **Python path wrong**: Script must be at `scripts/fetch_arxiv.py` relative to repo root.

## Next Step
Once workflow validates, commit all files and push to GitHub. Actions will execute on schedule or manual trigger.
