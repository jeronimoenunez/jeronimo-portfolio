import { useHeroHorizontalScroll } from "../../../scripts/scroll/useHeroHorizontalScroll";

(() => {
  const root = document.querySelector<HTMLElement>("[data-hero]");
  if (!root) return;

  useHeroHorizontalScroll(root);
})();
