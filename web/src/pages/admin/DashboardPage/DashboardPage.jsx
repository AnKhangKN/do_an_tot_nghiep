import React, { useCallback, useEffect, useState } from "react";
import StatisticComponent from "./components/StatisticComponent";
import ChartMapComponent from "./components/ChartMapComponent";
import TimeComponent from "./components/TimeComponent";
import { getDashboardOverview, getAiDashboardSummary, exportAdminReportApi } from "@/api/admin/DashboardApi";
import { subscribeConnectionStatus, subscribeDashboardEvents } from "@/socket";
import { PiArrowsClockwiseBold, PiWarningBold, PiLightningFill, PiBellRingingFill, PiSparkleBold, PiCheckCircleFill, PiLightbulbFill, PiBrainFill, PiFileCsvBold, PiDownloadSimpleBold } from "react-icons/pi";

const DashboardPage = () => {
  const [days, setDays] = useState(7);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveBanner, setLiveBanner] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // AI Summary State
  const [aiSummary, setAiSummary] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Export State
  const [exportLoading, setExportLoading] = useState(false);

  const handleExportReport = async () => {
    try {
      setExportLoading(true);
      await exportAdminReportApi(days);
    } catch (err) {
      console.error("Lỗi khi xuất báo cáo:", err);
    } finally {
      setExportLoading(false);
    }
  };

  const fetchOverview = useCallback(async (selectedDays = days, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
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
      if (showLoading) setLoading(false);
    }
  }, [days]);

  const fetchAiSummary = async () => {
    try {
      setAiLoading(true);
      const res = await getAiDashboardSummary(days);
      if (res && res.data) {
        setAiSummary(res.data);
      }
    } catch (err) {
      console.error("Lỗi khi tạo tóm tắt AI:", err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview(days, true);
  }, [days, fetchOverview]);

  useEffect(() => {
    const unsubConnection = subscribeConnectionStatus({
      onConnect: () => setIsConnected(true),
      onDisconnect: () => setIsConnected(false),
    });

    const unsubDashboard = subscribeDashboardEvents((event) => {
      let text = "";
      if (event.type === "SOS_CREATED") {
        text = `⚡ Yêu cầu SOS mới vừa xuất hiện (Mã: #${event.sosId?.substring(0, 8)})`;
      } else if (event.type === "SOS_ACCEPTED") {
        text = `🚀 Ca SOS #${event.sosId?.substring(0, 8)} đã có Cứu hộ viên tiếp nhận!`;
      } else if (event.type === "SOS_COMPLETED") {
        text = `✅ Ca SOS #${event.sosId?.substring(0, 8)} vừa hoàn thành xử lý thành công!`;
      } else if (event.type === "SOS_CANCELLED") {
        text = `⚠️ Ca SOS #${event.sosId?.substring(0, 8)} vừa bị hủy.`;
      }

      if (text) {
        setLiveBanner(text);
        setTimeout(() => setLiveBanner(null), 6000);
      }

      fetchOverview(days, false);
    });

    return () => {
      unsubConnection();
      unsubDashboard();
    };
  }, [days, fetchOverview]);

  const handleSelectDays = (newDays) => {
    setDays(newDays);
  };

  return (
    <div className="flex flex-col gap-6 pb-8 relative">
      {/* Live Event Banner Toast */}
      {liveBanner && (
        <div className="fixed top-6 right-6 z-50 animate-bounce transition-all duration-300">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-2xl shadow-xl border border-gray-700">
            <PiBellRingingFill className="text-emerald-400 text-lg shrink-0 animate-pulse" />
            <span className="text-xs font-semibold">{liveBanner}</span>
            <button
              onClick={() => setLiveBanner(null)}
              className="ml-2 text-gray-400 hover:text-white text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Tổng quan Hệ thống Cứu hộ
            </h1>

            {/* Live Socket Status Indicator */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-2xs transition-colors ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                  : "bg-amber-50 text-amber-700 border-amber-200/80"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-emerald-500 animate-ping" : "bg-amber-500"
                }`}
              />
              <PiLightningFill className={isConnected ? "text-emerald-500" : "text-amber-500"} />
              {isConnected ? "LIVE PUSH ACTIVE" : "RECONNECTING"}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Báo cáo chỉ số tổng hợp, tình trạng ứng cứu & diễn biến khẩn cấp theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Export Report Button */}
          <button
            onClick={handleExportReport}
            disabled={exportLoading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-emerald-700 text-white hover:bg-emerald-800 transition duration-150 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            title="Xuất báo cáo dữ liệu CSV/Excel"
          >
            <PiFileCsvBold className="text-base text-emerald-200" />
            {exportLoading ? "Đang xuất..." : "Xuất Báo Cáo CSV"}
          </button>

          {/* AI Summary Generate Button */}
          <button
            onClick={fetchAiSummary}
            disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition duration-150 text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            title="AI Tóm tắt hoạt động"
          >
            <PiSparkleBold className={`text-sm text-purple-400 ${aiLoading ? "animate-spin" : ""}`} />
            {aiLoading ? "Đang tạo AI..." : "Tạo Tóm Tắt AI"}
          </button>

          {/* Refresh button */}
          <button
            onClick={() => fetchOverview(days, true)}
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

      {/* CARD AI TÓM TẮT VẬN HÀNH HỆ THỐNG (AI OPERATIONAL ACTIVITY SUMMARY) */}
      {aiSummary && (
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <PiBrainFill className="text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  AI Tóm Tắt Lịch Sử Vận Hành ({days} ngày qua)
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                    Groq Llama 3.3 / 70b
                  </span>
                </h3>
                <p className="text-xs text-gray-400">Báo cáo điều hành cứu hộ tự động phân tích bởi AI</p>
              </div>
            </div>

            <button
              onClick={() => setAiSummary(null)}
              className="text-gray-400 hover:text-white text-xs font-bold p-1 rounded-full hover:bg-slate-800 transition"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Văn bản Tóm tắt Tổng quan */}
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
              {aiSummary.summaryText}
            </p>

            {/* Các điểm nổi bật chính */}
            {aiSummary.highlights && aiSummary.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {aiSummary.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                    <PiCheckCircleFill className="text-emerald-400 text-base shrink-0 mt-0.5" />
                    <span className="text-xs text-gray-300 leading-tight font-medium">{item}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Khuyến nghị điều phối cho Admin */}
            {aiSummary.recommendation && (
              <div className="flex items-center gap-3 p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-300 text-xs">
                <PiLightbulbFill className="text-amber-400 text-lg shrink-0" />
                <span><strong className="text-amber-200">Khuyến nghị Điều phối:</strong> {aiSummary.recommendation}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800">
          <PiWarningBold className="text-xl shrink-0 text-rose-600" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            onClick={() => fetchOverview(days, true)}
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
