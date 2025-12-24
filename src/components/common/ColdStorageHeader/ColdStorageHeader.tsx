import React, { ReactNode } from 'react';
import { MapPin, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StoreAdmin } from '@/utils/types';

interface ColdStorageHeaderProps {
  adminInfo: StoreAdmin | null;
  actionButtons?: ReactNode;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const ColdStorageHeader: React.FC<ColdStorageHeaderProps> = ({ adminInfo, actionButtons }) => {
  return (
    <Card className="overflow-hidden border border-gray-100 shadow-sm">
      {/* Header Background */}
      <div className="bg-gray-50/50 border-b border-gray-100 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 sm:pb-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8">
          {/* Logo/Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 xl:h-28 xl:w-28 border-4 border-white shadow-md">
              {adminInfo?.imageUrl ? (
                <AvatarImage
                  src={adminInfo.imageUrl}
                  alt={adminInfo.coldStorageDetails?.coldStorageName || adminInfo.name}
                />
              ) : null}
              <AvatarFallback className="text-sm sm:text-xl lg:text-2xl xl:text-3xl bg-primary text-white font-bold">
                {getInitials(adminInfo?.coldStorageDetails?.coldStorageName || adminInfo?.name || 'CS')}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Cold Storage Info */}
          <div className="flex-1 w-full text-center lg:text-left">
            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              {adminInfo?.coldStorageDetails?.coldStorageName || adminInfo?.name || 'Cold Storage'}
            </h1>
            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center lg:items-start xl:items-center gap-2 sm:gap-4 lg:gap-2 xl:gap-6 mb-4 sm:mb-6">
              {adminInfo?.coldStorageDetails?.coldStorageAddress && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                  <MapPin size={14} className="text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm lg:text-base text-center lg:text-left break-words">
                    {adminInfo.coldStorageDetails.coldStorageAddress}
                  </span>
                </div>
              )}
              {adminInfo?.name && (
                <div className="flex items-center justify-center lg:justify-start gap-2 text-gray-600">
                  <User size={14} className="text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm lg:text-base">{adminInfo.name}</span>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            {actionButtons && (
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-6">
                {actionButtons}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ColdStorageHeader;
