import { useLayoutEffect, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatStat, prefersReducedMotion } from '../utils';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Page-level GSAP orchestration for the landing page. Sections opt in via
 * data attributes so they stay purely presentational:
 *
 * - `data-anim="nav|hero-item|hero-visual|occupancy"` — entrance timeline
 * - `data-reveal` — fade/slide the element in on scroll
 * - `data-reveal-group` — stagger the element's children in on scroll
 * - `data-cells` — grid-cell stagger (chamber map)
 * - `data-counter` / `data-counter-format` — animated stat counters
 */
export function useLandingAnimations(rootRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: 'power3.out' } })
        .from('[data-anim="nav"]', { y: -16, opacity: 0, duration: 0.5 })
        .from(
          '[data-anim="hero-item"]',
          { y: 32, opacity: 0, duration: 0.7, stagger: 0.1 },
          '-=0.2',
        )
        .from('[data-anim="hero-visual"]', { y: 48, opacity: 0, duration: 0.9 }, '-=0.55')
        .fromTo(
          '[data-anim="occupancy"]',
          { scaleX: 0 },
          { scaleX: 1, duration: 1.1, ease: 'power2.inOut', transformOrigin: 'left center' },
          '-=0.6',
        );

      /**
       * Play `onPlay` exactly once, the first time `triggerEl` is in view.
       * Unlike `once: true`, this survives loading mid-page (restored scroll,
       * anchor links): if the trigger is created already past its start/end,
       * it still plays instead of being consumed unplayed.
       */
      const onceInView = (triggerEl: Element, start: string, onPlay: () => void) => {
        let played = false;
        let st: ScrollTrigger | null = null;
        const play = () => {
          if (played) return;
          played = true;
          onPlay();
          st?.kill();
        };
        st = ScrollTrigger.create({ trigger: triggerEl, start, onEnter: play, onEnterBack: play });
        if (played || st.progress === 1) {
          play();
          st.kill();
        }
      };

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.set(el, { y: 28, opacity: 0 });
        onceInView(el, 'top 88%', () => {
          gsap.to(el, { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out' });
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
        const items = Array.from(group.children);
        gsap.set(items, { y: 24, opacity: 0 });
        onceInView(group, 'top 85%', () => {
          gsap.to(items, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out' });
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-cells]').forEach((grid) => {
        const cells = Array.from(grid.children);
        gsap.set(cells, { opacity: 0, scale: 0.92 });
        onceInView(grid, 'top 85%', () => {
          gsap.to(cells, {
            opacity: 1,
            scale: 1,
            duration: 0.45,
            stagger: 0.04,
            ease: 'power2.out',
          });
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
        const target = Number(el.dataset.counter ?? 0);
        const format = el.dataset.counterFormat ?? 'plus';
        const state = { value: 0 };
        onceInView(el, 'top 90%', () => {
          gsap.to(state, {
            value: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              el.textContent = formatStat(state.value, format);
            },
          });
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, [rootRef]);
}
