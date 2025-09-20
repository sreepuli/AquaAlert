import React from "react";
import MapView from "../components/common/MapView";
import RiskChart from "../components/dashboard/RiskChart";

const sampleLocations = [
  { village: "Majuli Village 1", position: [26.97, 94.17], risk: "High" },
  { village: "Majuli Village 2", position: [26.95, 94.15], risk: "Medium" },
  { village: "Majuli Village 3", position: [26.93, 94.13], risk: "Low" },
];

const sampleChartData = [
  { date: "2025-09-01", risk: 3, cases: 10 },
  { date: "2025-09-08", risk: 2, cases: 7 },
  { date: "2025-09-15", risk: 1, cases: 3 },
];

const DashboardPage = () => (
  <div className="flex flex-col gap-8 p-8 bg-blue-50 min-h-screen">
    <h2 className="text-2xl font-bold">Dashboard</h2>
    <MapView locations={sampleLocations} />
    <RiskChart data={sampleChartData} />
  </div>
);

export default DashboardPage;
