# Agent: Publisher (Git Commit & Push)

**Purpose**: Manages repository state via Git. Commits generated files and syncs with remote, with safety checks to prevent empty commits.

**Responsibilities**:
1. Check if `/arxiv/papers.json` has changed (via `git diff --quiet`)
2. If changed: stage file, commit with bot identity, push to remote
3. If unchanged: skip commit (no-op, return status)
4. Consult `../skills/git-commit/SKILL.md` for exact commit message formatting

**Execution Steps**:
- Step 1: Run `git diff --quiet arxiv/papers.json` to check for changes
- Step 2a (if changed): `git add arxiv/papers.json`
- Step 2b: `git commit -m "chore: update arXiv papers feed" --trailers`
- Step 2c: `git push origin main`
- Step 3 (if unchanged): Return "No changes, skipping commit"

**Output**: "Committed and pushed" or "No changes to commit" message.

**Note**: Called by `.github/workflows/update-arxiv.yml` with `GITHUB_TOKEN`.
