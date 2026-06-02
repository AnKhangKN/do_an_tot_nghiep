import React from "react";
import ChartMapComponent from "./components/ChartMapComponent";
import StatisticComponent from "./components/StatisticComponent";
import TimeComponent from "./components/TimeComponent";

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div></div>

        <TimeComponent />
      </div>

      {/* Statistics */}
      <StatisticComponent />

      {/* Charts */}
      <ChartMapComponent />
    </div>
  );
};

export default DashboardPage;
