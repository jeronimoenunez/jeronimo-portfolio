import { useHeroHorizontalScroll } from "../../../scripts/scroll/useHeroHorizontalScroll";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

function getProgress(scrollArea: HTMLElement) {
  const rect = scrollArea.getBoundingClientRect();
  const total = scrollArea.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  return clamp01((-rect.top) / total);
}

function main() {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;

  const scrollArea = root.querySelector<HTMLElement>("[data-scroll-area]");
  const textLayer = root.querySelector<HTMLElement>("[data-text-layer]");
  const overlay = root.querySelector<HTMLElement>("[data-overlay]");
  const videoWrap = root.querySelector<HTMLElement>("[data-video-wrap]");
  const grid = root.querySelector<HTMLElement>("[data-grid]");
  const videoSlot = root.querySelector<HTMLElement>("[data-video-slot]");

  if (!scrollArea || !textLayer || !videoWrap || !grid || !videoSlot) return;

  // 1) Scrub del video (tu hook). No lo toques: funciona bien.
  useHeroHorizontalScroll(root);

  let raf: number | null = null;

  const apply = () => {
    raf = null;

    const p = getProgress(scrollArea);

    /**
     * Tenemos 4 panels (0..3) dentro del sticky.
     * En vez de scroll real, los “movemos” nosotros.
     * Mapeo: 0..1 => 0..3 (3 pantallas de movimiento)
     */
    const panels = 4;
    const yVh = -p * (panels - 1) * 100; // 0 => 0vh, 1 => -300vh
    textLayer.style.transform = `translate3d(0, ${yVh}vh, 0)`;

    // Overlay por acto (similar a lo que ya tenías)
    if (overlay) {
      let target = 0.52;
      if (p < 0.25) target = 0.50;      // hero
      else if (p < 0.50) target = 0.56; // acto1
      else if (p < 0.75) target = 0.64; // acto2
      else target = 0.70;              // acto3
      overlay.style.opacity = String(target);
    }

    /**
     * GRID reveal + “encastre” del video al slot:
     * 0.00-0.78 normal
     * 0.78-1.00: aparece grid y el video se reduce/centra al slot
     */
    const gridStart = 0.78;
    const tGrid = clamp01((p - gridStart) / (1 - gridStart));
    const t = easeOutCubic(tGrid);

    grid.style.opacity = String(t);
    grid.style.transform = `translate3d(0, ${lerp(12, 0, t)}px, 0)`;

    // Encajar videoWrap en el slot (translate + scale)
    const stageRect = root.querySelector<HTMLElement>("[data-sticky]")?.getBoundingClientRect();
    const slotRect = videoSlot.getBoundingClientRect();
    if (!stageRect) return;

    const stageW = stageRect.width;
    const stageH = stageRect.height;

    const slotW = slotRect.width;
    const slotH = slotRect.height;

    const stageCx = stageRect.left + stageW / 2;
    const stageCy = stageRect.top + stageH / 2;

    const slotCx = slotRect.left + slotW / 2;
    const slotCy = slotRect.top + slotH / 2;

    const dx = slotCx - stageCx;
    const dy = slotCy - stageCy;

    const scaleX = slotW / stageW;
    const scaleY = slotH / stageH;
    const sTarget = Math.min(scaleX, scaleY);

    const x = lerp(0, dx, t);
    const y = lerp(0, dy, t);
    const s = lerp(1, sTarget, t);
    const r = lerp(0, 18, t);

    videoWrap.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${s})`;
    videoWrap.style.borderRadius = `${r}px`;
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