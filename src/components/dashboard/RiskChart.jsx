import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const RiskChart = ({ data }) => (
  <div className="bg-white p-4 rounded shadow w-full h-80">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="risk"
          stroke="#ef4444"
          name="Risk Level"
        />
        <Line
          type="monotone"
          dataKey="cases"
          stroke="#3b82f6"
          name="Diarrhea Cases"
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default RiskChart;
