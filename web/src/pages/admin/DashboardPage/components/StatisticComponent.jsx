import React from "react";
import {
  PiUsersBold,
  PiShieldCheckBold,
  PiWarningOctagonBold,
  PiCheckCircleBold,
  PiClockBold,
  PiXCircleBold,
  PiCalendarBold,
  PiHandshakeBold,
} from "react-icons/pi";

const StatisticComponent = ({ summary }) => {
  const {
    totalUsers = 0,
    totalRescuers = 0,
    pendingRescuers = 0,
    totalSos = 0,
    todaySos = 0,
    activeSos = 0,
    completedSos = 0,
    cancelledSos = 0,
    matchingSuccessRate = 0,
  } = summary || {};

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: SOS Hôm nay */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tổng SOS Hôm Nay
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
              <PiCalendarBold className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {todaySos.toLocaleString("vi-VN")}
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              ca mới hôm nay
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span>Tổng ca từ trước đến nay:</span>
          <span className="font-bold text-gray-900">{totalSos.toLocaleString("vi-VN")}</span>
        </div>
      </div>

      {/* Card 2: Ca Đang Xử Lý */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ca Đang Xử Lý Khẩn
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white">
              <PiWarningOctagonBold className="text-xl" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {activeSos.toLocaleString("vi-VN")}
          </h2>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span className="text-gray-500">Trạng thái:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 border border-blue-200">
            <PiClockBold className="text-sm" /> Đang điều phối & hỗ trợ
          </span>
        </div>
      </div>

      {/* Card 3: Ca Hoàn Thành */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ca Cứu Hộ Hoàn Thành
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <PiCheckCircleBold className="text-xl" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {completedSos.toLocaleString("vi-VN")}
          </h2>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1 text-gray-500">
            <PiXCircleBold className="text-sm text-gray-400" /> {cancelledSos} ca đã hủy
          </span>

        </div>
      </div>

      {/* Card 4: Tỷ Lệ Ghép Đôi Thành Công */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tỷ Lệ Ghép Đôi Thành Công
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <PiHandshakeBold className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {matchingSuccessRate}%
            </h2>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <PiUsersBold className="text-sm text-gray-400" /> {totalUsers} Victim / {totalRescuers} Rescuer
          </span>
          {pendingRescuers > 0 && (
            <span className="font-medium text-amber-600">({pendingRescuers} chờ duyệt)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticComponent;
