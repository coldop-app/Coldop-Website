import { createFileRoute } from '@tanstack/react-router';
import IncomingReportPage from '@/features/incoming-report';

export const Route = createFileRoute('/_authenticated/reports/incoming')({
  component: IncomingReportPage,
});
