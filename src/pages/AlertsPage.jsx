import React from "react";
import AlertList from "../components/dashboard/AlertList";

const sampleAlerts = [
  {
    date: "2025-09-15",
    village: "Majuli Village 1",
    risk: "High",
    ecoli: 15,
    status: "Sent",
  },
  {
    date: "2025-09-10",
    village: "Majuli Village 2",
    risk: "Medium",
    ecoli: 8,
    status: "Sent",
  },
  {
    date: "2025-09-05",
    village: "Majuli Village 3",
    risk: "Low",
    ecoli: 2,
    status: "Not Sent",
  },
];

const AlertsPage = () => (
  <div className="flex flex-col gap-8 p-8 bg-blue-50 min-h-screen">
    <h2 className="text-2xl font-bold">Alerts Log</h2>
    <AlertList alerts={sampleAlerts} />
  </div>
);

export default AlertsPage;
