import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools';
import type { AnyRouter } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { queryClient } from '@/lib/queryClient';

type TanStackAppDevtoolsProps = {
  router: AnyRouter;
};

export function TanStackAppDevtools({ router }: TanStackAppDevtoolsProps) {
  return (
    <TanStackDevtools
      config={{
        position: 'bottom-right',
        hideUntilHover: false,
      }}
      plugins={[
        {
          name: 'TanStack Query',
          render: <ReactQueryDevtoolsPanel client={queryClient} />,
        },
        {
          name: 'TanStack Router',
          render: <TanStackRouterDevtoolsPanel router={router} />,
        },
        formDevtoolsPlugin(),
      ]}
    />
  );
}
