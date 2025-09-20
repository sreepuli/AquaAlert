import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const HomePage = () => {
  console.log("HomePage is rendering");

  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen homepage-container bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-600 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden w-full">
        <div className="absolute -top-10 -left-10 w-80 h-80 bg-white opacity-5 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 -right-20 w-64 h-64 bg-cyan-300 opacity-10 rounded-full animate-bounce delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-blue-300 opacity-10 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-20 bg-white/10 backdrop-blur-md border-b border-white/10 w-full">
        <div className="w-full max-w-none">
          <div className="flex justify-between h-20 px-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
                  AquaAlert
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <div className="text-white/90 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                    <span className="text-sm">Welcome, </span>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                  <Link
                    to="/government-dashboard"
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 backdrop-blur-sm border border-green-400/30"
                  >
                    Government Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500/80 hover:bg-red-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-300 backdrop-blur-sm border border-red-400/30"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 w-full py-20 lg:py-32">
        <div className="text-center px-4">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight">
              Smart Waterborne
              <br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">
                Disease Alert System
              </span>
            </h1>
          </div>

          <div className="animate-fade-in-up animation-delay-200">
            <p className="text-xl md:text-2xl text-blue-100 mb-12 mx-auto leading-relaxed">
              Protecting communities through AI-powered disease monitoring,
              real-time alerts, and comprehensive health analytics for better
              public health outcomes.
            </p>
          </div>

          {!user && (
            <div className="animate-fade-in-up animation-delay-400">
              <Link
                to="/auth"
                className="inline-flex items-center bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white px-10 py-4 rounded-full text-xl font-semibold transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1 group"
              >
                Get Started Now
                <svg
                  className="w-6 h-6 ml-2 transform group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 bg-white/5 backdrop-blur-sm w-full">
        <div className="py-20 px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-blue-200 text-lg mx-auto">
              Comprehensive tools for health monitoring and disease prevention
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {/* Feature Card 1 */}
            <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Real-time Monitoring
              </h3>
              <p className="text-blue-200 leading-relaxed">
                Monitor water quality and disease indicators in real-time with
                AI-powered analytics and machine learning algorithms.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Early Warning Alerts
              </h3>
              <p className="text-blue-200 leading-relaxed">
                Get instant notifications about potential disease outbreaks and
                health risks through in-app alerts and notifications.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Advanced Analytics
              </h3>
              <p className="text-blue-200 leading-relaxed">
                Comprehensive analytics and reporting with predictive modeling
                for informed decision-making and policy development.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Multi-Role Access
              </h3>
              <p className="text-blue-200 leading-relaxed">
                Role-based dashboards for ASHA workers, community members, and
                government officials with appropriate access levels.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Smart Predictions
              </h3>
              <p className="text-blue-200 leading-relaxed">
                AI-powered prediction algorithms that forecast potential
                outbreaks based on environmental and health data patterns.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="group bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="w-16 h-16 bg-gradient-to-tr from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Secure Platform
              </h3>
              <p className="text-blue-200 leading-relaxed">
                Enterprise-grade security with encrypted data transmission,
                secure authentication, and role-based access control.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="relative z-10 bg-gradient-to-r from-cyan-600 to-blue-700 py-20 w-full">
        <div className="text-center px-4">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Protect Your Community?
            </h2>
            <p className="text-xl text-cyan-100 mb-10">
              Join thousands of health workers and officials using AquaAlert to
              prevent waterborne diseases.
            </p>
            {!user && (
              <Link
                to="/auth"
                className="inline-flex items-center bg-white text-blue-600 px-10 py-4 rounded-full text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-white/25 transform hover:-translate-y-1 hover:scale-105"
              >
                Start Your Free Trial
                <svg
                  className="w-6 h-6 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
