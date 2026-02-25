(() => {
  const init = () => {
    const root = document.querySelector<HTMLElement>("[data-sw]");
    if (!root) return;

    // evita doble init (Astro puede rehidratarlos o re-ejecutar en navegaciones)
    if (root.dataset.swInit === "1") return;
    root.dataset.swInit = "1";

    const header = root.querySelector<HTMLElement>("[data-sw-header]");

    const setHeaderH = () => {
      const h = header ? Math.ceil(header.getBoundingClientRect().height) : 0;
      root.style.setProperty("--sw-header-h", `${h}px`);
    };
    setHeaderH();

    const slides = Array.from(root.querySelectorAll<HTMLElement>("[data-sw-slide]"));
    if (!slides.length) return;

    const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    const notify = (type: string, detail: unknown) => {
      root.dispatchEvent(new CustomEvent(type, { detail }));
    };

    const update = () => {
      if (prefersReduced) return;

      const vh = window.innerHeight || 1;

      let activeIndex = 0;
      let bestDist = Infinity;

      slides.forEach((slide, i) => {
        const rect = slide.getBoundingClientRect();

        const progress = clamp01((vh - rect.top) / (vh + rect.height));

        const slideCenter = rect.top + rect.height / 2;
        const dist = Math.abs(slideCenter - vh / 2);
        if (dist < bestDist) {
          bestDist = dist;
          activeIndex = i;
        }

        const ease =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        // Brackets abren hacia bordes
        const open = clamp01((ease - 0.10) / 0.70);

        const titleEl = slide.querySelector<HTMLElement>("[data-sw-title]");
        const leftEl = slide.querySelector<HTMLElement>(".swBracket--left");
        const rightEl = slide.querySelector<HTMLElement>(".swBracket--right");

        if (titleEl && leftEl && rightEl) {
          const vw = window.innerWidth || 1;

          const edge = Math.max(18, Math.round(vw * 0.008));

          const leftRect = leftEl.getBoundingClientRect();
          const rightRect = rightEl.getBoundingClientRect();

          const leftCenter = leftRect.left + leftRect.width / 2;
          const rightCenter = rightRect.left + rightRect.width / 2;

          const leftTarget = edge;
          const rightTarget = vw - edge;

          const leftDelta = leftTarget - leftCenter;
          const rightDelta = rightTarget - rightCenter;

          leftEl.style.transform = `translateX(${leftDelta * open}px)`;
          rightEl.style.transform = `translateX(${rightDelta * open}px)`;
        }

        // Micro-mov del título
        const title = slide.querySelector<HTMLElement>("[data-sw-title]");
        if (title) {
          const y = (0.5 - ease) * (vh * 0.04);
          title.style.transform = `translateY(${y}px)`;
        }

        // Active / reveal
        const reveal = slide.querySelector<HTMLElement>("[data-sw-reveal]");
        if (reveal) {
          const on = progress > 0.12 && progress < 0.98;
          slide.classList.toggle("is-active", on);
        }

        slide.style.setProperty("--sw-progress", progress.toFixed(3));
      });

      slides.forEach((s, i) => s.classList.toggle("is-current", i === activeIndex));
      notify("sw:active", { index: activeIndex });
    };

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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();