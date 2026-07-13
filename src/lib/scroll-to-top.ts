/** Selectors for nested main scroll areas (in addition to `window`). */
const MAIN_SCROLL_SELECTORS = ['[data-main-scroll]', '[data-slot="sidebar-inset"]'] as const;

type ScrollToTopOptions = {
  behavior?: ScrollBehavior;
};

/**
 * Scrolls the window and known app main scroll containers to the top.
 * Use after in-page step changes (wizards) or alongside router scroll restoration.
 */
export function scrollMainToTop({ behavior = 'instant' }: ScrollToTopOptions = {}) {
  window.scrollTo({ top: 0, left: 0, behavior });
  document.documentElement.scrollTo({ top: 0, left: 0, behavior });

  for (const selector of MAIN_SCROLL_SELECTORS) {
    document.querySelectorAll(selector).forEach((node) => {
      if (!(node instanceof HTMLElement)) return;
      if (node.scrollHeight <= node.clientHeight) return;
      node.scrollTo({ top: 0, left: 0, behavior });
    });
  }
}
