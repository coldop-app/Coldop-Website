'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStoreAdminLogout } from '@/services/store-admin/auth/useStoreAdminLogout';
import { cn } from '@/lib/utils'; // optional, if you have a className utility

interface LogoutButtonProps {
  variant?: 'button' | 'dropdown';
  className?: string;
}

export function LogoutButton({
  variant = 'button',
  className,
}: LogoutButtonProps) {
  const { mutate: logout, isPending } = useStoreAdminLogout();

  const handleLogout = () => {
    logout();
  };

  if (variant === 'dropdown') {
    return (
      <Button
        variant="ghost"
        onClick={handleLogout}
        disabled={isPending}
        className={cn('w-full justify-start', className)}
      >
        <LogOut className="mr-2 h-4 w-4" />
        {isPending ? 'Signing out...' : 'Sign Out'}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className={className}
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
