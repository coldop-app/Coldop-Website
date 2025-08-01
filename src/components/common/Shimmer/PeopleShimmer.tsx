import { Skeleton } from "@/components/ui/skeleton";

const PeopleShimmer = () => {
  return (
    <div className="min-h-screen bg-secondary/30">
      {/* TopBar Shimmer */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>

          {/* Search and Sort */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* People Cards Shimmer */}
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <Skeleton className="w-12 h-12 rounded-full" />
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PeopleShimmer;