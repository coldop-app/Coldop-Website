import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';

export function DaybookBackButton() {
  return (
    <Button variant="outline" size="sm" className="w-fit" asChild>
      <Link to="/daybook" search={DEFAULT_DAYBOOK_SEARCH}>
        <ArrowLeft className="size-4" />
        Back to Daybook
      </Link>
    </Button>
  );
}
