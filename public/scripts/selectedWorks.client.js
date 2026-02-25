(() => {
  const root = document.querySelector("[data-sw]");
  if (!root) return;

  const header = root.querySelector("[data-sw-header]");

  const setHeaderH = () => {
    const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
    root.style.setProperty("--sw-header-h", `${h}px`);
  };
  setHeaderH();

  const slides = Array.from(root.querySelectorAll("[data-sw-slide]"));
  if (!slides.length) return;

  const clamp01 = (n) => Math.min(1, Math.max(0, n));
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const notify = (type, detail) => {
    root.dispatchEvent(new CustomEvent(type, { detail }));
  };

  function update() {
    if (prefersReduced) return;

    const vh = window.innerHeight;

    let activeIndex = 0;
    let bestDist = Infinity;

    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();

      // 0..1 dentro del viewport
      const progress = clamp01((vh - rect.top) / (vh + rect.height));

      // Elegir el slide más centrado
      const slideCenter = rect.top + rect.height / 2;
      const dist = Math.abs(slideCenter - vh / 2);
      if (dist < bestDist) {
        bestDist = dist;
        activeIndex = i;
      }

      // easing
      const ease = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      // Brackets abren
const open = clamp01((ease - 0.10) / 0.70); // 0..1

const titleEl = slide.querySelector("[data-sw-title]");
const leftEl = slide.querySelector(".swBracket--left");
const rightEl = slide.querySelector(".swBracket--right");

if (titleEl && leftEl && rightEl) {
  const vw = window.innerWidth;

  // margen “editorial” para no pegarlo al borde
  const edge = Math.max(18, Math.round(vw * 0.008)); // ~2vw, mínimo 18px

  const titleRect = titleEl.getBoundingClientRect();
  const leftRect = leftEl.getBoundingClientRect();
  const rightRect = rightEl.getBoundingClientRect();

  // Centros actuales
  const leftCenter = leftRect.left + leftRect.width / 2;
  const rightCenter = rightRect.left + rightRect.width / 2;

  // Targets: casi borde del viewport
  const leftTarget = edge;
  const rightTarget = vw - edge;

  // Distancias necesarias para llegar a targets
  const leftDelta = leftTarget - leftCenter;    // negativo (va a la izquierda)
  const rightDelta = rightTarget - rightCenter; // positivo (va a la derecha)

  // Aplicamos proporción según open
  leftEl.style.transform = `translateX(${leftDelta * open}px)`;
  rightEl.style.transform = `translateX(${rightDelta * open}px)`;
}

      // 👇 Micro movimiento del título (sin sacarlo del viewport)
      // Entra un poquito más arriba cuando está “activo”
      const title = slide.querySelector("[data-sw-title]");
      if (title) {
        const y = (0.5 - ease) * (vh * 0.04); // máx ~4vh, suave
        title.style.transform = `translateY(${y}px)`;
      }

      // Reveal: visible en casi toda la duración del slide
      const reveal = slide.querySelector("[data-sw-reveal]");
      if (reveal) {
        const on = progress > 0.12 && progress < 0.98;
        slide.classList.toggle("is-active", on);
      }

      slide.style.setProperty("--sw-progress", progress.toFixed(3));
    });

    slides.forEach((s, i) => s.classList.toggle("is-current", i === activeIndex));
    notify("sw:active", { index: activeIndex });
  }

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      update();
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    setHeaderH();
    onScroll();
  });

  update();
})();