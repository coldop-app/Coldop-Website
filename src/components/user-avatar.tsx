import { memo, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
}

const UserAvatarComponent = ({ name, imageUrl }: UserAvatarProps) => {
  // Get first initial from name - memoized
  const initial = useMemo(() => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 1); // Only first letter
  }, [name]);

  return (
    <Avatar className="h-9 w-9">
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={name} />
      ) : (
        <AvatarFallback>{initial}</AvatarFallback>
      )}
    </Avatar>
  );
};

export const UserAvatar = memo(UserAvatarComponent);
