# 🏴‍☠️ 17_DEVELOPMENT_WORKFLOW_RULES — Antigravity Engineering Protocol

This document establishes the permanent development and implementation rules for Antigravity and all contributors to the Pirate-Civ codebase.

---

## 1. Scope Discipline
* **Milestone Isolation:** Implement ONLY the requested milestone. Never implement future phases or milestones early.
* **Feature Boundaries:** Do not modify unrelated features, routes, views, or configurations.
* **No Unsolicited Refactoring:** Never refactor or clean up unrelated code "while you are there."

---

## 2. Minimal-Code Principle (Ponytail Principle)
* **Smallest Correct Change:** If a task can be accomplished in 10 simple lines, do not turn it into 50 lines, 3 helper classes, and 2 abstractions.
* **No Speculative Abstractions:** Do not build configuration frameworks, utility layers, or factory functions for hypothetical future use cases.
* **Native & Standard First:** Prefer standard language features and existing dependencies over adding new packages.
* **DRY with Discretion:** Avoid duplicating business logic, but prefer a clear single-line duplicate over an over-engineered abstraction.

---

## 3. Existing-Code Preservation
* **Modify, Don't Replace:** Never blindly overwrite a file. Read the current implementation, understand its exact role, and make targeted modifications.
* **Preserve Working Behavior:** All existing authentication, routing, and styling behaviors must continue functioning unless explicitly slated for deprecation by the milestone.
* **Zero Renaming:** Do not rename working variables, functions, routes, or models unless required by the milestone specification.

---

## 4. Operating Loops & Methodologies

### 4.1 Ralph Loop Protocol
Every implementation iteration follows this strict progression:
1. **Inspect:** Examine current code, database schemas, and documentation.
2. **Plan:** Identify the minimal necessary diff.
3. **Implement:** Write minimal, focused, readable code.
4. **Test:** Validate with automated scripts or live runtime execution.
5. **Review:** Inspect `git diff` character-by-character.
6. **Fix:** Remediate any discrepancy or unexpected regression.
7. **Document:** Update status, changelog, and active memory.
8. **Commit:** Commit atomically with conventional commit messages.
9. **Push:** Push to the remote branch.
10. **Verify:** Re-verify milestone acceptance criteria before concluding.

### 4.2 Get Shit Done (GSD)
* Prioritize functional, working software over analysis paralysis or architecture debates.
* Deliver small, verifiable increments that produce immediate feedback.
* Maintain persistent state so no context is lost between sessions.

---

## 5. Git Discipline & Cleanliness
* **Atomic Commits:** Commit only the files directly required by the completed iteration.
* **No Garbage in Commits:** Never commit temporary scratch files, debug artifacts, `.env` secrets, or generated junk.
* **Immediate Push:** Push every completed milestone to the active branch; verify the push succeeded before exiting.

---

## 6. Testing & Empirical Validation
* **Proof Required:** Never claim completion without empirical proof (test scripts, HTTP responses, or database query results).
* **Dual Verification:** Verify both the new functionality AND that legacy behavior remains unbroken.

---

## 7. Documentation Synchronization
* Documentation is an active deliverable. Keep `01_PROJECT_STATUS.md`, `15_CHANGELOG.md`, and `16_CURRENT_TASK.md` strictly synchronized with codebase reality.

---

These rules apply to all future Pirate-Civ development unless explicitly overridden by the project owner.
