import { renderWithProviders } from '@/test/test-utils';
import { LandingPage } from './landing-page';
import { describe, it, vi } from 'vitest';

// Mock TanStack Link so we don't need real router context
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('LandingPage', () => {
  it('should render without crashing', () => {
    renderWithProviders(<LandingPage />);
  });
});
