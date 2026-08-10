import React, { useEffect, useState, useCallback } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import CellDetailComponent from '@/components/admin/TableComponent/CellDetailComponent/CellDetailComponent';
import { formatTime } from '@/utils/format_date.util';
import { getDangerousZones, approveDangerousZone, rejectDangerousZone, autoDetectDangerousZones, getDangerousZoneFeedbacks, updateDangerousZoneFeedbackStatusAdmin, getPointFeedbacks, getDuplicateDangerousZones, mergeDangerousZones } from '@/api/admin/DangerousZoneApi';
import {
  PiLightningFill,
  PiHourglassFill,
  PiShieldCheckFill,
  PiThumbsUpFill,
  PiFlagFill,
  PiCheckCircleFill,
  PiFireFill,
  PiXBold,
  PiXCircleFill,
  PiWarningBold,
  PiCheckCircleBold,
  PiCopyBold,
  PiGitMergeBold,
  PiCheckBold,
} from 'react-icons/pi';

const getErrorMessage = (error) => {
  return error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
};

const dangerLevelLabel = (level) =>
  level === 'HIGH' ? 'Cao' : level === 'MEDIUM' ? 'Trung bình' : 'Thấp';

const statusLabel = (status) =>
  status === 'PENDING' ? 'Chờ duyệt' : status === 'APPROVED' ? 'Đã duyệt' : 'Đã từ chối';

const dangerLevelBadge = (level) => (
  <span className={`inline-flex items-center justify-center whitespace-nowrap px-2.5 py-0.5 text-[11px] rounded-full font-semibold ${level === 'HIGH'
    ? 'bg-rose-50 text-rose-700 border border-rose-200'
    : level === 'MEDIUM'
      ? 'bg-amber-50 text-amber-700 border border-amber-200'
      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }`}>
    {dangerLevelLabel(level)}
  </span>
);

const columns = ({ onApprove, onReject, loading }) => [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-xs font-medium text-gray-400 text-center block">{index + 1}</span>
    ),
  },
  {
    key: 'zoneName',
    title: 'Tên khu vực',
    render: (row) => (
      <span className="font-semibold text-gray-900 text-sm leading-snug block max-w-[180px]">
        {row.zoneName || '--'}
      </span>
    ),
  },
  {
    key: 'description',
    title: 'Mô tả chi tiết',
    render: (row) => (
      <p className="text-xs text-gray-600 leading-relaxed max-w-[280px] line-clamp-2 overflow-hidden">
        {row.description || '--'}
      </p>
    ),
  },
  {
    key: 'dangerLevel',
    title: 'Mức độ nguy hiểm',
    render: (row) => {
      const levelLabel =
        row.dangerLevel === 'HIGH'
          ? 'Cao'
          : row.dangerLevel === 'MEDIUM'
            ? 'Trung bình'
            : 'Thấp';
      return (
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs rounded-full font-semibold shadow-2xs ${row.dangerLevel === 'HIGH'
            ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
            : row.dangerLevel === 'MEDIUM'
              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
            }`}
        >
          {levelLabel}
        </span>
      );
    },
  },
  {
    key: 'status',
    title: 'Trạng thái',
    render: (row) => {
      const statusLabel =
        row.status === 'PENDING'
          ? 'Chờ duyệt'
          : row.status === 'APPROVED'
            ? 'Đã duyệt'
            : 'Đã từ chối';
      return (
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs rounded-full font-semibold shadow-2xs ${row.status === 'PENDING'
            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
            : row.status === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
            }`}
        >
          {statusLabel}
        </span>
      );
    },
  },
  {
    key: 'reporterName',
    title: 'Người báo cáo',
    render: (row) => {
      const name = row.reporterName || '--';
      const isSystem = name.includes('Crowd-Sourced') || name.includes('Hệ thống');

      return (
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs rounded-full font-semibold border shadow-2xs ${isSystem
            ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-200 dark:text-white dark:border-gray-100'
            : 'bg-gray-100 text-gray-800 border-gray-200'
            }`}
        >
          <span>{name}</span>
        </span>
      );
    },
  },
  {
    key: 'createdAt',
    title: 'Ngày tạo',
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-gray-500 font-medium">
        {formatTime(row.createdAt)}
      </span>
    ),
  },
  {
    key: 'action',
    title: 'Thao tác',
    render: (row) => {
      if (row.status !== 'PENDING') return null;
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onApprove(row.dangerousPointId); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-all border border-emerald-200 disabled:opacity-50 cursor-pointer"
          >
            <PiCheckCircleFill size={14} />
            Duyệt
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onReject(row.dangerousPointId); }}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-all border border-rose-200 disabled:opacity-50 cursor-pointer"
          >
            <PiXCircleFill size={14} />
            Từ chối
          </button>
        </div>
      );
    },
  },
];

const DangerousZonePage = () => {
  const [dangerousZones, setDangerousZones] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleExpandRow = (key) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const fetchDangerousZones = useCallback(async () => {
    const limit = 10;
    try {
      setLoading(true);
      const response = await getDangerousZones(page, limit);
      setDangerousZones(response?.data?.data || []);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchDangerousZones();
  }, [fetchDangerousZones]);

  const handleApprove = async (dangerousPointId) => {
    try {
      setActionLoading(true);
      await approveDangerousZone(dangerousPointId);
      showToast("Đã duyệt điểm nguy hiểm thành công!");
      if (page === 1) {
        fetchDangerousZones();
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (dangerousPointId) => {
    try {
      setActionLoading(true);
      await rejectDangerousZone(dangerousPointId);
      showToast("Đã từ chối điểm nguy hiểm!");
      if (page === 1) {
        fetchDangerousZones();
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAutoDetect = async () => {
    try {
      setAutoDetecting(true);
      setDetectMsg(null);
      const res = await autoDetectDangerousZones();
      setDetectMsg(res?.message || 'Quét thành công!');
      fetchDangerousZones();
    } catch (error) {
      console.error(error);
      setDetectMsg('Có lỗi xảy ra khi quét tự động.');
    } finally {
      setAutoDetecting(false);
    }
  };

  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'feedbacks' | 'duplicates'
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedPointFeedbacks, setSelectedPointFeedbacks] = useState(null); // { point, stats, list }
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoadingFeedbacks(true);
      const res = await getDangerousZoneFeedbacks(1, 20);
      const list = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
      setFeedbacks(list);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  const handleResolveFeedback = async (feedbackId, status, action, dangerousPointId) => {
    try {
      setActionLoading(true);
      await updateDangerousZoneFeedbackStatusAdmin(feedbackId, { status, action, dangerousPointId });
      showToast(action === 'REJECT_POINT' ? 'Đã duyệt báo cáo & BAN điểm nguy hiểm!' : action === 'APPROVE_POINT' ? 'Đã phục hồi & duyệt lại điểm nguy hiểm!' : 'Đã bác bỏ báo cáo!');
      fetchFeedbacks();
      fetchDangerousZones();
    } catch (error) {
      console.error(error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchDuplicates = useCallback(async () => {
    try {
      setDuplicatesLoading(true);
      const res = await getDuplicateDangerousZones();
      setDuplicates(res?.data || []);
    } catch (error) {
      console.error(error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setDuplicatesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'feedbacks') {
      fetchFeedbacks();
    }
    if (activeTab === 'duplicates') {
      fetchDuplicates();
    }
  }, [activeTab, fetchFeedbacks, fetchDuplicates]);

  const handleMerge = async (primaryId, duplicateId) => {
    try {
      setActionLoading(true);
      await mergeDangerousZones(primaryId, duplicateId);
      showToast("Gộp điểm nguy hiểm trùng lặp thành công!");
      fetchDuplicates();
      fetchDangerousZones();
    } catch (error) {
      console.error(error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenPointFeedbacks = async (point) => {
    try {
      const res = await getPointFeedbacks(point.dangerousPointId);
      setSelectedPointFeedbacks({
        point,
        stats: res?.data?.stats || {},
        list: res?.data?.feedbacks || [],
      });
    } catch (error) {
      console.error("Fetch point feedbacks error:", error);
    }
  };

  const systemDetectedCount = dangerousZones.filter(
    (item) => item.reporterName === 'Hệ thống' || !item.reportedBy
  ).length;
  const pendingCount = dangerousZones.filter((item) => item.status === 'PENDING').length;

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-xl border transition-all animate-bounce ${toastMessage.type === "error"
            ? "bg-red-900 text-white border-red-800"
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý điểm nguy hiểm</h1>
          <p className="text-sm text-gray-500 mt-0.5">Duyệt các vị trí rủi ro báo cáo bởi người dùng hoặc hệ thống tự phát hiện (Crowd-Sourced)</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200">
            <button
              onClick={() => setActiveTab('points')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'points' ? 'bg-gray-900 text-white shadow-sm dark:bg-gray-200 dark:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Danh sách Điểm
            </button>
            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'feedbacks' ? 'bg-gray-900 text-white shadow-sm dark:bg-gray-200 dark:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Phản hồi & Xác minh Cộng đồng
            </button>
            <button
              onClick={() => setActiveTab('duplicates')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${activeTab === 'duplicates' ? 'bg-gray-900 text-white shadow-sm dark:bg-gray-200 dark:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <PiCopyBold />
              Nghi Ngờ Trùng Lặp
              {duplicates.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">
                  {duplicates.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleAutoDetect}
            disabled={autoDetecting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white rounded-2xl font-medium shadow-sm transition-all disabled:opacity-50 text-sm cursor-pointer"
          >
            <PiLightningFill className="text-amber-400 text-base" />
            {autoDetecting ? "Đang phân tích gom cụm..." : "Quét cụm SOS tự động"}
          </button>
        </div>
      </div>

      {/* Thẻ thống kê tổng quan */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-lg">
            <PiHourglassFill size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Chờ kiểm duyệt</p>
            <p className="text-xl font-bold text-gray-900">{pendingCount} điểm</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-lg">
            <PiLightningFill size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Hệ thống tự gom cụm SOS</p>
            <p className="text-xl font-bold text-gray-900">{systemDetectedCount} điểm</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg">
            <PiShieldCheckFill size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Tổng điểm vùng nguy hiểm</p>
            <p className="text-xl font-bold text-gray-900">{dangerousZones.length} điểm</p>
          </div>
        </div>
      </div>

      {detectMsg && (
        <div className="px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 text-gray-900 text-sm flex items-center justify-between shadow-xs">
          <span>{detectMsg}</span>
          <button onClick={() => setDetectMsg(null)} className="text-gray-500 hover:text-gray-700 font-bold ml-4 cursor-pointer"><PiXBold /></button>
        </div>
      )}

      {activeTab === 'points' ? (
        <TableComponent
          columns={columns({
            onApprove: handleApprove,
            onReject: handleReject,
            onOpenFeedbacks: handleOpenPointFeedbacks,
            expandedRows,
            onToggleExpand: toggleExpandRow,
            loading: actionLoading,
          })}
          data={dangerousZones}
          rowKey="dangerousPointId"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
        />
      ) : activeTab === 'duplicates' ? (
        <div className="bg-white dark:bg-gray-100 rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PiCopyBold className="text-amber-600 text-lg" />
                Danh sách Cụm Điểm Nguy hiểm Nghi ngờ Trùng lặp ({duplicates.length})
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tự động phân tích theo khoảng cách GPS (bán kính 200m) để tránh trùng lặp địa điểm
              </p>
            </div>
            <button
              onClick={fetchDuplicates}
              disabled={duplicatesLoading}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              {duplicatesLoading ? 'Đang quét...' : 'Quét lại trùng lặp'}
            </button>
          </div>

          {duplicatesLoading ? (
            <div className="py-12 text-center text-xs text-gray-500 font-medium">
              Đang phân tích không gian & quét dữ liệu trùng lặp...
            </div>
          ) : duplicates.length === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <PiCheckBold className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-gray-800">Không phát hiện điểm nguy hiểm nào nghi ngờ trùng lặp!</p>
              <p className="text-xs text-gray-500">Toàn bộ dữ liệu bản đồ khu vực nguy hiểm hiện tại đều duy nhất và sạch.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {duplicates.map((pair, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200">
                      <PiWarningBold className="text-amber-600" />
                      {pair.matchReason}
                    </span>
                    <span className="text-xs font-mono text-gray-500">
                      Khoảng cách: {pair.distanceMeters} m
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-gray-100 p-3.5 rounded-xl border border-emerald-200/80 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                          Bản ghi A (Gốc)
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {statusLabel(pair.primary.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 flex-1">{pair.primary.zoneName || '--'}</p>
                        {dangerLevelBadge(pair.primary.dangerLevel)}
                      </div>
                      <p className="text-xs text-gray-600 font-mono">
                        GPS: {pair.primary.latitude.toFixed(4)}, {pair.primary.longitude.toFixed(4)}
                      </p>
                      {pair.primary.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{pair.primary.description}</p>
                      )}
                      {pair.primary.imageUrl && (
                        <img
                          src={pair.primary.imageUrl}
                          alt="Ảnh A"
                          className="h-20 w-full object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <button
                        onClick={() => handleMerge(pair.primary.dangerousPointId, pair.duplicate.dangerousPointId)}
                        disabled={actionLoading}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <PiGitMergeBold className="text-sm" />
                        Giữ A & Gộp B vào A
                      </button>
                    </div>

                    <div className="bg-white dark:bg-gray-100 p-3.5 rounded-xl border border-rose-200/80 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                          Bản ghi B (Nghi trùng)
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {statusLabel(pair.duplicate.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-900 flex-1">{pair.duplicate.zoneName || '--'}</p>
                        {dangerLevelBadge(pair.duplicate.dangerLevel)}
                      </div>
                      <p className="text-xs text-gray-600 font-mono">
                        GPS: {pair.duplicate.latitude.toFixed(4)}, {pair.duplicate.longitude.toFixed(4)}
                      </p>
                      {pair.duplicate.description && (
                        <p className="text-xs text-gray-500 line-clamp-2">{pair.duplicate.description}</p>
                      )}
                      {pair.duplicate.imageUrl && (
                        <img
                          src={pair.duplicate.imageUrl}
                          alt="Ảnh B"
                          className="h-20 w-full object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <button
                        onClick={() => handleMerge(pair.duplicate.dangerousPointId, pair.primary.dangerousPointId)}
                        disabled={actionLoading}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                      >
                        <PiGitMergeBold className="text-sm" />
                        Giữ B & Gộp A vào B
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-100 rounded-3xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Danh sách Phản hồi Xác minh từ Người dùng & Cứu hộ viên</h2>
          {loadingFeedbacks ? (
            <p className="text-sm text-gray-500 text-center py-8">Đang tải phản hồi...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Chưa có phản hồi xác minh nào từ người dùng.</p>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((fb) => {
                const typeLabels = {
                  VERIFY_REAL: { text: 'Xác nhận có thật', icon: PiThumbsUpFill, style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                  REPORT_FAKE: { text: 'Báo cáo giả mạo', icon: PiFlagFill, style: 'bg-rose-50 text-rose-700 border-rose-200' },
                  MARKED_RESOLVED: { text: 'Báo đã an toàn', icon: PiCheckCircleFill, style: 'bg-blue-50 text-blue-700 border-blue-200' },
                  STILL_DANGEROUS: { text: 'Xác nhận nguy hiểm', icon: PiFireFill, style: 'bg-amber-50 text-amber-700 border-amber-200' },
                };
                const finalType = typeLabels[fb.feedbackType] || { text: fb.feedbackType, icon: null, style: 'bg-gray-50 text-gray-700 border-gray-200' };

                return (
                  <div key={fb.feedbackId} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">{fb.userName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">{fb.userRole}</span>
                        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-semibold border ${finalType.style}`}>
                          {finalType.icon && <finalType.icon size={12} />}
                          {finalType.text}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">Vùng nguy hiểm: <strong className="text-gray-900">{fb.zoneName}</strong></p>
                      {fb.comment && <p className="text-xs text-gray-700 bg-white dark:bg-gray-100 p-2 rounded-xl border border-gray-200 mt-1">"{fb.comment}"</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{formatTime(fb.createdAt)}</span>
                      <div className="flex items-center gap-1.5 ml-2">
                        {fb.pointStatus === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => handleResolveFeedback(fb.feedbackId, 'RESOLVED', 'REJECT_POINT', fb.dangerousPointId)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
                              title="Duyệt báo cáo & BAN điểm nguy hiểm này"
                            >
                              Duyệt báo cáo (Ban điểm)
                            </button>
                            <button
                              onClick={() => handleResolveFeedback(fb.feedbackId, 'DISMISSED', 'DISMISS', fb.dangerousPointId)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
                              title="Bác bỏ báo cáo & giữ điểm hoạt động bình thường"
                            >
                              Bác bỏ (Giữ điểm)
                            </button>
                          </>
                        ) : fb.pointStatus === 'REJECTED' ? (
                          <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold">
                            Đã xử lý (Đã ban điểm)
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
                            Đã xử lý (Đã bác bỏ)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Drawer Xem Phản hồi của 1 Điểm */}
      <CellDetailComponent
        open={!!selectedPointFeedbacks}
        onClose={() => setSelectedPointFeedbacks(null)}
        title="Chi tiết Xác minh Cộng đồng"
        subtitle={selectedPointFeedbacks ? selectedPointFeedbacks.point.zoneName : undefined}
      >
        {/* Thống kê nhanh */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="block font-bold text-emerald-700 text-base">{selectedPointFeedbacks?.stats.verifyCount || 0}</span>
            <span className="flex items-center justify-center gap-1 text-emerald-800 font-medium"><PiThumbsUpFill size={12} /> Xác nhận thật</span>
          </div>
          <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
            <span className="block font-bold text-rose-700 text-base">{selectedPointFeedbacks?.stats.fakeCount || 0}</span>
            <span className="flex items-center justify-center gap-1 text-rose-800 font-medium"><PiFlagFill size={12} /> Báo giả mạo</span>
          </div>
          <div className="p-2 bg-blue-50 rounded-xl border border-blue-200">
            <span className="block font-bold text-blue-700 text-base">{selectedPointFeedbacks?.stats.resolvedCount || 0}</span>
            <span className="flex items-center justify-center gap-1 text-blue-800 font-medium"><PiCheckCircleFill size={12} /> Báo đã an toàn</span>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
            <span className="block font-bold text-amber-700 text-base">{selectedPointFeedbacks?.stats.stillDangerousCount || 0}</span>
            <span className="flex items-center justify-center gap-1 text-amber-800 font-medium"><PiFireFill size={12} /> Vẫn nguy hiểm</span>
          </div>
        </div>

        {/* Danh sách phản hồi */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Danh sách ghi chú thực tế</h4>
          {selectedPointFeedbacks?.list.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">Chưa có phản hồi nào.</p>
          ) : (
            selectedPointFeedbacks?.list.map((item) => (
              <div key={item.feedbackId} className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">{item.userName} ({item.userRole})</span>
                  <span className="text-gray-400">{formatTime(item.createdAt)}</span>
                </div>
                {item.comment ? (
                  <p className="text-gray-700 italic">"{item.comment}"</p>
                ) : (
                  <p className="text-gray-400 italic">(Không có ghi chú thêm)</p>
                )}
              </div>
            ))
          )}
        </div>
      </CellDetailComponent>
    </div>
  );
};

export default DangerousZonePage;
