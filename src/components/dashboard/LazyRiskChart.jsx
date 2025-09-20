import React, { Suspense, lazy } from "react";

// Lazy load the RiskChart component
const RiskChart = lazy(() => import("./RiskChart"));

// Loading component for chart
const ChartLoadingSpinner = () => (
  <div className="h-64 w-full bg-white rounded-lg shadow flex items-center justify-center">
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-gray-600 text-sm">Loading Chart...</p>
    </div>
  </div>
);

const LazyRiskChart = (props) => (
  <Suspense fallback={<ChartLoadingSpinner />}>
    <RiskChart {...props} />
  </Suspense>
);

export default LazyRiskChart;
