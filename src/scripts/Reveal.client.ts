(() => {
  let lastY = window.scrollY;
let lastT = performance.now();
let velocity = 0;

window.addEventListener("scroll", () => {
  const now = performance.now();
  const dy = window.scrollY - lastY;
  const dt = Math.max(16, now - lastT);

  const v = dy / dt; // px per ms
  // suavizado
  velocity = velocity * 0.85 + v * 0.15;

  lastY = window.scrollY;
  lastT = now;
}, { passive: true });


  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) return;

  const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          const index = Number(el.dataset.stagger ?? "0");
          el.style.setProperty("--stagger", String(index));

          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.4,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  items.forEach((el) => observer.observe(el));
})();
