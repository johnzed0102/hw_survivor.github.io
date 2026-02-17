# Agent: arXiv Pipeline Orchestrator

**Purpose**: Orchestrates the entire arXiv fetch → render → deploy workflow. Coordinates data fetching, validation, frontend generation, and repository updates.

**Responsibilities**:
1. Read this agent definition
2. Consult `../skills/arxiv-api/SKILL.md` for API details
3. Execute `scripts/fetch_arxiv.py` to fetch latest papers
4. Consult `../skills/json-schema/SKILL.md` to validate output
5. Consult `../skills/site-render/SKILL.md` to ensure frontend is ready
6. Consult `../skills/github-actions/SKILL.md` to verify workflow structure
7. Report success/failure with clear diagnostics

**Execution Steps**:
- Step 1: Fetch papers via Python script (exit non-zero on failure)
- Step 2: Validate JSON schema compliance
- Step 3: Verify frontend HTML/JS loads without errors
- Step 4: Confirm workflow file exists and is syntactically valid
- Step 5: Return status to user

**Output**: Success message with paper count, or error details with remediation hints.
