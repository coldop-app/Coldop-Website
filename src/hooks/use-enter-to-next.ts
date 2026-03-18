import * as React from 'react';

function getFocusableFormElements(form: HTMLFormElement): HTMLElement[] {
  return Array.from(form.elements).filter(
    (el) =>
      el instanceof HTMLElement &&
      !el.hasAttribute('disabled') &&
      el.tabIndex !== -1
  ) as HTMLElement[];
}

/** Move focus to the next focusable control in the same form (Tab order). */
export function focusNextInForm(from: HTMLElement): void {
  const form = from.closest('form');
  if (!form) return;
  const elements = getFocusableFormElements(form);
  const index = elements.indexOf(from);
  if (index !== -1) {
    elements[index + 1]?.focus();
  }
}

/**
 * Returns a keydown handler: Enter moves focus to the next focusable field
 * in the same form instead of submitting. Skips TEXTAREA so Enter still inserts newlines.
 *
 * Attach to `<form onKeyDown={...}>` (recommended) or to individual fields.
 */
export function useEnterToNext() {
  return React.useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Enter') return;

    const target = e.target as HTMLElement;
    if (target.tagName === 'TEXTAREA') return;

    // Let Enter on submit controls run the default action (submit form → e.g. Next / Review).
    if (
      (target instanceof HTMLButtonElement && target.type === 'submit') ||
      (target instanceof HTMLInputElement && target.type === 'submit')
    ) {
      return;
    }

    e.preventDefault();

    const form = target.closest('form');
    if (!form) return;

    const elements = getFocusableFormElements(form);
    const index = elements.indexOf(e.target as HTMLElement);

    if (index !== -1) {
      elements[index + 1]?.focus();
    }
  }, []);
}
