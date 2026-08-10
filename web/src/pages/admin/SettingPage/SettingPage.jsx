import React, { useCallback, useEffect, useState } from "react";
import {
  PiSirenFill,
  PiWarningFill,
  PiPhoneCallFill,
  PiGearFill,
  PiCheckBold,
  PiArrowClockwiseBold,
  PiCheckCircleBold,
  PiWarningBold,
  PiMapPinFill,
  PiChatCircleTextFill,
  PiTimerFill,
  PiListPlusFill,
  PiStudentFill,
  PiLinkSimple,
  PiPlusBold,
  PiTrashFill,
} from "react-icons/pi";
import { getSystemSettings, updateSystemSettings } from "@/api/admin/SettingApi";

const getErrorMessage = (error) => {
  return error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
};

const DEFAULT_FORM_VALUES = {
  // Dispatch & SOS
  search_radius_ladder: "2,5,10,20",
  offer_accept_seconds: "30",
  retry_interval_seconds: "15",
  max_rescuers_per_attempt: "5",
  rescuer_freshness_seconds: "300",
  auto_cancel_inactive_minutes: "30",
  chat_close_grace_minutes: "15",

  // Geofencing & Hazards
  geofence_high_radius: "500",
  geofence_medium_radius: "350",
  geofence_low_radius: "200",
  cluster_sos_threshold: "3",
  cluster_sos_radius: "200",

  // AI & Moderation
  ai_moderation_enabled: "true",
  ai_sentiment_enabled: "true",
  blacklisted_phrases_list: "",

  // Hotline
  hotline_medical: "115",
  hotline_fire: "114",
  hotline_police: "113",
  hotline_emergency: "112",
  hotlines_custom_list: "[]",

  // Đồ án tốt nghiệp
  thesis_author_name: "",
  thesis_student_id: "",
  thesis_class: "",
  thesis_school: "",
  thesis_supervisor: "",
  thesis_github_url: "",
  thesis_report_url: "",
  thesis_contact_email: "",
  thesis_contact_phone: "",
  app_apk_url: "",
};

const SettingPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("dispatch");
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSystemSettings();
      const settingsList = res?.data?.settings || [];
      if (settingsList.length > 0) {
        const loadedMap = { ...DEFAULT_FORM_VALUES };
        settingsList.forEach((item) => {
          if (item.key) {
            loadedMap[item.key] = item.value ?? "";
          }
        });
        setFormValues(loadedMap);
      }
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChange = (key, value) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await updateSystemSettings(formValues);
      showToast("Lưu cấu hình hệ thống thành công!", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Bạn có chắc chắn muốn khôi phục tất cả cấu hình về mặc định ban đầu?")) {
      setFormValues(DEFAULT_FORM_VALUES);
      showToast("Đã khôi phục biểu mẫu về giá trị mặc định. Hãy bấm 'Lưu Cấu Hình' để áp dụng.", "info");
    }
  };

  // Quản lý hotline bổ sung động
  const getCustomHotlines = () => {
    try {
      const list = JSON.parse(formValues.hotlines_custom_list || "[]");
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  };

  const handleAddCustomHotline = () => {
    const list = getCustomHotlines();
    const newItem = {
      id: Date.now().toString(),
      title: "",
      phoneNumber: "",
      description: "",
    };
    const updated = [...list, newItem];
    setFormValues((prev) => ({
      ...prev,
      hotlines_custom_list: JSON.stringify(updated),
    }));
  };

  const handleUpdateCustomHotline = (id, field, value) => {
    const list = getCustomHotlines();
    const updated = list.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setFormValues((prev) => ({
      ...prev,
      hotlines_custom_list: JSON.stringify(updated),
    }));
  };

  const handleRemoveCustomHotline = (id) => {
    const list = getCustomHotlines();
    const updated = list.filter((item) => item.id !== id);
    setFormValues((prev) => ({
      ...prev,
      hotlines_custom_list: JSON.stringify(updated),
    }));
  };

  const renderInputField = (key, label, desc, unit = "", type = "text") => {
    return (
      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all flex flex-col justify-between">
        <div>
          <label className="block font-semibold text-gray-900 text-sm mb-1">{label}</label>
          {desc && <p className="text-xs text-gray-500 mb-3 leading-relaxed">{desc}</p>}
        </div>
        <div className="relative mt-2">
          <input
            type={type}
            value={formValues[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-4 py-3 rounded-xl dark:bg-gray-200 dark:border-gray-100 dark:text-white bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all pr-12 font-medium"
            placeholder="Nhập giá trị..."
          />
          {unit && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderLinkField = (key, label, desc, placeholder = "") => {
    return (
      <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all flex flex-col justify-between">
        <div>
          <label className="block font-semibold text-gray-900 text-sm mb-1 flex items-center gap-2">
            <PiLinkSimple className="text-gray-400" size={15} />
            {label}
          </label>
          {desc && <p className="text-xs text-gray-500 mb-3 leading-relaxed">{desc}</p>}
        </div>
        <input
          type="url"
          value={formValues[key] ?? ""}
          onChange={(e) => handleChange(key, e.target.value)}
          placeholder={placeholder || "https://..."}
          className="mt-2 w-full px-4 py-3 rounded-xl dark:bg-gray-200 dark:border-gray-100 dark:text-white bg-white border border-gray-200 text-gray-900 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-medium"
        />
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl border transition-all animate-bounce ${toastMessage.type === "error"
            ? "bg-red-900 text-white border-red-800"
            : toastMessage.type === "info"
              ? "bg-blue-900 text-white border-blue-800"
              : "bg-gray-900 text-white border-gray-800"
            }`}
        >
          {toastMessage.type === "error" ? (
            <PiWarningBold className="text-xl text-red-400 shrink-0" />
          ) : (
            <PiCheckCircleBold className="text-xl text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="dark:bg-gray-200 dark:text-white flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-md">
            <PiGearFill size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Cấu hình Hệ thống Vận hành</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Quản lý các tham số thời gian thực cho Cứu hộ khẩn cấp, Geofencing, AI & Thông báo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            <PiArrowClockwiseBold size={16} />
            <span>Khôi phục Mặc định</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="dark:hover:bg-gray-200 flex items-center gap-2 px-5 py-2.5 rounded-2xl dark:bg-gray-100 bg-gray-900 dark:text-white font-semibold text-xs hover:bg-gray-800 transition-all shadow-md disabled:opacity-50"
          >
            <PiCheckBold size={16} className="dark:text-emerald-400 text-emerald-400" />
            <span className="dark:text-white text-white">{saving ? "Đang lưu..." : "Lưu Cấu Hình"}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dark:bg-gray-200 dark:text-white flex flex-wrap items-center gap-2 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("dispatch")}
          className={`dark:hover:bg-gray-100 flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs transition-all ${activeTab === "dispatch"
            ? "dark:bg-gray-100 bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
        >
          <PiSirenFill size={18} className={activeTab === "dispatch" ? "text-red-500" : "text-gray-400"} />
          <span>1. Điều phối & Ca SOS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("geofence")}
          className={`dark:hover:bg-gray-100 flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs transition-all ${activeTab === "geofence"
            ? "dark:bg-gray-100 bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
        >
          <PiWarningFill size={18} className={activeTab === "geofence" ? "text-amber-500" : "text-gray-400"} />
          <span>2. Cảnh báo & Geofencing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hotline")}
          className={`dark:hover:bg-gray-100 flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs transition-all ${activeTab === "hotline"
            ? "dark:bg-gray-100 bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
        >
          <PiPhoneCallFill size={18} className={activeTab === "hotline" ? "text-emerald-500" : "text-gray-400"} />
          <span>3. Hotline & Hệ thống</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("thesis")}
          className={`dark:hover:bg-gray-100 flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-xs transition-all ${activeTab === "thesis"
            ? "dark:bg-gray-100 bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            }`}
        >
          <PiStudentFill size={18} className={activeTab === "thesis" ? "text-blue-500" : "text-gray-400"} />
          <span>4. Đồ án, Tác giả & Ứng dụng</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="dark:bg-gray-200 dark:text-white bg-white p-8 rounded-3xl border border-gray-200 shadow-sm space-y-6">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
            <div className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="dark:bg-gray-200 dark:text-white bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm">
          {/* TAB 1: DISPATCH & SOS */}
          {activeTab === "dispatch" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PiSirenFill className="text-red-500" />
                  <span>Tham số Điều phối & Hủy ca SOS Tự động</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Điều chỉnh khoảng cách quét, thời gian chờ phản hồi và thời gian đóng kênh nhắn tin hậu cứu hộ
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField(
                  "search_radius_ladder",
                  "Dãy Bán kính Tìm kiếm Cứu hộ viên",
                  "Các vòng bán kính tính bằng km (cách nhau bởi dấu phẩy)",
                  "km",
                  "text"
                )}

                {renderInputField(
                  "offer_accept_seconds",
                  "Thời gian Chờ Cứu hộ viên Nhận ca (Offer Timeout)",
                  "Thời gian tối đa để cứu hộ viên xem xét ca SOS trước khi chuyển đợt tiếp theo",
                  "giây",
                  "number"
                )}

                {renderInputField(
                  "auto_cancel_inactive_minutes",
                  "Thời gian Tự hủy SOS Không tương tác",
                  "Thời gian chờ tối đa khi nạn nhân không hoạt động trước khi hệ thống tự hủy ca",
                  "phút",
                  "number"
                )}

                {renderInputField(
                  "chat_close_grace_minutes",
                  "Thời gian Gia hạn Kênh Chat Hậu Cứu hộ",
                  "Khoảng thời gian cho phép nhắn tin sau khi ca SOS chuyển sang Hoàn thành hoặc Hủy",
                  "phút",
                  "number"
                )}

                {renderInputField(
                  "retry_interval_seconds",
                  "Thời gian Lặp lại Mở rộng Bán kính",
                  "Thời gian giãn cách giữa các đợt tăng vòng bán kính quét vị trí",
                  "giây",
                  "number"
                )}

                {renderInputField(
                  "max_rescuers_per_attempt",
                  "Số Cứu hộ viên Tối đa Mỗi đợt Offer",
                  "Giới hạn số cứu hộ viên được ưu tiên gửi lời mời khẩn cấp cùng lúc",
                  "người",
                  "number"
                )}

                {renderInputField(
                  "rescuer_freshness_seconds",
                  "Ngưỡng Tọa độ GPS 'Mới Online'",
                  "Cứu hộ viên phải cập nhật GPS trong khoảng thời gian này để được coi là sẵn sàng",
                  "giây",
                  "number"
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GEOFENCING & HAZARD CLUSTERING */}
          {activeTab === "geofence" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PiWarningFill className="text-amber-500" />
                  <span>Cấu hình Cảnh báo Geofencing & Gom cụm Điểm nóng Tai nạn</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Thiết lập bán kính cảnh báo rủi ro xung quanh nạn nhân và ngưỡng tự động phát hiện vùng nguy hiểm
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField(
                  "geofence_high_radius",
                  "Bán kính Cảnh báo Geofencing cấp Cao (HIGH)",
                  "Khoảng cách geofence cảnh báo màu đỏ cho các vùng cực kỳ rủi ro",
                  "mét",
                  "number"
                )}

                {renderInputField(
                  "geofence_medium_radius",
                  "Bán kính Cảnh báo Geofencing cấp Trung bình (MEDIUM)",
                  "Khoảng cách geofence cảnh báo màu cam cho các điểm rủi ro vừa",
                  "mét",
                  "number"
                )}

                {renderInputField(
                  "geofence_low_radius",
                  "Bán kính Cảnh báo Geofencing cấp Thấp (LOW)",
                  "Khoảng cách geofence cảnh báo màu vàng cho các rủi ro chú ý",
                  "mét",
                  "number"
                )}

                {renderInputField(
                  "cluster_sos_threshold",
                  "Ngưỡng Ca SOS Tự động Gom cụm Điểm nóng",
                  "Số lượng ca SOS khẩn cấp tối thiểu để AI phát hiện và tự tạo vùng nguy hiểm mới",
                  "ca SOS",
                  "number"
                )}

                {renderInputField(
                  "cluster_sos_radius",
                  "Bán kính Quét Gom cụm Điểm nóng Tai nạn",
                  "Khoảng cách giữa các ca SOS để được gom chung vào một điểm rủi ro tập trung",
                  "mét",
                  "number"
                )}
              </div>
            </div>
          )}

          {/* TAB 3: HOTLINE & SYSTEM */}
          {activeTab === "hotline" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PiPhoneCallFill className="text-emerald-500" />
                  <span>Hotline Khẩn cấp Quốc gia & Số Tổng đài</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Cấu hình các số điện thoại gọi nhanh khẩn cấp hiển thị trên App Mobile Nạn nhân & Trang chủ
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField(
                  "hotline_medical",
                  "Hotline Cấp cứu Y tế Quốc gia",
                  "Số điện thoại tổng đài gọi nhanh cấp cứu y tế",
                  "",
                  "text"
                )}

                {renderInputField(
                  "hotline_fire",
                  "Hotline Chữa cháy & Cứu nạn Cứu hộ",
                  "Số điện thoại tổng đài gọi nhanh cứu hỏa",
                  "",
                  "text"
                )}

                {renderInputField(
                  "hotline_police",
                  "Hotline Cảnh sát & Trật tự Xã hội",
                  "Số điện thoại tổng đài gọi nhanh công an",
                  "",
                  "text"
                )}

                {renderInputField(
                  "hotline_emergency",
                  "Hotline Tìm kiếm Cứu nạn Quốc gia",
                  "Số điện thoại tổng đài cứu nạn khẩn cấp 24/7",
                  "",
                  "text"
                )}
              </div>

              {/* SECTION: HOTLINE BỔ SUNG DÙNG CHO ĐỊA PHƯƠNG/KHU VỰC */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <PiListPlusFill className="text-blue-500" />
                      <span>Danh sách Hotline bổ sung / Địa phương (Không giới hạn)</span>
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Thêm các số điện thoại cứu hộ giao thông, cứu trợ bão lũ địa phương để người dân gọi trực tiếp trên App
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCustomHotline}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <PiPlusBold size={14} />
                    <span>Thêm Hotline mới</span>
                  </button>
                </div>

                {getCustomHotlines().length === 0 ? (
                  <div className="p-6 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center">
                    <p className="text-xs text-gray-500 font-medium">Chưa có hotline bổ sung nào được cấu hình.</p>
                    <p className="text-[11px] text-gray-400 mt-1">Bấm nút "Thêm Hotline mới" ở trên để tạo thêm các số hotline cứu hộ khu vực.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCustomHotlines().map((item, index) => (
                      <div
                        key={item.id || index}
                        className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-700">Hotline bổ sung #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomHotline(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all"
                            title="Xóa hotline này"
                          >
                            <PiTrashFill size={16} />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Tên Hotline / Đơn vị
                            </label>
                            <input
                              type="text"
                              value={item.title || ""}
                              onChange={(e) => handleUpdateCustomHotline(item.id, "title", e.target.value)}
                              placeholder="Ví dụ: Cứu hộ giao thông Đã Nẵng"
                              className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Số điện thoại
                            </label>
                            <input
                              type="text"
                              value={item.phoneNumber || ""}
                              onChange={(e) => handleUpdateCustomHotline(item.id, "phoneNumber", e.target.value)}
                              placeholder="Ví dụ: 02363114114"
                              className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 bg-white focus:outline-none focus:border-blue-500 font-medium text-gray-900"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                              Mô tả ngắn
                            </label>
                            <input
                              type="text"
                              value={item.description || ""}
                              onChange={(e) => handleUpdateCustomHotline(item.id, "description", e.target.value)}
                              placeholder="Ví dụ: Đội xe kéo & ứng cứu 24/7"
                              className="w-full px-3 py-2 rounded-xl text-xs border border-gray-200 bg-white focus:outline-none focus:border-blue-500 text-gray-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: THESIS & APP */}
          {activeTab === "thesis" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PiStudentFill className="text-blue-500" />
                  <span>Thông tin Đồ án tốt nghiệp, Tác giả & Tải ứng dụng</span>
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Thông tin này hiển thị công khai trên trang giới thiệu (Landing Page) tại đường dẫn gốc của Website
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderInputField(
                  "thesis_author_name",
                  "Tên sinh viên thực hiện",
                  "Họ tên đầy đủ của tác giả đồ án tốt nghiệp",
                  "",
                  "text"
                )}

                {renderInputField(
                  "thesis_student_id",
                  "Mã số sinh viên",
                  "Mã số sinh viên (MSSV)",
                  "",
                  "text"
                )}

                {renderInputField(
                  "thesis_class",
                  "Lớp",
                  "Lớp học của sinh viên",
                  "",
                  "text"
                )}

                {renderInputField(
                  "thesis_school",
                  "Trường",
                  "Tên trường đại học/cao đẳng",
                  "",
                  "text"
                )}

                {renderInputField(
                  "thesis_supervisor",
                  "Giảng viên hướng dẫn",
                  "Tên giảng viên hướng dẫn đồ án",
                  "",
                  "text"
                )}

                {renderInputField(
                  "thesis_contact_email",
                  "Email liên hệ",
                  "Email để liên hệ về dự án",
                  "",
                  "email"
                )}

                {renderInputField(
                  "thesis_contact_phone",
                  "Số điện thoại liên hệ",
                  "Số điện thoại liên hệ về dự án",
                  "",
                  "text"
                )}
              </div>

              <div className="border-b border-gray-100 pb-4 pt-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <PiLinkSimple className="text-gray-500" size={16} />
                  <span>Liên kết & Tải ứng dụng</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderLinkField(
                  "thesis_github_url",
                  "Link Source code (GitHub)",
                  "Đường dẫn kho mã nguồn dự án trên GitHub",
                  "https://github.com/..."
                )}

                {renderLinkField(
                  "thesis_report_url",
                  "Link Báo cáo PDF",
                  "Đường dẫn file báo cáo đồ án tốt nghiệp (PDF)",
                  "https://..."
                )}

                {renderLinkField(
                  "app_apk_url",
                  "Link tải App (APK)",
                  "Đường dẫn file APK tải về (Google Drive, Mediafire...). Được dùng cho nút 'Tải ứng dụng Mobile' trên trang giới thiệu",
                  "https://..."
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingPage;