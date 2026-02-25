const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function initOne(root: HTMLElement) {
  if (root.dataset.workStoryInit === "1") return;
  root.dataset.workStoryInit = "1";

  const steps = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"));
  const scrollEl = root.querySelector(".workStory__scroll") as HTMLElement | null;
    if (!scrollEl) return;

    const scroll = scrollEl;

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

  // 1) Reseteo total (para que no se pisen y no queden visibles)
  steps.forEach((step) => step.classList.remove("isActive", "isPast"));

  // 2) Activo SOLO el actual
  const active = steps[iActive];
  if (active) active.classList.add("isActive");

  // (opcional) si quiero un “ghost” del anterior:
  // if (iActive > 0) steps[iActive - 1]?.classList.add("isPast");

  // 3) Intensidad “se ilumina mientras se lee”
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
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

export function initWorkStory() {
  document.querySelectorAll<HTMLElement>("[data-work-story]").forEach(initOne);
}

// aseguro que corre después de que existe el DOM
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initWorkStory, { once: true });
}