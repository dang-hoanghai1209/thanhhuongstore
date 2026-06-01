export default function GlobalLoader() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      {/* Search and Header Shimmer */}
      <div className="flex justify-between items-center bg-white p-5 rounded-brand-lg border border-gray-100/60 shadow-xs">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-6 bg-gray-200 rounded w-20" />
      </div>

      {/* Main Grid Layout Shimmer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Left Sidebar Filter Shimmer */}
        <div className="hidden lg:block space-y-6 bg-white p-6 rounded-brand-lg border border-gray-100/60 shadow-xs">
          <div className="h-5 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="h-5 bg-gray-200 rounded w-1/3 pt-4 mb-4" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-brand-md w-10" />
            <div className="h-8 bg-gray-200 rounded-brand-md w-10" />
            <div className="h-8 bg-gray-200 rounded-brand-md w-10" />
          </div>
        </div>

        {/* Right Cards Shimmer */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="bg-white rounded-brand-lg border border-gray-100 overflow-hidden shadow-xs">
              <div className="w-full aspect-square bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2 pt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
