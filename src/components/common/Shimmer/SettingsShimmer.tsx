import { Skeleton } from "@/components/ui/skeleton";

const SettingsShimmer = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      {/* TopBar Shimmer */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Settings Options */}
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>

        {/* Language Selector Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-center space-y-3">
            <Skeleton className="h-5 w-28 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
            <Skeleton className="h-3 w-40 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsShimmer;