## ADR-001: Flatten Astro project structure
**Decision:** Move Astro project files to repository root.
**Why:** Avoid nested project structure; simplify tooling and deployment.
**Trade-off:** Manual file move required.
**Status:** Accepted

## ADR-002: Move dotfiles using relative paths
**Decision:** Move hidden files using relative paths from inside directory.
**Why:** Glob patterns depend on current working directory.
**Trade-off:** Requires awareness of shell behavior.
**Status:** Accepted

## ADR-003: Horizontal narrative driven by vertical scroll
**Decision:** Use vertical scroll as input to drive horizontal translation.
**Why:** Preserves native scroll behavior, accessibility, and performance.
**Trade-off:** Requires scroll math and layout planning.
**Status:** Accepted

