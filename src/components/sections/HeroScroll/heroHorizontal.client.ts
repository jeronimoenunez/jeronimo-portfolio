import { useHeroHorizontalScroll } from "../../../scripts/scroll/useHeroHorizontalScroll";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function getProgressWithin(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  return clamp01((-rect.top) / total);
}

function main() {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;

  // 1) Hook: controla SOLO el scrub del video
  useHeroHorizontalScroll(root);

  // 2) Este archivo: controla track + overlay
  const track = root.querySelector<HTMLElement>("[data-track]");
  const overlay = root.querySelector<HTMLElement>("[data-overlay]");
  if (!track) return;

  let raf: number | null = null;

  const apply = () => {
    raf = null;

    const p = getProgressWithin(root);

    // 4 panels: 0..-300vw
    const x = -p * 300;
    track.style.transform = `translate3d(${x}vw, 0, 0)`;

    // Overlay por acto
    if (overlay) {
      let target = 0.5;
      if (p < 0.25) target = 0.48;
      else if (p < 0.5) target = 0.54;
      else if (p < 0.75) target = 0.62;
      else target = 0.66;

      overlay.style.opacity = String(target);
    }
  };

  const onScroll = () => {
    if (raf !== null) return;
    raf = requestAnimationFrame(apply);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  apply();
}

main();