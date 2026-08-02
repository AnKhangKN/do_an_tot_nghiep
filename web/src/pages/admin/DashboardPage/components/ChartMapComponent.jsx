import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import {
  PiTrendUpBold,
  PiChartPieSliceBold,
  PiFirstAidBold,
  PiListDashesBold,
  PiMapPinBold,
  PiPhoneBold,
  PiClockBold,
  PiUserBold,
  PiInfoBold,
} from "react-icons/pi";
import { formatTime } from "@/utils/format_date.util";

// Standard status badges mapping
const STATUS_CONFIG = {
  PENDING: { label: "Chờ tiếp nhận", bg: "bg-amber-50 text-amber-700 border-amber-200" },
  SEARCHING: { label: "Đang tìm cứu hộ", bg: "bg-blue-50 text-blue-700 border-blue-200" },
  ASSIGNED: { label: "Đã điều phối", bg: "bg-purple-50 text-purple-700 border-purple-200" },
  IN_PROGRESS: { label: "Đang ứng cứu", bg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  DONE: { label: "Hoàn thành", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Đã hủy", bg: "bg-gray-100 text-gray-600 border-gray-200" },
};

// Create custom animated SOS marker icon
const createSosDivIcon = (status) => {
  const colorMap = {
    PENDING: { bg: "#f59e0b" },
    SEARCHING: { bg: "#3b82f6" },
    ASSIGNED: { bg: "#a855f7" },
    IN_PROGRESS: { bg: "#6366f1" },
    DONE: { bg: "#10b981" },
    CANCELLED: { bg: "#6b7280" },
  };
  const color = colorMap[status] || { bg: "#ef4444" };

  return L.divIcon({
    className: "custom-sos-marker-icon",
    html: `
      <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
        <style>
          @keyframes sos-radar-pulse {
            0% { transform: scale(0.6); opacity: 0.8; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        </style>
        <div style="position:absolute;width:24px;height:24px;border-radius:50%;background:${color.bg};animation:sos-radar-pulse 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position:relative;width:26px;height:26px;border-radius:50%;background:${color.bg};border:2px solid #ffffff;box-shadow:0 3px 10px rgba(0,0,0,0.35);display:flex;align-items:center;justify-content:center;color:#ffffff;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

// Component to auto fit map view to points
const MapBoundsFitter = ({ requests }) => {
  const map = useMap();

  useEffect(() => {
    const validPoints = requests
      .filter((r) => r.victim_lat && r.victim_lng)
      .map((r) => [parseFloat(r.victim_lat), parseFloat(r.victim_lng)]);

    if (validPoints.length === 1) {
      map.setView(validPoints[0], 14, { animate: true });
    } else if (validPoints.length > 1) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15, animate: true });
    }
  }, [requests, map]);

  return null;
};

const ChartMapComponent = ({ overviewData }) => {
  const {
    dailyTrend = [],
    statusBreakdown = [],
    incidentTypeStats = [],
    recentRequests = [],
  } = overviewData || {};

  const [activeTab, setActiveTab] = useState("map"); // "map" | "list"
  const isDark = useSelector((state) => state.theme.isDark);

  // Calculate maximum value for daily chart scaling
  const maxDailyTotal = Math.max(...dailyTrend.map((d) => d.total || 0), 5);

  // Total SOS count from breakdown
  const totalBreakdownCount = statusBreakdown.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);

  // Total SOS count for incident types
  const totalIncidentCount = incidentTypeStats.reduce((acc, curr) => acc + (parseInt(curr.count) || 0), 0);

  // Default map position (Can Tho city coordinates or average of requests)
  const defaultCenter = recentRequests.length > 0 && recentRequests[0].victim_lat && recentRequests[0].victim_lng
    ? [parseFloat(recentRequests[0].victim_lat), parseFloat(recentRequests[0].victim_lng)]
    : [10.0452, 105.7469];

  return (
    <div className="space-y-6">
      {/* SECTION 1: Daily Trend & Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left 2 cols: Daily SOS Trend */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white">
                <PiTrendUpBold className="text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Diễn biến Ca khẩn cấp SOS</h3>
                <p className="text-xs text-gray-500">Số lượng yêu cầu SOS nhận được theo ngày</p>
              </div>
            </div>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
              {dailyTrend.length} ngày gần nhất
            </span>
          </div>

          {/* Bar Chart Visual */}
          {dailyTrend.length > 0 ? (
            <div className="pt-4">
              <div className="flex items-end justify-between gap-3 h-52 px-2 border-b border-gray-100 pb-2">
                {dailyTrend.map((item, index) => {
                  const total = parseInt(item.total) || 0;
                  const completed = parseInt(item.completed) || 0;
                  const heightPercent = maxDailyTotal > 0 ? Math.round((total / maxDailyTotal) * 100) : 0;
                  const completedPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      {/* Bar container */}
                      <div className="w-full max-w-[40px] flex flex-col justify-end h-full relative">
                        {/* Tooltip */}
                        <div className="opacity-0 group-hover:opacity-100 transition duration-150 absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white dark:bg-gray-200 dark:text-white text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap z-10 pointer-events-none shadow-md">
                          <div>Tổng: {total} ca</div>
                          <div className="text-emerald-400">Xong: {completed} ca</div>
                        </div>

                        <div
                          style={{ height: `${Math.max(heightPercent, 6)}%` }}
                          className="w-full bg-gray-200 rounded-t-xl overflow-hidden relative group-hover:bg-gray-300 transition duration-150"
                        >
                          <div
                            style={{ height: `${completedPercent}%` }}
                            className="w-full bg-gray-900 absolute bottom-0 left-0 transition duration-300"
                          />
                        </div>
                      </div>

                      {/* X Label */}
                      <span className="text-[11px] font-medium text-gray-500 truncate w-full text-center">
                        {item.date ? item.date.slice(5) : `D${index + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gray-900 dark:bg-gray-200"></span>
                  <span>Đã hoàn thành</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-gray-200"></span>
                  <span>Tổng ca nhận</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center text-sm text-gray-400">
              Chưa có dữ liệu diễn biến thời gian
            </div>
          )}
        </div>

        {/* Right 1 col: SOS Status Breakdown */}
        <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
                <PiChartPieSliceBold className="text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Trạng thái Xử lý</h3>
                <p className="text-xs text-gray-500">Phân bố ca cứu hộ hiện tại</p>
              </div>
            </div>

            {/* List status */}
            <div className="space-y-3">
              {statusBreakdown.map((item) => {
                const config = STATUS_CONFIG[item.status] || {
                  label: item.status,
                  bg: "bg-gray-100 text-gray-700 border-gray-200",
                };
                const count = parseInt(item.count) || 0;
                const percent = totalBreakdownCount > 0 ? Math.round((count / totalBreakdownCount) * 100) : 0;

                return (
                  <div key={item.status} className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-gray-50/60 border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold border ${config.bg}`}>
                        {config.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{count} ca</span>
                      <span className="text-gray-400 font-medium">({percent}%)</span>
                    </div>
                  </div>
                );
              })}

              {statusBreakdown.length === 0 && (
                <div className="py-8 text-center text-xs text-gray-400">
                  Chưa có dữ liệu trạng thái
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
            Tổng cộng: <span className="font-bold text-gray-900">{totalBreakdownCount} ca cứu hộ</span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Incident Types & Recent Requests / Map */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left 1 col: Incident Types Statistics */}
        <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
              <PiFirstAidBold className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Loại sự cố Phổ biến</h3>
              <p className="text-xs text-gray-500">Phân loại sự cố khẩn cấp</p>
            </div>
          </div>

          <div className="space-y-4">
            {incidentTypeStats.map((item, idx) => {
              const count = parseInt(item.count) || 0;
              const percent = totalIncidentCount > 0 ? Math.round((count / totalIncidentCount) * 100) : 0;

              return (
                <div key={item.incident_type_id || idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-800">{item.incident_type}</span>
                    <span className="text-gray-500">{count} ca ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      style={{ width: `${Math.max(percent, 4)}%` }}
                      className="h-full bg-gray-900 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}

            {incidentTypeStats.length === 0 && (
              <div className="py-12 text-center text-xs text-gray-400">
                Chưa có danh mục sự cố
              </div>
            )}
          </div>
        </div>

        {/* Right 2 cols: Interactive Map or Recent SOS Feed */}
        <div className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white">
                <PiMapPinBold className="text-xl" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Vị trí & Hoạt động SOS Mới nhất</h3>
                <p className="text-xs text-gray-500">Bản đồ điều phối & danh sách trực tiếp</p>
              </div>
            </div>

            {/* Toggle Tab */}
            <div className="flex items-center gap-1 rounded-2xl bg-gray-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab("map")}
                className={`rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                  activeTab === "map"
                    ? "bg-white dark:bg-gray-100 text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bản đồ
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`rounded-xl px-3.5 py-1.5 transition cursor-pointer ${
                  activeTab === "list"
                    ? "bg-white dark:bg-gray-100 text-gray-900 shadow-xs"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Danh sách ({recentRequests.length})
              </button>
            </div>
          </div>

          {/* Map View */}
          {activeTab === "map" && (
            <div className="h-80 w-full rounded-2xl overflow-hidden border border-gray-200 shadow-xs relative z-0">
              <MapContainer
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a> contributors'
                  url={
                    isDark
                      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  }
                  subdomains={isDark ? "abcd" : "abc"}
                />

                <MapBoundsFitter requests={recentRequests} />

                {recentRequests.map((req) => {
                  if (!req.victim_lat || !req.victim_lng) return null;
                  const pos = [parseFloat(req.victim_lat), parseFloat(req.victim_lng)];
                  const config = STATUS_CONFIG[req.status] || { label: req.status, bg: "bg-gray-100 text-gray-700 border-gray-200" };
                  const customIcon = createSosDivIcon(req.status);

                  return (
                    <Marker key={req.sos_request_id} position={pos} icon={customIcon}>
                      <Popup>
                        <div className="p-1 space-y-1.5 text-xs font-sans">
                          <div className="font-bold text-gray-900">{req.incident_type || "Yêu cầu SOS"}</div>
                          <div className="text-gray-700">Nạn nhân: {req.victim_name || "Chưa rõ"}</div>
                          <div className="text-gray-600">SĐT: {req.victim_phone || "N/A"}</div>
                          <div className="text-gray-500">Mô tả: {req.description || "Không có"}</div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${config.bg}`}>
                            {config.label}
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>
            </div>
          )}

          {/* List View */}
          {activeTab === "list" && (
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {recentRequests.map((req) => {
                const config = STATUS_CONFIG[req.status] || {
                  label: req.status,
                  bg: "bg-gray-100 text-gray-700 border-gray-200",
                };

                return (
                  <div
                    key={req.sos_request_id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">
                          {req.incident_type || "Sự cố SOS"}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${config.bg}`}>
                          {config.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <PiUserBold className="text-gray-400" /> {req.victim_name || "Khách hàng"}
                        </span>
                        {req.victim_phone && (
                          <span className="flex items-center gap-1">
                            <PiPhoneBold className="text-gray-400" /> {req.victim_phone}
                          </span>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-xs text-gray-500 line-clamp-1">"{req.description}"</p>
                      )}
                    </div>

                    <div className="text-right text-xs text-gray-400 flex sm:flex-col items-center sm:items-end justify-between">
                      <span className="flex items-center gap-1 font-medium text-gray-500">
                        <PiClockBold className="text-sm" />
                        {req.created_at ? formatTime(req.created_at) : "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {recentRequests.length === 0 && (
                <div className="py-12 text-center text-xs text-gray-400">
                  Chưa có yêu cầu SOS nào gần đây
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChartMapComponent;
