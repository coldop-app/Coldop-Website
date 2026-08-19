import { Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  buildGatePassEditBackTarget,
  type GatePassEditSearch,
} from '@/features/daybook/gate-pass-edit-search';

export function GatePassEditBackButton({ search }: { search: GatePassEditSearch }) {
  const backTarget = buildGatePassEditBackTarget(search);

  return (
    <Button variant="outline" size="sm" className="w-fit" asChild>
      {backTarget.kind === 'people' ? (
        <Link to={backTarget.to} params={backTarget.params} search={backTarget.search}>
          <ArrowLeft className="size-4" />
          {backTarget.label}
        </Link>
      ) : (
        <Link to={backTarget.to} search={backTarget.search}>
          <ArrowLeft className="size-4" />
          {backTarget.label}
        </Link>
      )}
    </Button>
  );
}
