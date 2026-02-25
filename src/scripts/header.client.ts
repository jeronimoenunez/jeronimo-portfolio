// src/scripts/header.client.ts
(() => {
  function initOne(root: HTMLElement) {
    if (root.dataset.vhInit === "1") return;
    root.dataset.vhInit = "1";

    const toggle = root.querySelector<HTMLElement>("[data-vh-toggle]");
    const panel = root.querySelector<HTMLElement>("[data-vh-panel]");

    // Mobile menu
    if (toggle && panel) {
      const close = () => {
        panel.hidden = true;
        toggle.setAttribute("aria-label", "Open menu");
      };
      const open = () => {
        panel.hidden = false;
        toggle.setAttribute("aria-label", "Close menu");
      };

      toggle.addEventListener("click", () => {
        if (panel.hidden) open();
        else close();
      });

      panel.addEventListener("click", (e) => {
        const t = e.target as Element | null;
        const a = t?.closest?.("[data-vh-close]");
        if (a) close();
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
      });
    }

    // Clock (local browser time)
    const t1 = root.querySelector<HTMLElement>("[data-vh-time]");
    const t2 = root.querySelector<HTMLElement>("[data-vh-time-m]");
    if (t1 || t2) {
      const fmt = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" });

      const tick = () => {
        const now = new Date();
        const val = fmt.format(now);
        if (t1) {
          t1.textContent = val;
          // si t1 es <time>, seteamos datetime si existe
          (t1 as HTMLTimeElement).setAttribute?.("datetime", now.toISOString());
        }
        if (t2) t2.textContent = val;
      };

      tick();
      window.setInterval(tick, 30_000);
    }

    // Active link (scroll spy)
    const desktopLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('a.vh__link[href^="#"]'));
    const mobileLinks = Array.from(root.querySelectorAll<HTMLAnchorElement>('a.vh__panelLink[href^="#"]'));
    const allLinks = [...desktopLinks, ...mobileLinks];

    const byHash = new Map<string, HTMLAnchorElement[]>();
    allLinks.forEach((a) => {
      const hash = a.getAttribute("href");
      if (!hash) return;
      if (!byHash.has(hash)) byHash.set(hash, []);
      byHash.get(hash)!.push(a);
    });

    const hashes = Array.from(byHash.keys());
    const sections = hashes
      .map((h) => document.querySelector<HTMLElement>(h))
      .filter((x): x is HTMLElement => Boolean(x));

    const setActive = (hash: string) => {
      allLinks.forEach((a) => a.classList.remove("is-active"));
      const group = byHash.get(hash);
      if (group) group.forEach((a) => a.classList.add("is-active"));
    };

    allLinks.forEach((a) => {
      a.addEventListener("click", () => {
        const hash = a.getAttribute("href");
        if (hash) setActive(hash);
      });
    });

    if (location.hash && byHash.has(location.hash)) setActive(location.hash);
    else if (hashes.length) setActive(hashes[0]);

    if (sections.length && "IntersectionObserver" in window) {
      let current = location.hash && byHash.has(location.hash) ? location.hash : hashes[0];

      const io = new IntersectionObserver(
        (entries) => {
          let best: IntersectionObserverEntry | null = null;
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
          }
          if (!best) return;

          const id = (best.target as HTMLElement).id;
          if (!id) return;

          const next = "#" + id;
          if (next !== current && byHash.has(next)) {
            current = next;
            setActive(next);
          }
        },
        {
          root: null,
          rootMargin: "-20% 0px -65% 0px",
          threshold: [0.08, 0.15, 0.25, 0.35, 0.5, 0.65],
        }
      );

      sections.forEach((sec) => io.observe(sec));
    }
  }

  function initAll() {
    document.querySelectorAll<HTMLElement>("[data-site-header]").forEach(initOne);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll, { once: true });
  } else {
    initAll();
  }
})();