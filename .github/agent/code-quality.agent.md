# Agent: Code Quality Validator

**Purpose**: Validates Python scripts, JSON schema compliance, and frontend code for correctness and adherence to course patterns.

**Responsibilities**:
1. Check Python syntax of `scripts/fetch_arxiv.py`
2. Validate generated `/arxiv/papers.json` against schema
3. Verify JSON determinism (sorted keys, UTF-8, newline at EOF)
4. Check HTML/JS for accessibility and vanilla (non-framework) compliance
5. Ensure no hardcoded secrets or insecure patterns

**Execution Steps**:
- Step 1: Run `python3 -m py_compile scripts/fetch_arxiv.py`
- Step 2: Load papers.json and validate all required fields per entry
- Step 3: Check file encoding and trailing newline
- Step 4: Inspect HTML for framework artifacts (React, Vue, etc.)
- Step 5: Report findings with pass/fail verdict

**Output**: Quality report with issues or "All checks passed" confirmation.
