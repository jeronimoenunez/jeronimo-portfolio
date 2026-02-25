export type Motion = {
  id: string;
  from: { x: number; y: number; s: number; o?: number };
  to: { x: number; y: number; s: number; o?: number };
  at: { start: number; end: number };
  depth?: number;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const FEATURE_ID = "w2";

// takeover “después de 2 o 3 scrolls”
const TAKEOVER_START = 0.72;
const TAKEOVER_END = 1.0;

// scatter (fase A) siempre thumbnails
const SCATTER_SCALE = 0.52; 
const SCATTER_STRONG_OPACITY = 1.0;
const SCATTER_SOFT_OPACITY = 0.22;

const TELHA_LAYOUT: Array<{ x: number; y: number; o: number; s?: number }> = [
  { x: 10, y: 38, o: 1.0, s: 0.60 },
  { x: 26, y: 60, o: 0.30, s: 0.52 },
  { x: 50, y: 22, o: 0.26, s: 0.50 },
  { x: 80, y: 18, o: 1.0, s: 0.60 },

  { x: 92, y: 40, o: 0.18, s: 0.48 },
  { x: 14, y: 86, o: 0.24, s: 0.48 },
  { x: 52, y: 88, o: 1.0, s: 0.60 },
  { x: 86, y: 84, o: 1.0, s: 0.60 },

  { x: 36, y: 44, o: 0.22, s: 0.46 },
  { x: 64, y: 40, o: 0.22, s: 0.46 },
  { x: 40, y: 70, o: 0.20, s: 0.46 },
  { x: 70, y: 66, o: 0.20, s: 0.46 },
];

function initOne(root: HTMLElement) {
  if (root.dataset.wsInit === "1") return;
  root.dataset.wsInit = "1";

  const scroll = root.querySelector<HTMLElement>(".workScatter__scroll");
  const tiles = Array.from(root.querySelectorAll<HTMLAnchorElement>("[data-work-tile]"));

  let ticking = false;

  function computeProgress(): number {
    if (!scroll) return 0;
    const r = scroll.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const total = r.height - vh;
    const p = total <= 1 ? 1 : -r.top / total;
    return clamp01(p);
  }

  function getCoverScale(el: HTMLElement): number {
    const baseW = el.offsetWidth || 1;
    const baseH = el.offsetHeight || 1;
    const sx = window.innerWidth / baseW;
    const sy = window.innerHeight / baseH;
    return Math.max(sx, sy) * 1.02;
  }

  function render(): void {
    ticking = false;
    const p = computeProgress();

    const takeoverT = clamp01((p - TAKEOVER_START) / (TAKEOVER_END - TAKEOVER_START));
    
    const takeoverEase = easeOut(takeoverT);

    const header = root.querySelector<HTMLElement>(".workScatter__header");
    const black = root.querySelector<HTMLElement>("[data-black]");

    // All Work desaparece cuando empieza el takeover
    if (header) {
      // empieza a irse un poquito antes para que se sienta suave
      const headerFade = clamp01((p - (TAKEOVER_START - 0.06)) / 0.10);
      header.style.opacity = String(lerp(1, 0, easeOut(headerFade)));
      header.style.transform = `translate3d(0, ${lerp(0, -10, easeOut(headerFade))}px, 0)`;
    }

    // fondo negro aparece durante takeover (imagen -> negro)
    if (black) {
      // 0 al inicio, 1 al final
      black.style.opacity = String(lerp(0, 1, takeoverEase));
    }

    const titleEl = root.querySelector<HTMLElement>(".workScatter__title");
    if (titleEl) {
      const fade = clamp01((p - (TAKEOVER_START - 0.18)) / 0.18);
      titleEl.style.opacity = String(lerp(1, 0.15, fade));
    }

    // ===== FASE A =====
    if (p < TAKEOVER_START) {
      for (let i = 0; i < tiles.length; i++) {
        const el = tiles[i];
        const id = el.getAttribute("data-id") || "";

        const slot = TELHA_LAYOUT[i % TELHA_LAYOUT.length];

        // micro drift suave para “vida” 
        // drift más notorio pero elegante
        const drift = (p - 0.35) * 12;
        const x = slot.x + drift * (0.22 + (i % 3) * 0.04);
        const y = slot.y + drift * (0.16 + (i % 4) * 0.03);

        // reveal progresivo por índice (como “van entrando”)
        const reveal = clamp01((p - 0.05 - i * 0.015) / 0.18);

        const s = (slot.s ?? SCATTER_SCALE) * lerp(0.96, 1.02, reveal);
        const oBase = slot.o ?? SCATTER_SOFT_OPACITY;
        const o = lerp(0, oBase, reveal);

        el.style.opacity = String(o);
        el.style.transform = `translate3d(${x}vw, ${y}vh, 0) translate(-50%, -50%) scale(${s})`;
        el.style.zIndex = String(slot.o >= 0.9 ? 8 : 2);
        el.style.pointerEvents = "";
      }
      return;
    }

    // ===== FASE B: TAKEOVER (solo FEATURE_ID maximiza) =====
    for (let i = 0; i < tiles.length; i++) {
      const el = tiles[i];
      const id = el.getAttribute("data-id") || "";

      const slot = TELHA_LAYOUT[i % TELHA_LAYOUT.length];
      let x = slot.x;
      let y = slot.y;
      let s = slot.s ?? SCATTER_SCALE;
      let o = slot.o ?? SCATTER_SOFT_OPACITY;

      if (id === FEATURE_ID) {
        const img = el.querySelector("img");
          if (!img || !(img as HTMLImageElement).currentSrc) {
          // si no cargó la imagen, no hacemos takeover (evita “bloque raro”)
          continue;
        }
        const cover = getCoverScale(el);

        x = lerp(x, 50, takeoverEase);
        y = lerp(y, 50, takeoverEase);
        s = lerp(s, cover, takeoverEase);
        o = lerp(SCATTER_STRONG_OPACITY, 1, takeoverEase);

        el.style.zIndex = "999";
        el.style.pointerEvents = "auto";
      } else {
        o = lerp(o, 0.18, takeoverEase);
        s = lerp(s, s * 0.98, takeoverEase);

        el.style.zIndex = "2";
        el.style.pointerEvents = "none";
      }

      el.style.opacity = String(o);
      el.style.transform = `translate3d(${x}vw, ${y}vh, 0) translate(-50%, -50%) scale(${s})`;
    }
  }

  function onScroll(): void {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(render);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

export function initWorkScatter() {
  const roots = Array.from(document.querySelectorAll<HTMLElement>("[data-work-scatter]"));
  roots.forEach(initOne);
}

if (typeof window !== "undefined") initWorkScatter();