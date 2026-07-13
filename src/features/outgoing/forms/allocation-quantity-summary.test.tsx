import { describe, expect, it } from 'vitest';

import { AllocationQuantitySummary } from '@/features/outgoing/forms/allocation-quantity-summary';
import { render, screen } from '@/test/test-utils';

describe('AllocationQuantitySummary', () => {
  it('shows previously issued, max to issue, and issuing now', () => {
    render(<AllocationQuantitySummary previouslyIssued={10} maxToIssue={25} issuingNow={5} />);

    expect(screen.getByText('Previously issued')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Max to issue')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Issuing now')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
