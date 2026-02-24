export function useHeroHorizontalScroll(root: HTMLElement) {
  const sticky = root.querySelector<HTMLElement>("[data-type-layer]");
  const track = root.querySelector<HTMLElement>("[data-track]");
  const videoLayer = root.querySelector<HTMLElement>("[data-video-layer]");
  const video = root.querySelector<HTMLVideoElement>("[data-video]");

  if (!sticky || !track || !videoLayer) {
    throw new Error("HeroScroll: required DOM elements missing");
  }

  // 🔒 Narrowing definitivo (TypeScript-safe)
  const stickyEl = sticky;
  const trackEl = track;
  const videoLayerEl = videoLayer;
  const videoEl = video ?? undefined;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  root.querySelectorAll<HTMLElement>("[data-word]").forEach((el) => {
    el.setAttribute("data-text", el.textContent?.trim() ?? "");
  });

  let raf = 0;
  let videoLoaded = false;

  function clamp01(n: number) {
    return Math.max(0, Math.min(1, n));
  }

  const A_END = 0.7;
  const B_START = 0.7;
  const B_END = 0.85;
  const C_START = 0.85;

  function loadVideoOnce() {
    if (!videoEl || videoLoaded) return;

    const source = videoEl.querySelector("source");
    if (source && !videoEl.src) {
      videoEl.src = source.src;
      videoEl.load();
      videoLoaded = true;
    }
  }

  function update() {
    raf = 0;

    if (prefersReducedMotion) {
      trackEl.style.transform = "none";
      stickyEl.style.clipPath = "inset(0 0 0 0)";
      stickyEl.style.filter = "none";
      stickyEl.style.transform = "scale(1)";
      videoLayerEl.classList.add("isVisible");
      videoLayerEl.style.opacity = "1";
      return;
    }

    const rect = root.getBoundingClientRect();
    const total = root.offsetHeight - window.innerHeight;
    if (total <= 0) return;

    const scrolled = clamp01((-rect.top) / total);
    const maxX = trackEl.scrollWidth - window.innerWidth;

    // FASE A
    const aProgress = clamp01(scrolled / A_END);
    trackEl.style.transform = `translate3d(${-maxX * aProgress}px, 0, 0)`;

    // FASE B
    if (scrolled >= B_START && scrolled < C_START) {
      const bProgress = clamp01((scrolled - B_START) / (B_END - B_START));
      const mask = 50 - bProgress * 50;

      stickyEl.style.clipPath = `inset(0 ${mask}% 0 ${mask}%)`;
      stickyEl.style.transform = `scale(${1 + bProgress * 0.04})`;
      stickyEl.style.filter = `blur(${bProgress * 2}px)`;

      videoLayerEl.classList.add("isVisible");
      videoLayerEl.style.opacity = String(bProgress);

      loadVideoOnce();
      stickyEl.style.pointerEvents = "";
    }

    // FASE C
    if (scrolled >= C_START) {
      trackEl.style.transform = `translate3d(${-maxX}px, 0, 0)`;
      videoLayerEl.classList.add("isVisible");
      videoLayerEl.style.opacity = "1";

      stickyEl.style.clipPath = "inset(0 50% 0 50%)";
      stickyEl.style.filter = "none";
      stickyEl.style.transform = "scale(1)";
      stickyEl.style.pointerEvents = "none";

      if (videoEl && videoEl.paused) {
        videoEl.play().catch(() => {});
      }
    }

    // RESET
    if (scrolled < B_START) {
      stickyEl.style.clipPath = "inset(0 0 0 0)";
      stickyEl.style.filter = "none";
      stickyEl.style.transform = "scale(1)";
      stickyEl.style.pointerEvents = "";
      videoLayerEl.style.opacity = "0";
      videoLayerEl.classList.remove("isVisible");
    }
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
  };
}
