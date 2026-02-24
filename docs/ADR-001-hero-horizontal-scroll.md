# ADR-001 — Hero Horizontal Scroll

## Status
Accepted

## Context
The homepage hero requires a high-impact narrative interaction combining:
- Large horizontal typography
- Progressive reveal into a background video
- Native vertical scroll preservation
- Accessibility and performance guarantees

The solution must avoid scroll hijacking, remain framework-agnostic, and degrade gracefully.

## Decision
Implement a **vertical-scroll-driven horizontal translation** using:
- A sticky container
- Scroll progress normalized via `getBoundingClientRect`
- Three explicit phases (A, B, C)
- A reusable client-side hook (`useHeroHorizontalScroll`)

Motion is disabled when `prefers-reduced-motion` is enabled.

## Phases
### Phase A (0 → 0.70)
Horizontal scroll of typographic track.

### Phase B (0.70 → 0.85)
Mask-based transition:
- Typography collapses from center
- Video fades in progressively

### Phase C (≥ 0.85)
Final state:
- Video fully visible
- Typography removed from interaction layer
- Native scroll resumes

## Accessibility
- Respects `prefers-reduced-motion`
- No scroll hijacking
- Pointer events disabled when layers are visually removed

## Performance
- `requestAnimationFrame` throttling
- Lazy video loading
- No layout reflow during animation
- GPU-accelerated transforms only

## Consequences
- Slightly more JS logic
- Clear separation of concerns
- Interaction is reusable and testable
