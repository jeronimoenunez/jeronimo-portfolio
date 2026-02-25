// src/scripts/workStory.client.ts
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function initOne(root: HTMLElement) {
  if (root.dataset.workStoryInit === "1") return;
  root.dataset.workStoryInit = "1";

  const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
  const scroll = root.querySelector<HTMLElement>(".workStory__scroll");
  if (!scroll || steps.length === 0) return;

  let ticking = false;

  function computeProgress(): number {
    const r = scroll.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = r.height - vh;
    const p = total <= 1 ? 1 : -r.top / total;
    return clamp01(p);
  }

  function render() {
    ticking = false;

    const p = computeProgress();
    const n = steps.length;
    if (n === 0) return;

    const x = p * n;
    const iActive = Math.min(n - 1, Math.floor(x));
    const localT = clamp01(x - iActive);

    // reset
    steps.forEach((s) => s.classList.remove("isActive", "isPast"));

    const active = steps[iActive];
    if (active) active.classList.add("isActive");

    // color intensity
    steps.forEach((step, i) => {
      const title = step.querySelector<HTMLElement>(".workStep__title");
      const body = step.querySelector<HTMLElement>(".workStep__body");
      if (!title || !body) return;

      let intensity = 0;
      if (i === iActive) intensity = localT;
      else if (i < iActive) intensity = 1;

      const titleAlpha = lerp(0.18, 0.95, intensity);
      const bodyAlpha = lerp(0.28, 0.78, intensity);

      title.style.color = `rgba(255,255,255,${titleAlpha})`;
      body.style.color = `rgba(255,255,255,${bodyAlpha})`;
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function initWorkStory() {
  document.querySelectorAll<HTMLElement>("[data-work-story]").forEach(initOne);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initWorkStory, { once: true });
} else {
  initWorkStory();
}