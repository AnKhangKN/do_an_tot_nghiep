import React from "react";

const StatisticComponent = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className=" border border-gray-400 bg-white p-4 shadow-md rounded-md">
        <p className="text-sm text-gray-500">Người dùng hiện tại</p>

        <h2 className="mt-2 text-3xl font-bold">1,245</h2>
      </div>

      <div className=" border border-gray-400 bg-white p-4 shadow-md rounded-md">
        <p className="text-sm text-gray-500">Người cứu hộ</p>

        <h2 className="mt-2 text-3xl font-bold">256</h2>
      </div>

      <div className=" border border-gray-400 bg-white p-4 shadow-md rounded-md">
        <p className="text-sm text-gray-500">Loại sự cố</p>

        <h2 className="mt-2 text-3xl font-bold">12</h2>
      </div>

      <div className=" border border-gray-400 bg-white p-4 shadow-md rounded-md">
        <p className="text-sm text-gray-500">Số phản hồi</p>

        <h2 className="mt-2 text-3xl font-bold">89</h2>
      </div>
    </div>
  );
};

export default StatisticComponent;
