(() => {
  const projects = document.querySelectorAll<HTMLElement>(".project");
  if (!projects.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-active");
        }
      });
    },
    { threshold: 0.4 }
  );

  projects.forEach((p) => observer.observe(p));
})();
