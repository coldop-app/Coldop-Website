export const businessNumberSpinnerClassName =
  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none';

export function blurTargetOnNumberWheel(event: React.WheelEvent<HTMLInputElement>) {
  event.currentTarget.blur();
}

export function preventArrowUpDownOnNumericInput(event: React.KeyboardEvent<HTMLInputElement>) {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }
}
