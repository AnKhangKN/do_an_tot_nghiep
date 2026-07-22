import React, { useCallback, useEffect, useState } from "react";
import StatisticComponent from "./components/StatisticComponent";
import ChartMapComponent from "./components/ChartMapComponent";
import TimeComponent from "./components/TimeComponent";
import { getDashboardOverview } from "@/api/admin/DashboardApi";
import { PiArrowsClockwiseBold, PiWarningBold } from "react-icons/pi";

const DashboardPage = () => {
  const [days, setDays] = useState(7);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = useCallback(async (selectedDays = days) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDashboardOverview(selectedDays);
      if (res && res.data) {
        setOverviewData(res.data);
      } else {
        setOverviewData(null);
      }
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu trang tổng quan:", err);
      setError("Không thể tải thông tin tổng quan hệ thống. Vui lòng kiểm tra lại kết nối hoặc tài khoản quản trị.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchOverview(days);
  }, [days, fetchOverview]);

  const handleSelectDays = (newDays) => {
    setDays(newDays);
  };

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900">
            Tổng quan Hệ thống Cứu hộ
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Báo cáo chỉ số tổng hợp, tình trạng ứng cứu & diễn biến khẩn cấp theo thời gian
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh button */}
          <button
            onClick={() => fetchOverview(days)}
            disabled={loading}
            className="flex items-center justify-center h-10 w-10 rounded-2xl border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition duration-150 cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <PiArrowsClockwiseBold className={`text-lg ${loading ? "animate-spin text-gray-900" : ""}`} />
          </button>

          {/* Time Filter Component */}
          <TimeComponent selectedDays={days} onSelectDays={handleSelectDays} />
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800">
          <PiWarningBold className="text-xl shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={() => fetchOverview(days)}
            className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !overviewData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 h-72 rounded-3xl bg-gray-100 animate-pulse" />
            <div className="h-72 rounded-3xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      )}

      {/* Main Content */}
      {overviewData && (
        <>
          {/* Key Statistics Cards */}
          <StatisticComponent summary={overviewData.summary} />

          {/* Analytics Charts & Map Component */}
          <ChartMapComponent overviewData={overviewData} />
        </>
      )}
    </div>
  );
};

export default DashboardPage;
