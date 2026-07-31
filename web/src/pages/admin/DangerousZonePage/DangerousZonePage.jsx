import React, { useEffect, useState, useCallback } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import { getDangerousZones, approveDangerousZone, rejectDangerousZone, autoDetectDangerousZones, getDangerousZoneFeedbacks, getPointFeedbacks } from '@/api/admin/DangerousZoneApi';
import {
  PiLightningFill,
  PiHourglassFill,
  PiShieldCheckFill,
  PiThumbsUpFill,
  PiFlagFill,
  PiCheckCircleFill,
  PiFireFill,
  PiXBold,
} from 'react-icons/pi';

const columns = ({ onApprove, onReject, onOpenFeedbacks, loading }) => [
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
    key: 'address',
    title: 'Địa chỉ',
    render: (row) => (
      <p className="text-xs text-gray-600 leading-relaxed max-w-[200px] line-clamp-2 overflow-hidden">
        {row.address || '--'}
      </p>
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
    title: 'Hành động',
    render: (row) => (
      <div className="flex items-center gap-2 whitespace-nowrap">
        {row.status === 'PENDING' && (
          <>
            <button
              onClick={() => onApprove(row.dangerousPointId)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              Duyệt
            </button>

            <button
              onClick={() => onReject(row.dangerousPointId)}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all active:scale-95 shadow-2xs cursor-pointer"
            >
              Từ chối
            </button>
          </>
        )}

        <button
          onClick={() => onOpenFeedbacks(row)}
          className="px-3 py-1.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-all cursor-pointer border border-gray-200"
        >
          Xác minh cộng đồng
        </button>
      </div>
    ),
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
      if (page === 1) {
        fetchDangerousZones();
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (dangerousPointId) => {
    try {
      setActionLoading(true);
      await rejectDangerousZone(dangerousPointId);
      if (page === 1) {
        fetchDangerousZones();
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
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

  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'feedbacks'
  const [feedbacks, setFeedbacks] = useState([]);
  const [selectedPointFeedbacks, setSelectedPointFeedbacks] = useState(null); // { point, stats, list }
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  const fetchFeedbacks = useCallback(async () => {
    try {
      setLoadingFeedbacks(true);
      const res = await getDangerousZoneFeedbacks(1, 20);
      setFeedbacks(res?.data?.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFeedbacks(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'feedbacks') {
      fetchFeedbacks();
    }
  }, [activeTab, fetchFeedbacks]);

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
                      <p className="text-xs text-gray-600 font-medium">Vùng nguy hiểm: <strong className="text-gray-900">{fb.zoneName}</strong> ({fb.address})</p>
                      {fb.comment && <p className="text-xs text-gray-700 bg-white dark:bg-gray-100 p-2 rounded-xl border border-gray-200 mt-1">"{fb.comment}"</p>}
                    </div>
                    <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{formatTime(fb.createdAt)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal Xem Phản hồi của 1 Điểm */}
      {selectedPointFeedbacks && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-gray-100 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Chi tiết Xác minh Cộng đồng</h3>
                <p className="text-xs text-gray-500">{selectedPointFeedbacks.point.zoneName}</p>
              </div>
              <button
                onClick={() => setSelectedPointFeedbacks(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 cursor-pointer flex items-center justify-center"
              >
                <PiXBold />
              </button>
            </div>

            {/* Thống kê nhanh */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="block font-bold text-emerald-700 text-base">{selectedPointFeedbacks.stats.verifyCount || 0}</span>
                <span className="flex items-center justify-center gap-1 text-emerald-800 font-medium"><PiThumbsUpFill size={12} /> Xác nhận thật</span>
              </div>
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-200">
                <span className="block font-bold text-rose-700 text-base">{selectedPointFeedbacks.stats.fakeCount || 0}</span>
                <span className="flex items-center justify-center gap-1 text-rose-800 font-medium"><PiFlagFill size={12} /> Báo giả mạo</span>
              </div>
              <div className="p-2 bg-blue-50 rounded-xl border border-blue-200">
                <span className="block font-bold text-blue-700 text-base">{selectedPointFeedbacks.stats.resolvedCount || 0}</span>
                <span className="flex items-center justify-center gap-1 text-blue-800 font-medium"><PiCheckCircleFill size={12} /> Báo đã an toàn</span>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="block font-bold text-amber-700 text-base">{selectedPointFeedbacks.stats.stillDangerousCount || 0}</span>
                <span className="flex items-center justify-center gap-1 text-amber-800 font-medium"><PiFireFill size={12} /> Vẫn nguy hiểm</span>
              </div>
            </div>

            {/* Danh sách phản hồi */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Danh sách ghi chú thực tế</h4>
              {selectedPointFeedbacks.list.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4">Chưa có phản hồi nào.</p>
              ) : (
                selectedPointFeedbacks.list.map((item) => (
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

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedPointFeedbacks(null)}
                className="px-4 py-2 bg-gray-900 text-white dark:bg-gray-200 dark:text-white rounded-xl text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-300 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangerousZonePage;
