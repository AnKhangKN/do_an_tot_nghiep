import React from "react";

const ChartComponent = () => {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="flex justify-between px-5">
        <div className="border rounded-full h-80 w-80 shrink-0"></div>
        <div className="w-full p-4">Thông tin circle</div>
      </div>

      <div className="h-80 w-full border"></div>
    </div>
  );
};

export default ChartComponent;
