import { getRouteApi, Link } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { FarmerReportDocument } from '@/features/people-report/components/farmer-report-document';

const peopleReportRouteApi = getRouteApi('/_authenticated/people/$id/report');

export function PeopleReportPage() {
  const { id: linkId } = peopleReportRouteApi.useParams();
  const search = peopleReportRouteApi.useSearch();

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link to=".." search={search}>
            <ArrowLeft className="mr-2 size-4" />
            Back to Farmer Profile
          </Link>
        </Button>
      </div>

      <FarmerReportDocument linkId={linkId} search={search} />
    </div>
  );
}

export default PeopleReportPage;
