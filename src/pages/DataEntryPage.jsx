import React from "react";
import DataForm from "../components/forms/DataForm";

const DataEntryPage = () => {
  const handleSubmit = (data) => {
    // TODO: Integrate with Firestore
    alert("Report submitted! (Firestore integration pending)");
    console.log(data);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h2 className="text-2xl font-bold mb-6">Submit Water & Health Report</h2>
      <DataForm onSubmit={handleSubmit} />
    </div>
  );
};

export default DataEntryPage;
