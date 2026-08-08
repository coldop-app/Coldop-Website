import MorePage from '@/features/more';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/more')({
  component: MorePage,
});
