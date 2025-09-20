import React from "react";

const AlertList = ({ alerts }) => (
  <div className="bg-white p-4 rounded shadow w-full overflow-x-auto">
    <table className="min-w-full text-sm">
      <thead>
        <tr className="bg-blue-100">
          <th className="px-2 py-1">Date</th>
          <th className="px-2 py-1">Village</th>
          <th className="px-2 py-1">Risk</th>
          <th className="px-2 py-1">E. Coli</th>
          <th className="px-2 py-1">Status</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map((alert, idx) => (
          <tr key={idx} className={alert.risk === "High" ? "bg-red-50" : ""}>
            <td className="px-2 py-1">{alert.date}</td>
            <td className="px-2 py-1">{alert.village}</td>
            <td className="px-2 py-1 font-bold text-red-600">{alert.risk}</td>
            <td className="px-2 py-1">{alert.ecoli}</td>
            <td className="px-2 py-1">{alert.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AlertList;
