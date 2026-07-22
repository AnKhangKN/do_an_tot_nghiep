import React from "react";
import {
  PiUsersBold,
  PiShieldCheckBold,
  PiWarningOctagonBold,
  PiCheckCircleBold,
  PiClockBold,
  PiXCircleBold,
  PiFirstAidBold,
} from "react-icons/pi";

const StatisticComponent = ({ summary }) => {
  const {
    totalUsers = 0,
    totalRescuers = 0,
    pendingRescuers = 0,
    totalSos = 0,
    activeSos = 0,
    completedSos = 0,
    cancelledSos = 0,
    totalIncidentTypes = 0,
  } = summary || {};

  const completionRate = totalSos > 0 ? Math.round((completedSos / totalSos) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Người dùng / Nạn nhân */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tổng Nạn nhân / Nguời dùng
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
              <PiUsersBold className="text-xl" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {totalUsers.toLocaleString("vi-VN")}
          </h2>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
          <span>Hệ thống cứu hộ</span>
          <span className="font-semibold text-gray-700">Active</span>
        </div>
      </div>

      {/* Card 2: Người cứu hộ */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Đội ngũ Cứu hộ
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
              <PiShieldCheckBold className="text-xl" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {totalRescuers.toLocaleString("vi-VN")}
          </h2>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span className="text-gray-500">Chờ xác minh:</span>
          {pendingRescuers > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700 border border-amber-200">
              <PiClockBold className="text-sm" /> {pendingRescuers} sơ duyệt
            </span>
          ) : (
            <span className="font-medium text-gray-600">Đã sẵn sàng</span>
          )}
        </div>
      </div>

      {/* Card 3: Ca SOS */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ca khẩn cấp SOS
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <PiWarningOctagonBold className="text-xl" />
            </div>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            {totalSos.toLocaleString("vi-VN")}
          </h2>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span className="text-gray-500">Đang xử lý khẩn:</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700 border border-blue-200">
            {activeSos} ca hoạt động
          </span>
        </div>
      </div>

      {/* Card 4: Hoàn thành & Tỷ lệ */}
      <div className="flex flex-col justify-between rounded-3xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-200">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tỷ lệ Cứu hộ Thành công
            </span>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <PiCheckCircleBold className="text-xl" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <h2 className="text-3xl font-extrabold text-gray-900">
              {completionRate}%
            </h2>
            <span className="text-xs text-gray-500 font-medium">
              ({completedSos} ca hoàn thành)
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs">
          <span className="flex items-center gap-1 text-gray-500">
            <PiFirstAidBold className="text-sm text-gray-400" /> {totalIncidentTypes} loại sự cố
          </span>
          <span className="inline-flex items-center gap-1 text-gray-600 font-medium">
            <PiXCircleBold className="text-sm text-gray-400" /> {cancelledSos} đã hủy
          </span>
        </div>
      </div>
    </div>
  );
};

export default StatisticComponent;
