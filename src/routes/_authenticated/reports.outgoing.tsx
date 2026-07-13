import { createFileRoute } from '@tanstack/react-router';
import OutgoingReportPage from '@/features/outgoing-report';

export const Route = createFileRoute('/_authenticated/reports/outgoing')({
  component: OutgoingReportPage,
});
