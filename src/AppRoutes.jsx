import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/common/Navbar";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import RequireAuth from "./components/common/RequireAuth";

// Direct imports instead of lazy loading
import AshaDashboard from "./dashboards/AshaDashboard";
import CommunityDashboard from "./dashboards/CommunityDashboard";
import OfficialDashboard from "./dashboards/OfficialDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/auth" element={<AuthPage />} />

    {/* Test route for debugging */}
    <Route
      path="/test"
      element={
        <div className="p-8">
          <h1 className="text-2xl">Test Route Working!</h1>
        </div>
      }
    />

    {/* Protected dashboard routes - These have their own headers */}
    <Route
      path="/asha-dashboard"
      element={
        <RequireAuth allowedRoles={["asha"]}>
          <AshaDashboard />
        </RequireAuth>
      }
    />
    <Route
      path="/community-dashboard"
      element={
        <RequireAuth allowedRoles={["community"]}>
          <CommunityDashboard />
        </RequireAuth>
      }
    />
    <Route
      path="/official-dashboard"
      element={
        <RequireAuth allowedRoles={["official", "government"]}>
          <OfficialDashboard />
        </RequireAuth>
      }
    />
    <Route
      path="/admin-dashboard"
      element={
        <RequireAuth allowedRoles={["admin"]}>
          <AdminDashboard />
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
