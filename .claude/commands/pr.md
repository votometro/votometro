---
description: Create a GitHub pull request with a succinct description
---

Create a GitHub pull request for the current branch.

Review the commits since main with `git log main..HEAD --oneline`, then use `gh pr create` with:
- A title in semantic commit format: `type(scope): description`
  - Types: feat, fix, docs, style, refactor, test, chore
  - Scope is optional but recommended
  - Example: `feat(auth): add OAuth login support`
- A brief body explaining what was built
- Use a HEREDOC for the body

Keep language simple and concise. No filler words.
