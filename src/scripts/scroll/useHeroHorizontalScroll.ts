type ScrubOptions = {
  /** mapea progreso de scroll 0..1 a progreso del video 0..1 */
  mapProgress?: (p: number) => number;

  /** smoothing base (0..1). Más alto = más “pegado” */
  smoothing?: number | ((p: number) => number);

  /** recorta el rango del video (0..1) */
  range?: { from: number; to: number };

  /** evita tocar el último frame (glitches) */
  endPaddingSeconds?: number;
};

export function useHeroHorizontalScroll(root: HTMLElement, opts: ScrubOptions = {}) {
  const video = root.querySelector<HTMLVideoElement>("[data-video]");
  if (!video) return;

  const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

  let raf: number | null = null;
  let duration = 0;
  let ready = false;
  let unlocked = false;

  const mapProgress = opts.mapProgress ?? ((p) => p);
  const smoothing = opts.smoothing ?? 0.12;
  const range = opts.range ?? { from: 0, to: 1 };
  const endPad = opts.endPaddingSeconds ?? 0.05;

  const onMeta = () => {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    ready = duration > 0;
    try { video.currentTime = 0.001; } catch {}
  };

  const tryUnlock = async () => {
    if (unlocked) return;
    try {
      await video.play();
      video.pause();
      unlocked = true;
    } catch {}
  };

  if (video.readyState >= 1) onMeta();
  else video.addEventListener("loadedmetadata", onMeta, { once: true });

  void tryUnlock();

  const progress = () => {
    const rect = root.getBoundingClientRect();
    const scrollable = root.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return clamp((-rect.top) / scrollable, 0, 1);
  };

  const apply = () => {
    raf = null;
    if (!ready) return;

    const pScroll = progress();

    // 1) progress del video (0..1) con mapping no lineal
    const pVideo = clamp(mapProgress(pScroll), 0, 1);

    // 2) recorte de rango (por ejemplo 0.02..0.92)
    const pr = range.from + (range.to - range.from) * pVideo;

    const target = pr * duration;
    const safe = clamp(target, 0, Math.max(duration - endPad, 0));

    // 3) smoothing variable
    const k = typeof smoothing === "function" ? smoothing(pScroll) : smoothing;
    const kk = clamp(k, 0.01, 0.35); // límites sanos

    const current = video.currentTime;
    const next = current + (safe - current) * kk;

    video.currentTime = next;
  };

  const onScroll = () => {
    void tryUnlock();
    if (raf !== null) return;
    raf = requestAnimationFrame(apply);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  apply();

  return () => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (raf !== null) cancelAnimationFrame(raf);
  };
}