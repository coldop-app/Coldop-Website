import {
  type ComponentPropsWithoutRef,
  type FocusEventHandler,
  type PropsWithChildren,
  useEffect,
  useRef,
} from 'react';

import './auto-scroll-form-wrapper.css';

type AutoScrollFormWrapperProps = PropsWithChildren<
  ComponentPropsWithoutRef<'div'>
>;

const AUTO_SCROLL_SELECTOR =
  'input, textarea, select, [role="combobox"], [data-slot="select-trigger"]';
const AUTO_SCROLL_DELAY_MS = 100;

export function AutoScrollFormWrapper({
  children,
  onFocusCapture,
  ...props
}: AutoScrollFormWrapperProps) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleFocusCapture: FocusEventHandler<HTMLDivElement> = (event) => {
    onFocusCapture?.(event);
    if (event.defaultPrevented) return;

    const target = event.target as HTMLElement | null;
    if (!target) return;

    const scrollTarget = target.closest(AUTO_SCROLL_SELECTOR) as
      | HTMLElement
      | null;
    if (!scrollTarget) return;

    if (timeoutRef.current != null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      scrollTarget.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, AUTO_SCROLL_DELAY_MS);
  };

  return (
    <div
      {...props}
      className={`auto-scroll-form-wrapper ${props.className ?? ''}`.trim()}
      onFocusCapture={handleFocusCapture}
    >
      {children}
    </div>
  );
}
