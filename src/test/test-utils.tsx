import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor, within, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { expect } from 'vitest';

import { TooltipProvider } from '@/components/ui/tooltip';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

type RenderWithProvidersOptions = Omit<RenderOptions, 'wrapper'> & {
  queryClient?: QueryClient;
};

export function renderWithProviders(
  ui: ReactElement,
  { queryClient = createTestQueryClient(), ...options }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
      </QueryClientProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

export const user = userEvent.setup({ pointerEventsCheck: 0 });

export async function selectComboboxOption(triggerId: string, optionLabel: string) {
  const trigger = document.getElementById(triggerId);
  expect(trigger).toBeTruthy();

  await user.click(trigger!);

  const popup = await waitFor(() => {
    const element = document.querySelector('[data-slot="combobox-content"][data-open]');
    expect(element).toBeTruthy();
    return element as HTMLElement;
  });

  const option = await within(popup).findByRole('option', { name: optionLabel });
  await user.click(option);
}

export * from '@testing-library/react';
