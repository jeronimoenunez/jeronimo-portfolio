# Portfolio – Frontend Architecture Intent

Goal:
Build a minimal but expressive portfolio that demonstrates:
- Frontend architectural thinking
- Motion-driven UX
- Performance-aware decisions
- Scalability (not visual noise)

Audience:
- Tech leads
- Frontend architects
- Product / innovation teams
- Blockchain / fintech / real estate companies

Non-goals:
- No CMS
- No over-engineering
- No unnecessary JS

HeroScroll behavior:
- Occupies 100vh
- Locks vertical scroll
- Maps scrollY → translateX
- Ends at exact width of content
- On end:
  - unlocks scroll
  - triggers video reveal

# Architectural Decisions (ADR-lite)

## ADR-001: Astro as the core framework
**Decision:** Use Astro for a content-first, performance-first portfolio.
**Why:** Server-rendered by default, partial hydration (islands), minimal JS.
**Trade-off:** React only where needed; more structure than a simple SPA.
**Status:** Accepted

## Rendering Strategy
- Server-rendered by default (Astro)
- No client JS unless a component requires real interaction

## Hydration Strategy
React components are used only for:
- filtering/sorting projects
- interactive timeline or UI state
Not used for static sections.

## Source Structure
The `src/` directory is organized by responsibility:
- UI primitives (no JS)
- Interactive islands (React)
- Sections for composition
- Content and types isolated from rendering
This structure favors scalability and clarity.

## ADR-006: Data-first UI architecture
**Decision:** Define data contracts and content before UI and interaction.
**Why:** Enables scalability, testability, and framework-agnostic design.
**Trade-off:** Slower initial UI iteration.
**Status:** Accepted

### Hero Horizontal Scroll

- Technique: vertical scroll mapped to horizontal translation
- Pattern: sticky container with extended scroll height
- Reasoning: avoids scroll hijacking and preserves native scroll
- Fallback: natural vertical scroll if JS disabled
