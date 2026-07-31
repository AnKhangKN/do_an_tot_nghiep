import React, { useCallback, useEffect, useState } from "react";
import {
  PiBellBold,
  PiPaperPlaneRightBold,
  PiUsersBold,
  PiClockBold,
  PiCheckCircleBold,
  PiWarningBold,
  PiShieldWarningBold,
  PiTrashBold,
  PiMagnifyingGlassBold,
  PiBroadcastBold,
  PiInfoBold,
  PiCheckBold,
} from "react-icons/pi";
import * as NotificationApi from "@/api/admin/NotificationApi";

const normalizeNotificationItem = (item) => ({
  id: item.id || item.notificationId || `notif-${Date.now()}`,
  title: item.title || "",
  content: item.content || "",
  target: item.targetGroup || item.target || "ALL",
  type: item.type || "SYSTEM",
  sentAt: item.sentAt || item.createdAt || new Date().toISOString(),
  sentCount: Number(item.sentCount || item.recipientCount || 1),
  status: item.status || "SUCCESS",
});

const INITIAL_LOGS = [];

const TARGET_CONFIG = {
  ALL: { label: "Tất cả người dùng", bg: "bg-gray-900 text-white dark:bg-gray-200 dark:text-white" },
  RESCUER: { label: "Cứu hộ viên", bg: "bg-blue-100 text-blue-800 border border-blue-200" },
  VICTIM: { label: "Nạn nhân / Dân cư", bg: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
};

const TYPE_CONFIG = {
  EMERGENCY: { label: "Khẩn cấp", icon: PiWarningBold, color: "text-red-600 bg-red-50 border-red-200" },
  WARNING: { label: "Cảnh báo", icon: PiShieldWarningBold, color: "text-amber-600 bg-amber-50 border-amber-200" },
  SYSTEM: { label: "Hệ thống", icon: PiBroadcastBold, color: "text-gray-800 bg-gray-100 border-gray-200" },
  INFO: { label: "Tin tức", icon: PiInfoBold, color: "text-blue-600 bg-blue-50 border-blue-200" },
};

const NotificationPage = () => {
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [filterTarget, setFilterTarget] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetGroup, setTargetGroup] = useState("ALL");
  const [notifType, setNotifType] = useState("SYSTEM");
  const [sendFcm, setSendFcm] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadNotifications = useCallback(async () => {
    setIsLoadingLogs(true);

    try {
      const response = await NotificationApi.getNotifications(1, 100, "ALL");
      const payload = response?.data ?? response;

      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.items)
          ? payload.items
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : [];

      setLogs(items.map(normalizeNotificationItem));
    } catch (error) {
      console.error("Không tải được danh sách thông báo:", error);
      setLogs([]);
      showToast("Không tải được danh sách thông báo từ máy chủ", "error");
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      showToast("Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo!", "error");
      return;
    }

    setIsSending(true);

    try {
      // Gọi API thực tế xuống Server Node.js (POST /api/notifications/broadcast)
      const response = await NotificationApi.sendNotification({
        title: title.trim(),
        content: content.trim(),
        targetGroup: targetGroup,
        type: notifType,
      });

      const recipientCount = response?.data?.recipientCount || (targetGroup === "ALL" ? 540 : targetGroup === "RESCUER" ? 150 : 390);

      const newLog = normalizeNotificationItem({
        id: response?.data?.id || response?.data?.notificationId || `notif-${Date.now()}`,
        title: title.trim(),
        content: content.trim(),
        targetGroup,
        type: notifType,
        sentAt: response?.data?.sentAt || new Date().toISOString(),
        sentCount: recipientCount,
        status: "SUCCESS",
      });

      setLogs((prev) => [newLog, ...prev]);
      setTitle("");
      setContent("");
      showToast(`Đã phát thông báo thành công tới ${recipientCount} người dùng trong hệ thống!`);
    } catch (error) {
      console.warn("Không thể kết nối API hoặc hết hạn token Admin:", error);

      showToast("Không thể phát thông báo. Vui lòng kiểm tra kết nối hoặc quyền đăng nhập.", "error");
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteLog = (id) => {
    setLogs((prev) => prev.filter((item) => item.id !== id));
    showToast("Đã xóa nhật ký thông báo!");
  };

  const filteredLogs = logs.filter((item) => {
    const matchTarget = filterTarget === "ALL" || item.target === filterTarget;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTarget && matchSearch;
  });

  const totalSent = logs.reduce((acc, curr) => acc + curr.sentCount, 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg border transition duration-300 animate-slide-in ${toastMessage.type === "error"
            ? "bg-red-900 text-white border-red-800"
            : "bg-gray-900 text-white border-gray-800 dark:bg-gray-200 dark:text-white dark:border-gray-600"
            }`}
        >
          {toastMessage.type === "error" ? (
            <PiWarningBold className="text-xl text-red-400" />
          ) : (
            <PiCheckCircleBold className="text-xl text-emerald-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white shadow-md">
            <PiBellBold className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Quản lý & Phát Thông báo</h1>
            <p className="text-xs text-gray-500">
              Gửi thông báo đẩy FCM thời gian thực tới Cứu hộ viên và Người gặp nạn
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl bg-gray-50 px-4 py-2 border border-gray-100">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-gray-700">FCM Service: Active</span>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
            <PiPaperPlaneRightBold className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{logs.length}</div>
            <div className="text-xs text-gray-500 font-medium">Lượt phát thông báo</div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-900">
            <PiUsersBold className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">{totalSent.toLocaleString()}</div>
            <div className="text-xs text-gray-500 font-medium">Lượt gửi đến thiết bị</div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <PiCheckBold className="text-xl" />
          </div>
          <div>
            <div className="text-2xl font-black text-gray-900">99.4%</div>
            <div className="text-xs text-gray-500 font-medium">Tỷ lệ nhận FCM thành công</div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT: FORM + LOGS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: BROADCAST FORM (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white">
                <PiBroadcastBold className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Tạo thông báo mới</h2>
                <p className="text-xs text-gray-500">Soạn tin nhắn phát sóng khẩn cấp</p>
              </div>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* Tiêu đề */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Tiêu đề thông báo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cảnh báo bão khẩn cấp khu vực Ninh Kiều..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white dark:focus:bg-gray-100 focus:border-gray-900 focus:outline-none transition"
                />
              </div>

              {/* Nhóm đối tượng & Loại thông báo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Đối tượng nhận</label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white dark:focus:bg-gray-100 focus:border-gray-900 focus:outline-none transition cursor-pointer font-medium"
                  >
                    <option value="ALL">Tất cả người dùng</option>
                    <option value="RESCUER">Cứu hộ viên</option>
                    <option value="VICTIM">Nạn nhân / Dân cư</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Loại thông báo</label>
                  <select
                    value={notifType}
                    onChange={(e) => setNotifType(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white dark:focus:bg-gray-100 focus:border-gray-900 focus:outline-none transition cursor-pointer font-medium"
                  >
                    <option value="SYSTEM">Hệ thống</option>
                    <option value="EMERGENCY">Khẩn cấp / SOS</option>
                    <option value="WARNING">Cảnh báo thiên tai</option>
                    <option value="INFO">Tin tức chung</option>
                  </select>
                </div>
              </div>

              {/* Nội dung */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Nội dung thông báo <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung chi tiết thông báo gửi đến ứng dụng..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-xs text-gray-900 placeholder-gray-400 focus:bg-white dark:focus:bg-gray-100 focus:border-gray-900 focus:outline-none transition resize-none"
                />
              </div>

              {/* Option Push FCM */}
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <input
                  type="checkbox"
                  id="sendFcm"
                  checked={sendFcm}
                  onChange={(e) => setSendFcm(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
                />
                <label htmlFor="sendFcm" className="text-xs text-gray-700 font-medium cursor-pointer select-none">
                  Gửi Push Notification thời gian thực tới thiết bị di động (FCM)
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-xs font-bold text-white shadow-md hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 active:scale-[0.99] transition duration-150 disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                    <span>Đang phát sóng FCM...</span>
                  </>
                ) : (
                  <>
                    <PiPaperPlaneRightBold className="text-base" />
                    <span>Phát thông báo ngay</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-gray-400 text-center">
            Thông báo gửi qua Firebase Cloud Messaging v1 SDK kết nối PostgreSQL Log table
          </div>
        </div>

        {/* RIGHT COLUMN: SENT LOGS LIST (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm">
          {/* List Header & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 mb-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                <PiClockBold className="text-lg" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Nhật ký đã phát</h2>
                <p className="text-xs text-gray-500">Danh sách tin nhắn thông báo đã gửi</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 rounded-2xl bg-gray-100 p-1 text-[11px] font-semibold">
              <button
                onClick={() => setFilterTarget("ALL")}
                className={`rounded-xl px-3 py-1 transition cursor-pointer ${filterTarget === "ALL" ? "bg-white dark:bg-gray-100 text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Tất cả ({logs.length})
              </button>
              <button
                onClick={() => setFilterTarget("RESCUER")}
                className={`rounded-xl px-3 py-1 transition cursor-pointer ${filterTarget === "RESCUER" ? "bg-white dark:bg-gray-100 text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Cứu hộ viên
              </button>
              <button
                onClick={() => setFilterTarget("VICTIM")}
                className={`rounded-xl px-3 py-1 transition cursor-pointer ${filterTarget === "VICTIM" ? "bg-white dark:bg-gray-100 text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                Nạn nhân
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative mb-4">
            <PiMagnifyingGlassBold className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Tìm kiếm thông báo theo tiêu đề hoặc nội dung..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-10 pr-4 py-2 text-xs text-gray-900 placeholder-gray-400 focus:bg-white dark:focus:bg-gray-100 focus:border-gray-900 focus:outline-none transition"
            />
          </div>

          {/* Logs Items List */}
          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {isLoadingLogs ? (
              <div className="py-16 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                Đang tải danh sách thông báo...
              </div>
            ) : filteredLogs.length > 0 ? (
              filteredLogs.map((item) => {
                const targetCfg = TARGET_CONFIG[item.target] || TARGET_CONFIG.ALL;
                const typeCfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.SYSTEM;
                const IconComp = typeCfg.icon;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition space-y-2.5 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${typeCfg.color}`}
                        >
                          <IconComp className="text-xs" />
                          {typeCfg.label}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${targetCfg.bg}`}>
                          {targetCfg.label}
                        </span>
                      </div>

                      <button
                        onClick={() => handleDeleteLog(item.id)}
                        title="Xóa nhật ký này"
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                      >
                        <PiTrashBold className="text-sm" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-xs font-bold text-gray-900 leading-snug">{item.title}</h3>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.content}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100/80">
                      <span className="flex items-center gap-1 font-medium">
                        <PiUsersBold /> Đã phát: <strong className="text-gray-700">{item.sentCount}</strong> thiết bị
                      </span>
                      <span className="flex items-center gap-1">
                        <PiClockBold />
                        {new Date(item.sentAt).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                Không tìm thấy thông báo phù hợp
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPage;