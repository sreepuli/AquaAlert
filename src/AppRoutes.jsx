import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import RequireAuth from "./components/common/RequireAuth";

// Lazy load dashboard components
const AshaDashboard = lazy(() => import("./dashboards/AshaDashboard"));
const CommunityDashboard = lazy(() =>
  import("./dashboards/CommunityDashboard")
);
const OfficialDashboard = lazy(() => import("./dashboards/OfficialDashboard"));
const GovernmentDashboard = lazy(() => import("./pages/GovernmentDashboard"));
const AdminDashboard = lazy(() => import("./dashboards/AdminDashboard"));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg font-semibold">Loading...</p>
    </div>
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/auth" element={<AuthPage />} />

    {/* Protected dashboard routes - These have their own headers */}
    <Route
      path="/asha-dashboard"
      element={
        <RequireAuth allowedRoles={["asha"]}>
          <Suspense fallback={<LoadingSpinner />}>
            <AshaDashboard />
          </Suspense>
        </RequireAuth>
      }
    />
    <Route
      path="/community-dashboard"
      element={
        <RequireAuth allowedRoles={["community"]}>
          <Suspense fallback={<LoadingSpinner />}>
            <CommunityDashboard />
          </Suspense>
        </RequireAuth>
      }
    />
    <Route
      path="/official-dashboard"
      element={
        <RequireAuth allowedRoles={["official", "government"]}>
          <Suspense fallback={<LoadingSpinner />}>
            <OfficialDashboard />
          </Suspense>
        </RequireAuth>
      }
    />
    <Route
      path="/government-dashboard"
      element={
        <RequireAuth allowedRoles={["government", "official"]}>
          <Suspense fallback={<LoadingSpinner />}>
            <GovernmentDashboard />
          </Suspense>
        </RequireAuth>
      }
    />
    <Route
      path="/admin-dashboard"
      element={
        <RequireAuth allowedRoles={["admin"]}>
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        </RequireAuth>
      }
    />

    {/* Protected pages with navbar */}
    <Route
      path="/alerts"
      element={
        <RequireAuth
          allowedRoles={["asha", "community", "official", "government"]}
        >
          <>
            <Navbar />
            <div className="pt-16">
              {/* Alerts page content would go here */}
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Alerts page coming soon...</p>
              </div>
            </div>
          </>
        </RequireAuth>
      }
    />
    <Route
      path="/data-entry"
      element={
        <RequireAuth allowedRoles={["asha", "community"]}>
          <>
            <Navbar />
            <div className="pt-16">
              {/* Data entry page content would go here */}
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p>Data entry page coming soon...</p>
              </div>
            </div>
          </>
        </RequireAuth>
      }
    />
  </Routes>
);

export default AppRoutes;
