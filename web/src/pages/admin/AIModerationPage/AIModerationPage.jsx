import React, { useEffect, useState, useCallback } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import { getAiModerationLogs, reviewAiModerationLog } from '@/api/admin/AiModerationApi';
import {
  PiRobotFill,
  PiWarningFill,
  PiCheckCircleFill,
  PiFunnelFill,
  PiArrowsClockwiseFill,
  PiEyeFill,
  PiXFill,
  PiUserFill,
  PiArticleFill
} from 'react-icons/pi';

const getViolatingPhrasesList = (phrasesData) => {
  if (!phrasesData) return [];
  if (Array.isArray(phrasesData)) return phrasesData;
  try {
    return JSON.parse(phrasesData);
  } catch {
    return [phrasesData];
  }
};

const actionBadgeStyles = {
  NONE: 'bg-gray-100 text-gray-600',
  APPROVED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  REQUIRES_ADMIN_REVIEW: 'bg-amber-50 text-amber-700 border border-amber-200',
  AUTO_BLOCKED: 'bg-rose-50 text-rose-700 border border-rose-200',
  DISMISSED: 'bg-gray-50 text-gray-500 border border-gray-200'
};

const actionLabels = {
  NONE: 'Chưa xử lý',
  APPROVED: 'Đã duyệt',
  REQUIRES_ADMIN_REVIEW: 'Chờ xem xét',
  AUTO_BLOCKED: 'Đã tự động chặn',
  DISMISSED: 'Bác bỏ cờ'
};

const AIModerationPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [entityType, setEntityType] = useState('');
  const [isFlagged, setIsFlagged] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        entityType: entityType || undefined,
        isFlagged: isFlagged !== '' ? isFlagged : undefined,
        actionTaken: actionTaken || undefined
      };
      const res = await getAiModerationLogs(params);
      if (res?.success) {
        setLogs(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (error) {
      console.error('Fetch AI Moderation logs error:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, entityType, isFlagged, actionTaken]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleReview = async (logId, action) => {
    if (!logId) {
      console.error('Missing logId for review');
      return;
    }
    setUpdatingId(logId);
    try {
      const res = await reviewAiModerationLog(logId, action);
      if (res?.success && res.data) {
        setLogs((prev) =>
          prev.map((item) => ((item.logId || item.log_id) === logId ? { ...item, ...res.data } : item))
        );
        if (selectedLog && (selectedLog.logId || selectedLog.log_id) === logId) {
          setSelectedLog((prev) => prev ? { ...prev, ...res.data } : null);
        }
      }
    } catch (error) {
      console.error('Review log error:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = [
    {
      key: 'index',
      title: 'STT',
      render: (_, index) => (
        <span className="text-xs font-medium text-gray-400 text-center block">
          {(pagination.page - 1) * pagination.limit + index + 1}
        </span>
      )
    },
    {
      key: 'entityType',
      title: 'Thực thể',
      render: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-900 text-white dark:bg-gray-200 dark:text-white whitespace-nowrap">
          {row.entityType}
        </span>
      )
    },
    {
      key: 'textContent',
      title: 'Nội dung',
      render: (row) => (
        <div className="max-w-[200px] truncate" title={row.textContent}>
          <span className="text-xs text-gray-800 font-medium truncate block">
            {row.textContent || <span className="text-gray-400 italic">Không có mô tả</span>}
          </span>
        </div>
      )
    },
    {
      key: 'isFlagged',
      title: 'Trạng thái AI',
      render: (row) => (
        <div>
          {row.isFlagged ? (
            <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-rose-200 whitespace-nowrap">
              <PiWarningFill size={13} />
              <span>Vi phạm</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-medium border border-emerald-200 whitespace-nowrap">
              <PiCheckCircleFill size={13} />
              <span>An toàn</span>
            </span>
          )}
        </div>
      )
    },
    {
      key: 'actionTaken',
      title: 'Admin xử lý',
      render: (row) => {
        const style = actionBadgeStyles[row.actionTaken] || actionBadgeStyles.NONE;
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${style}`}>
            {actionLabels[row.actionTaken] || row.actionTaken}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Thời gian',
      render: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(row.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      title: 'Hành động',
      render: (row) => {
        const currentLogId = row.logId || row.log_id;
        const isUpdating = Boolean(updatingId && currentLogId && updatingId === currentLogId);

        return (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <button
              onClick={() => setSelectedLog(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium transition-all cursor-pointer border border-gray-200 active:scale-95"
              title="Xem chi tiết phân tích"
            >
              <PiEyeFill size={14} />
              <span>Chi tiết</span>
            </button>

            <button
              onClick={() => handleReview(currentLogId, 'APPROVED')}
              disabled={isUpdating || row.actionTaken === 'APPROVED'}
              className="px-2.5 py-1 rounded-xl bg-rose-900 hover:bg-rose-800 text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer active:scale-95 shadow-2xs"
            >
              Vi phạm
            </button>

            <button
              onClick={() => handleReview(currentLogId, 'DISMISSED')}
              disabled={isUpdating || row.actionTaken === 'DISMISSED'}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-all disabled:opacity-40 cursor-pointer active:scale-95 border border-emerald-200"
            >
              An toàn
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-100 p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white flex items-center justify-center shadow-md shrink-0">
            <PiRobotFill size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              AI Phân loại & Kiểm duyệt Nội dung
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Tự động nhận diện chủ đề, đánh giá độ tin cậy và cắm cờ các nội dung báo cáo nghi ngờ/spam
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchLogs(pagination.page)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-2xl border border-gray-200 transition-all cursor-pointer active:scale-95 self-start md:self-auto"
        >
          <PiArrowsClockwiseFill size={16} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white dark:bg-gray-100 p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-gray-900 font-semibold text-sm">
          <PiFunnelFill size={18} />
          <span>Bộ lọc thông minh</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Loại thực thể</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:border-gray-900 transition-all"
            >
              <option value="">Tất cả thực thể</option>
              <option value="SOS_REQUEST">Yêu cầu SOS (SOS_REQUEST)</option>
              <option value="AMENITY_FEEDBACK">Phản hồi Tiện ích (AMENITY_FEEDBACK)</option>
              <option value="DANGEROUS_POINT">Điểm nguy hiểm (DANGEROUS_POINT)</option>
              <option value="MESSAGE">Tin nhắn (MESSAGE)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Trạng thái Cắm cờ AI</label>
            <select
              value={isFlagged}
              onChange={(e) => setIsFlagged(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:border-gray-900 transition-all"
            >
              <option value="">Tất cả</option>
              <option value="true">Chỉ xem nội dung bị Cắm cờ (Spam/Lừa đảo)</option>
              <option value="false">Nội dung an toàn</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Hành động của Admin</label>
            <select
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2 text-xs text-gray-900 font-medium focus:outline-none focus:border-gray-900 transition-all"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="NONE">Chưa xử lý</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REQUIRES_ADMIN_REVIEW">Chờ xem xét</option>
              <option value="DISMISSED">Đã bác bỏ cờ</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-gray-100 rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-2">
        <TableComponent
          columns={columns}
          data={logs}
          loading={loading}
          pagination={{
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: pagination.totalPages,
            onChange: (p) => fetchLogs(p)
          }}
        />
      </div>

      {/* MODAL CHI TIẾT KIỂM DUYỆT AI */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-xs p-4 dark:bg-black/60">
          <div className="bg-white dark:bg-gray-100 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-xl border border-gray-200 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white flex items-center justify-center shrink-0 shadow-sm">
                  <PiRobotFill size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Chi tiết Phân tích & Kiểm duyệt AI</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Log ID: {selectedLog.logId}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
              >
                <PiXFill size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              {/* Thực thể & Thời gian */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                <div>
                  <span className="text-gray-400 block mb-1 font-medium">Loại thực thể</span>
                  <span className="font-semibold text-gray-900 bg-white dark:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 inline-block">
                    {selectedLog.entityType}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1 font-medium">Entity ID</span>
                  <span className="font-mono text-gray-700 bg-white dark:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200 inline-block truncate max-w-full">
                    {selectedLog.entityId || '--'}
                  </span>
                </div>
              </div>

              {/* Văn bản phân tích gốc */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                  <PiArticleFill size={16} className="text-gray-500" />
                  <span>Nội dung văn bản được phân tích:</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-gray-800 font-medium leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                  {selectedLog.textContent || <span className="text-gray-400 italic">Không có văn bản mô tả</span>}
                </div>
              </div>

              {/* Phân loại AI & Đánh giá */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium block">Cụm từ vi phạm nhạy cảm</span>
                  {getViolatingPhrasesList(selectedLog.violatingPhrases).length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {getViolatingPhrasesList(selectedLog.violatingPhrases).map((phrase, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {phrase}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600">Phát hiện vi phạm tiêu chuẩn cộng đồng</span>
                  )}
                  <p className="text-[11px] text-gray-500 mt-1">
                    Độ tin cậy AI: <span className="font-bold text-gray-800">{Math.round((selectedLog.aiScore || 0) * 100)}%</span>
                  </p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
                  <span className="text-gray-400 font-medium block">Cắm cờ bất thường</span>
                  {selectedLog.isFlagged ? (
                    <div className="text-rose-600 font-semibold flex items-center gap-1">
                      <PiWarningFill size={16} />
                      <span>Bị cắm cờ (Spam/Phá hoại)</span>
                    </div>
                  ) : (
                    <div className="text-emerald-600 font-medium flex items-center gap-1">
                      <PiCheckCircleFill size={16} />
                      <span>Nội dung an toàn</span>
                    </div>
                  )}
                  {selectedLog.flagReason && (
                    <p className="text-[11px] text-rose-500 italic mt-1 leading-tight">
                      Lý do: "{selectedLog.flagReason}"
                    </p>
                  )}
                </div>
              </div>

              {/* Trạng thái Admin duyệt */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-gray-400 font-medium block mb-1">Xử lý của Quản trị viên</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${actionBadgeStyles[selectedLog.actionTaken] || actionBadgeStyles.NONE}`}>
                    {actionLabels[selectedLog.actionTaken] || selectedLog.actionTaken}
                  </span>
                </div>
                {selectedLog.reviewerName && (
                  <div className="text-right">
                    <span className="text-gray-400 font-medium block mb-1">Người duyệt</span>
                    <span className="font-semibold text-gray-800 flex items-center gap-1 justify-end">
                      <PiUserFill size={14} className="text-gray-500" />
                      {selectedLog.reviewerName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-all border border-gray-200 cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => handleReview(selectedLog.logId, 'DISMISSED')}
                disabled={updatingId === selectedLog.logId || selectedLog.actionTaken === 'DISMISSED'}
                className="px-4 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all border border-emerald-200 disabled:opacity-40 cursor-pointer"
              >
                An toàn
              </button>
              <button
                onClick={() => handleReview(selectedLog.logId, 'APPROVED')}
                disabled={updatingId === selectedLog.logId || selectedLog.actionTaken === 'APPROVED'}
                className="px-4 py-2 rounded-2xl bg-rose-900 hover:bg-rose-800 text-white text-xs font-semibold transition-all disabled:opacity-40 cursor-pointer shadow-sm"
              >
                Vi phạm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIModerationPage;
