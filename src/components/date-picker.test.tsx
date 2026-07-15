import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DatePickerInput } from './date-picker';

describe('DatePickerInput', () => {
  it('parses a dot-separated date and formats it for display', () => {
    const onChange = vi.fn();

    render(<DatePickerInput onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '19.3.26' } });

    expect(screen.getByRole('textbox')).toHaveValue('19th March 2026');
    expect(onChange).toHaveBeenCalledTimes(1);

    const selectedDate = onChange.mock.calls[0]?.[0] as Date;
    expect(selectedDate.getFullYear()).toBe(2026);
    expect(selectedDate.getMonth()).toBe(2);
    expect(selectedDate.getDate()).toBe(19);
  });

  it('does not accept a date that rolls into another month', () => {
    const onChange = vi.fn();

    render(<DatePickerInput onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '31.2.26' } });

    expect(screen.getByRole('textbox')).toHaveValue('31.2.26');
    expect(onChange).not.toHaveBeenCalled();
  });
});
