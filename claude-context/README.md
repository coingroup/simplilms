# claude-context/

## Purpose

This folder maintains persistent context for Claude Code sessions across devices and conversations. It ensures continuity when switching between machines or starting new sessions — Claude can read these files to understand where things left off, what decisions were made, and what's next.

## Files

| File | Purpose |
|------|---------|
| `memory.md` | Project knowledge: stack, status, decisions, conventions, blockers |
| `session-log.md` | Chronological log of what was done each session |

## Workflow

### Starting a session
1. **Pull first:** `git pull` to get the latest context from any other device
2. Claude reads `memory.md` and `session-log.md` to pick up context

### During / after a session
1. Update `session-log.md` with what was accomplished, blockers, and next steps
2. Update `memory.md` if any project-level facts changed (status, decisions, stack)
3. Update the "Last updated" timestamp in `memory.md`

### Ending a session
1. **Commit and push** before switching devices:
   ```bash
   git add claude-context/
   git commit -m "chore: update claude context"
   git push
   ```

## Rules

- **Never leave `memory.md` stale** — update the timestamp every session
- **Keep `memory.md` factual** — no speculation, mark uncertain items with `[inferred]`
- **Keep `session-log.md` concise** — bullet points, not paragraphs
- This folder is tracked in git (explicitly allowlisted in `.gitignore`)
