import React, { useEffect, useState, useCallback } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import { getAiModerationLogs, reviewAiModerationLog } from '@/api/admin/AiModerationApi';
import { PiRobotFill, PiWarningFill, PiCheckCircleFill, PiFunnelFill, PiArrowsClockwiseFill } from 'react-icons/pi';

const categoryBadgeStyles = {
  'Y TẾ': 'bg-rose-50 text-rose-700 border-rose-200',
  'TAI NẠN GIAO THÔNG': 'bg-amber-50 text-amber-700 border-amber-200',
  'HỎNG XE': 'bg-blue-50 text-blue-700 border-blue-200',
  'NGẬP LỤT/CỨU HỘ': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'SPAM/LỪA ĐẢO': 'bg-red-100 text-red-800 border-red-300 font-bold',
  'KHÁC': 'bg-gray-100 text-gray-700 border-gray-200'
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
    setUpdatingId(logId);
    try {
      const res = await reviewAiModerationLog(logId, action);
      if (res?.success) {
        setLogs((prev) =>
          prev.map((item) => (item.logId === logId ? { ...item, actionTaken: action } : item))
        );
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
      title: 'Loại thực thể',
      render: (row) => (
        <div>
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-900 text-white">
            {row.entityType}
          </span>
          <span className="block text-[11px] text-gray-400 mt-1 font-mono">
            {row.entityId ? `${row.entityId.substring(0, 8)}...` : '--'}
          </span>
        </div>
      )
    },
    {
      key: 'suggestedCategory',
      title: 'Phân loại AI',
      render: (row) => {
        const style = categoryBadgeStyles[row.suggestedCategory] || categoryBadgeStyles['KHÁC'];
        return (
          <div className="flex flex-col gap-1 items-start">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
              {row.suggestedCategory || 'KHÁC'}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Độ tin cậy: {Math.round((row.aiScore || 0) * 100)}%
            </span>
          </div>
        );
      }
    },
    {
      key: 'isFlagged',
      title: 'Trạng thái AI',
      render: (row) => (
        <div>
          {row.isFlagged ? (
            <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
              <PiWarningFill size={16} />
              <span className="text-xs font-semibold">Bị cắm cờ Spam / Bất thường</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <PiCheckCircleFill size={16} />
              <span className="text-xs font-medium">An toàn</span>
            </div>
          )}
          {row.flagReason && (
            <p className="text-[11px] text-rose-500 mt-1 italic leading-tight max-w-[220px]">
              "{row.flagReason}"
            </p>
          )}
        </div>
      )
    },
    {
      key: 'actionTaken',
      title: 'Xử lý của Admin',
      render: (row) => {
        const style = actionBadgeStyles[row.actionTaken] || actionBadgeStyles.NONE;
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${style}`}>
            {actionLabels[row.actionTaken] || row.actionTaken}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      title: 'Thời gian phân tích',
      render: (row) => (
        <span className="text-xs text-gray-500">{formatTime(row.createdAt)}</span>
      )
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReview(row.logId, 'APPROVED')}
            disabled={updatingId === row.logId || row.actionTaken === 'APPROVED'}
            className="px-3 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-medium transition-all disabled:opacity-40 cursor-pointer active:scale-95"
          >
            Duyệt
          </button>
          <button
            onClick={() => handleReview(row.logId, 'DISMISSED')}
            disabled={updatingId === row.logId || row.actionTaken === 'DISMISSED'}
            className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-all disabled:opacity-40 cursor-pointer active:scale-95 border border-gray-200"
          >
            Bác bỏ
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-md shrink-0">
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
      <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-4">
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
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-2">
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
    </div>
  );
};

export default AIModerationPage;
