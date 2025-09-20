import React, { Suspense, lazy } from "react";

// Lazy load the MapView component
const MapView = lazy(() => import("./MapView"));

// Loading component for map
const MapLoadingSpinner = () => (
  <div className="h-96 w-full rounded shadow bg-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">Loading Map...</p>
    </div>
  </div>
);

const LazyMapView = (props) => (
  <Suspense fallback={<MapLoadingSpinner />}>
    <MapView {...props} />
  </Suspense>
);

export default LazyMapView;
