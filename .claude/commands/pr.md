---
description: Create a GitHub pull request with a succinct description
---

Create a GitHub pull request for the current branch.

Review the commits since main with `git log main..HEAD --oneline`, then use `gh pr create` with:
- A clear, concise title
- A brief body explaining what was built in simple language
- Use a HEREDOC for the body

Keep it succinct and reviewer-friendly.
