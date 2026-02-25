// heroVertical.client.ts
import { useHeroHorizontalScroll } from "../../../scripts/scroll/useHeroHorizontalScroll";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const smoothstep = (t: number) => t * t * (3 - 2 * t);
const easeInOutQuint = (t: number) =>
  t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2;

function getProgress(root: HTMLElement) {
  const rect = root.getBoundingClientRect();
  const scrollable = root.offsetHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return clamp01((-rect.top) / scrollable);
}

/* ---------------- Rect helpers ---------------- */

type Rect = { left: number; top: number; right: number; bottom: number };

function toRect(r: DOMRect | DOMRectReadOnly): Rect {
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}

function rectUnion(a: Rect, b: Rect): Rect {
  return {
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

function rectHeight(r: Rect) {
  return r.bottom - r.top;
}

/* ------------------------------------------------------------------------ */

function main() {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;

  const universe = root.querySelector<HTMLElement>("[data-universe]");
  const copy = root.querySelector<HTMLElement>("[data-copy]");
  const overlay = root.querySelector<HTMLElement>("[data-overlay]");
  const videoSlot = root.querySelector<HTMLElement>("[data-video-slot]");

  if (!universe || !copy || !overlay || !videoSlot) return;

  // Actos (Acto 3 puede estar en el overlay normal o dentro del video)
  const act1El = root.querySelector<HTMLElement>('[data-act="1"]');
  const act2El = root.querySelector<HTMLElement>('[data-act="2"]');

  // Si moviste acto 3 dentro del video: <div data-act3-inside>...</div>
  const act3Inside = root.querySelector<HTMLElement>("[data-act3-inside]");
  // Si acto 3 sigue en el overlay: <div data-act="3">
  const act3El = root.querySelector<HTMLElement>('[data-act="3"]');

  // prioridad: si existe dentro del video, usamos ese
  const act3Target: HTMLElement | null = act3Inside ?? act3El;

  // Botones (solo acto 1)
  const actions = root.querySelector<HTMLElement>("[data-actions]");

  // Celdas
  const r1a = root.querySelector<HTMLElement>(".cell--r1a");
  const r1b = root.querySelector<HTMLElement>(".cell--r1b");

  const r2a = root.querySelector<HTMLElement>(".cell--r2a");
  const r2v = root.querySelector<HTMLElement>(".cell--videoSlot");
  const r2c = root.querySelector<HTMLElement>(".cell--r2c");

  const r3a = root.querySelector<HTMLElement>(".cell--r3a");
  const r3b = root.querySelector<HTMLElement>(".cell--r3b");

  if (!r1a || !r1b || !r2a || !r2v || !r2c || !r3a || !r3b) return;

  /* ---------------- Timeline ---------------- */
  const act1End = 0.18;
  const act2End = 0.64;
  const act3Start = 0.52;

  const OVERSCAN = 1.14;
  const OUT_TOP_PX = -12; // fila 1 debe quedar "fuera"

  /* -------------- Video scrub --------------- */
  const encStart = 0.10;
  const encEnd = 0.38;

  const VIDEO_SPEED = 0.72;

  useHeroHorizontalScroll(root, {
    range: { from: 0.02, to: 0.94 },
    mapProgress: (p) => {
      if (p < encStart) return 0.35 * smoothstep(p / encStart);
      if (p < encEnd) {
        const t = easeInOutQuint((p - encStart) / (encEnd - encStart));
        return 0.35 + (0.75 - 0.35) * t;
      }
      return 0.75 + (1 - 0.75) * smoothstep((p - encEnd) / (1 - encEnd));
    },
  });

  /* -------------- Measurements -------------- */
  let slotRect: DOMRect | null = null;

  // Acto 3 framing
  let scaleFinal = 1;
  let tyFinal = 0;

  const measure = () => {
    const prev = universe.style.transform;
    const prevOrigin = universe.style.transformOrigin;

    universe.style.transformOrigin = "50% 50%";
    universe.style.transform = "none";

    slotRect = videoSlot.getBoundingClientRect();

    const row1 = rectUnion(
      toRect(r1a.getBoundingClientRect()),
      toRect(r1b.getBoundingClientRect())
    );

    const row2 = rectUnion(
      rectUnion(toRect(r2a.getBoundingClientRect()), toRect(r2v.getBoundingClientRect())),
      toRect(r2c.getBoundingClientRect())
    );

    const row3 = rectUnion(
      toRect(r3a.getBoundingClientRect()),
      toRect(r3b.getBoundingClientRect())
    );

    const row23 = rectUnion(row2, row3);
    const vh = window.innerHeight;

    // A) fill: row2+row3 = 100vh
    const sFill = vh / rectHeight(row23);

    // B) hide: row1 queda fuera (origin bottom en acto 3)
    const denom = Math.max(1, row23.bottom - row1.bottom);
    const sHide = (vh - OUT_TOP_PX) / denom;

    scaleFinal = Math.max(1, sFill, sHide);

    // ty para pegar bottom de row23 al bottom del viewport con origin bottom
    tyFinal = Math.round(-(row23.bottom - vh) * scaleFinal);

    universe.style.transform = prev;
    universe.style.transformOrigin = prevOrigin;
  };

  measure();

  let raf: number | null = null;

  // helper: set acto (solo opacity/translate; no toca tu scroll)
  const setAct = (el: HTMLElement | null, alpha: number) => {
    if (!el) return;
    const a = clamp01(alpha);
    el.style.opacity = String(a);
    el.style.transform = `translate3d(0, ${lerp(14, 0, a)}px, 0)`;
    el.style.pointerEvents = a > 0.6 ? "auto" : "none";
  };

  const apply = () => {
    raf = null;
    if (!slotRect) measure();

    const p = getProgress(root);

    const t2 = easeInOutQuint(
      smoothstep(clamp01((p - act1End) / (act2End - act1End)))
    );

    const t3raw = clamp01((p - act3Start) / (1 - act3Start));
    const t3 = easeInOutQuint(smoothstep(t3raw));

    // ✅ UN SOLO hasActs
    const hasActs = !!(act1El || act2El || act3Target);

    /* -------- COPY --------
       Si NO hay actos: aplicamos tu fade original al contenedor.
       Si hay actos: mantenemos contenedor visible y fadeamos solo los actos.
    */
    if (!hasActs) {
      const copyFade =
        1 - smoothstep(clamp01((p - act1End * 0.55) / (act1End * 0.65)));
      copy.style.opacity = String(copyFade);
      copy.style.transform = `translate3d(0, ${lerp(0, -10, 1 - copyFade)}px, 0)`;
    } else {
      copy.style.opacity = "1";
      copy.style.transform = "translate3d(0,0,0)";
    }

    /* -------- ACTOS 1/2/3 -------- */
    if (hasActs) {
      // 1 -> 2 rápido
      const a1 =
        1 - smoothstep(clamp01((p - (act1End * 0.55)) / (act1End * 0.45)));

      const a2In = smoothstep(clamp01((p - (act1End * 0.50)) / 0.08));

      // 2 -> 3 rápido (más seguido)
      const act3InAt = act3Start + 0.0;
      const act3InDur = 0.045;

      // 3 se desvanece antes del final para dejar mosaico limpio
      const act3OutAt = 0.80;
      const act3OutDur = 0.06;

      const a3In = smoothstep(clamp01((p - act3InAt) / act3InDur));
      const a3Out = 1 - smoothstep(clamp01((p - act3OutAt) / act3OutDur));
      const a3 = a3In * a3Out;

      // Acto 2 sale apenas empieza 3
      const act2OutAt = act3Start - 0.12;
      const act2OutDur = 0.04;

      const a2Out =
        1 - smoothstep(clamp01((p - act2OutAt) / act2OutDur));

      const a2 = a2In * a2Out;

      setAct(act1El, a1);
      setAct(act2El, a2);
      setAct(act3Target, a3);

      // Botones SOLO en acto 1
      if (actions) {
        const show = a1 > 0.6;
        actions.style.opacity = show ? "1" : "0";
        actions.style.transform = show
          ? "translate3d(0,0,0)"
          : "translate3d(0,6px,0)";
        actions.style.pointerEvents = show ? "auto" : "none";
      }
    }

    /* -------- Acto 1/2: fullscreen sobre el video slot -------- */
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const cover = Math.max(vw / slotRect!.width, vh / slotRect!.height);
    const scaleStart = cover * OVERSCAN;

    const slotCx = slotRect!.left + slotRect!.width / 2;
    const slotCy = slotRect!.top + slotRect!.height / 2;

    const txStart = vw / 2 - slotCx;
    const tyStart = vh / 2 - slotCy;

    let scale = lerp(scaleStart, 1, t2);
    let tx = lerp(txStart, 0, t2);
    let ty = lerp(tyStart, 0, t2);

    if (p <= act1End) {
      scale = scaleStart;
      tx = txStart;
      ty = tyStart;
    }

    /* -------- Acto 3: SOLO ACÁ cambiamos origin y hacemos fill -------- */
    const inAct3 = t3raw > 0;

    if (inAct3) {
      universe.style.transformOrigin = "50% 100%";

      const s3 = lerp(1, scaleFinal, t3);
      scale = scale * s3;

      ty = lerp(ty, tyFinal, t3);
    } else {
      universe.style.transformOrigin = "50% 50%";
    }

    universe.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;

    /* -------- Overlay -------- */
    const tt =
      p <= act1End ? 0 : smoothstep(clamp01((p - act1End) / (1 - act1End)));
    overlay.style.opacity = String(lerp(0.58, 0.38, tt));
  };

  const onScroll = () => {
    if (raf !== null) return;
    raf = requestAnimationFrame(apply);
  };

  const onResize = () => {
    slotRect = null;
    measure();
    onScroll();
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  apply();
}

main();