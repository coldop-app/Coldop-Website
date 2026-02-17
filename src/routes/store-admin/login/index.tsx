import { createFileRoute, Link, redirect } from '@tanstack/react-router';

import LoginForm from '@/components/auth/login';
import { useStoreAdminLogin } from '@/services/store-admin/auth/useStoreAdminLogout';

export const Route = createFileRoute('/store-admin/login/')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: search.redirect ? (search.redirect as string) : undefined,
    };
  },
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to daybook
    if (context.auth?.isAuthenticated) {
      throw redirect({
        to: '/store-admin/daybook',
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { mutate: login, isPending } = useStoreAdminLogin();

  const handleSubmit = (values: { mobileNumber: string; password: string }) => {
    login(values);
  };

  return (
    <div className="bg-background relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 sm:px-0">
      {/* Background pattern elements */}
      <div className="absolute inset-0 h-full w-full">
        <div className="bg-primary/5 absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full"></div>
        <div className="bg-primary/5 absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full"></div>
        <div className="bg-primary/5 absolute top-1/4 left-1/3 h-64 w-64 rounded-full"></div>
        <div className="bg-primary/10 absolute right-1/3 bottom-1/4 h-48 w-48 rounded-full"></div>

        {/* Additional subtle pattern elements */}
        <div className="bg-primary/5 absolute top-1/2 left-1/4 h-20 w-20 rounded-full"></div>
        <div className="bg-primary/5 absolute right-1/4 bottom-1/3 h-16 w-16 rounded-full"></div>
        <div className="bg-primary/5 absolute top-1/3 right-1/5 h-24 w-24 rounded-full"></div>

        {/* Decorative lines */}
        <div className="bg-primary/10 absolute top-20 left-1/2 h-px w-[300px] -rotate-45"></div>
        <div className="bg-primary/10 absolute right-1/2 bottom-20 h-px w-[300px] -rotate-45"></div>
      </div>

      {/* Logo - smaller on mobile */}
      <div className="fixed top-6 left-6 z-20">
        <Link
          to="/"
          className="focus-visible:ring-primary flex items-center rounded transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <img
            src="/coldop-logo.webp"
            alt="Coldop Logo"
            className="w-12 sm:w-16"
          />
        </Link>
      </div>

      {/* Form Container - full width on mobile */}
      <div className="z-10 w-full py-8 sm:max-w-md sm:py-0">
        <LoginForm onSubmit={handleSubmit} isLoading={isPending} />
      </div>
    </div>
  );
}
