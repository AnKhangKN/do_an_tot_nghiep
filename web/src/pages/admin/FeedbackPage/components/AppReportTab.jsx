import React, { useState, useEffect, useCallback } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import CellDetailComponent from '@/components/admin/TableComponent/CellDetailComponent/CellDetailComponent';
import AddUpdateModelComponent from '@/components/admin/AddUpdateModelComponent/AddUpdateModelComponent';
import { getAppFeedbacksAdmin, getAppFeedbackStatsAdmin, updateAppFeedbackStatusAdmin } from '@/api/admin/AppFeedbackApi';
import { formatTime } from '@/utils/format_date.util';
import {
  PiFlag,
  PiClockCountdown,
  PiGearSix,
  PiCheckCircle,
  PiXCircle,
  PiEye,
  PiPencilLine,
  PiBug,
  PiLightbulb,
  PiWarningCircle,
  PiChatCircleText,
  PiWarning,
} from 'react-icons/pi';

const CATEGORY_META = {
  BUG: { label: 'Lỗi ứng dụng', className: 'bg-red-50 text-red-700 border-red-200', icon: <PiBug size={12} /> },
  SUGGESTION: { label: 'Góp ý cải tiến', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <PiLightbulb size={12} /> },
  CONTENT: { label: 'Nội dung không phù hợp', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: <PiWarningCircle size={12} /> },
  OTHER: { label: 'Khác', className: 'bg-gray-100 text-gray-600 border-gray-200', icon: <PiChatCircleText size={12} /> },
};

const STATUS_META = {
  PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  IN_PROGRESS: { label: 'Đang xử lý', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  RESOLVED: { label: 'Đã xử lý', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REJECTED: { label: 'Từ chối', className: 'bg-red-50 text-red-700 border-red-200' },
};

const CategoryBadge = ({ category }) => {
  const meta = CATEGORY_META[category] || CATEGORY_META.OTHER;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${meta.className}`}>
      {meta.icon}
      {meta.label}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || STATUS_META.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${meta.className}`}>
      {status === 'PENDING' && <PiClockCountdown size={12} />}
      {status === 'IN_PROGRESS' && <PiGearSix size={12} />}
      {status === 'RESOLVED' && <PiCheckCircle size={12} />}
      {status === 'REJECTED' && <PiXCircle size={12} />}
      {meta.label}
    </span>
  );
};

const AppReportTab = () => {
  const [reports, setReports] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 });
  const LIMIT = 10;

  const [selectedReport, setSelectedReport] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [statusOption, setStatusOption] = useState('PENDING');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      const response = await getAppFeedbackStatsAdmin();
      if (response?.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Lỗi lấy thống kê báo cáo ứng dụng:', error);
    }
  }, []);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAppFeedbacksAdmin(
        page,
        LIMIT,
        statusFilter || undefined,
        categoryFilter || undefined,
        search || undefined
      );
      if (response?.success) {
        setReports(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
        setTotal(response.data.total ?? 0);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách báo cáo ứng dụng:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, categoryFilter, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSubmit = async () => {
    if (!actionModal) return;
    setActionError('');
    if (statusOption === 'REJECTED' && !adminNote.trim()) {
      setActionError('Vui lòng nhập ghi chú khi từ chối báo cáo!');
      return;
    }
    setActionLoading(true);
    try {
      await updateAppFeedbackStatusAdmin(actionModal.feedback_id, statusOption, adminNote.trim());
      setActionModal(null);
      setAdminNote('');
      setStatusOption('PENDING');
      setSelectedReport(null);
      fetchReports();
      fetchStats();
    } catch (error) {
      setActionError(error?.response?.data?.message || 'Cập nhật trạng thái thất bại!');
    } finally {
      setActionLoading(false);
    }
  };

  const StatCard = ({ icon, iconClass, label, value }) => (
    <div className="bg-white dark:bg-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${iconClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  const columns = [
    {
      key: 'index',
      title: 'STT',
      render: (_, index) => (
        <span className="text-xs font-medium text-gray-400">{(page - 1) * LIMIT + index + 1}</span>
      ),
    },
    {
      key: 'user',
      title: 'Người gửi',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-gray-900 text-xs truncate">{row.user_name || 'N/A'}</span>
          <span className="text-[11px] text-gray-400 truncate">{row.user_email || '—'}</span>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Danh mục',
      render: (row) => <CategoryBadge category={row.category} />,
    },
    {
      key: 'title',
      title: 'Tiêu đề',
      dataIndex: 'title',
      render: (row) => (
        <span className="text-xs font-medium text-gray-900 truncate max-w-[160px] block" title={row.title}>
          {row.title}
        </span>
      ),
    },
    {
      key: 'content',
      title: 'Nội dung',
      render: (row) => (
        <p className="text-xs text-gray-600 line-clamp-2 max-w-[240px]" title={row.content}>
          {row.content}
        </p>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      title: 'Thời gian',
      render: (row) => (
        <span className="text-xs text-gray-500 whitespace-nowrap">{formatTime(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedReport(row)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 text-[11px] font-semibold transition-colors"
          >
            <PiEye size={13} /> Chi tiết
          </button>
          <button
            onClick={() => {
              setActionModal(row);
              setStatusOption(row.status || 'PENDING');
              setAdminNote(row.admin_note || '');
              setActionError('');
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-[11px] font-semibold transition-colors"
          >
            <PiPencilLine size={13} /> Xử lý
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={<PiFlag size={20} />} iconClass="bg-gray-100 text-gray-700" label="Tổng báo cáo" value={stats.total ?? 0} />
        <StatCard icon={<PiClockCountdown size={20} />} iconClass="bg-yellow-50 text-yellow-600" label="Chờ xử lý" value={stats.pending ?? 0} />
        <StatCard icon={<PiGearSix size={20} />} iconClass="bg-blue-50 text-blue-600" label="Đang xử lý" value={stats.in_progress ?? 0} />
        <StatCard icon={<PiCheckCircle size={20} />} iconClass="bg-emerald-50 text-emerald-600" label="Đã xử lý" value={stats.resolved ?? 0} />
        <StatCard icon={<PiXCircle size={20} />} iconClass="bg-red-50 text-red-600" label="Từ chối" value={stats.rejected ?? 0} />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-gray-100 p-3 rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-xs font-semibold text-gray-700">Lọc:</span>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setSearch(searchInput.trim());
                setPage(1);
              }
            }}
            placeholder="Tìm kiếm tiêu đề, nội dung, người gửi..."
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900 w-56"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="RESOLVED">Đã xử lý</option>
            <option value="REJECTED">Từ chối</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Tất cả danh mục</option>
            <option value="BUG">Lỗi ứng dụng</option>
            <option value="SUGGESTION">Góp ý cải tiến</option>
            <option value="CONTENT">Nội dung không phù hợp</option>
            <option value="OTHER">Khác</option>
          </select>
        </div>
      </div>

      <TableComponent
        columns={columns}
        data={reports}
        rowKey="feedback_id"
        pagination={{
          page,
          limit: LIMIT,
          total,
          totalPages,
          onChange: (p) => setPage(p),
        }}
        loading={loading}
      />

      {/* Detail Drawer */}
      <CellDetailComponent
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title="Chi tiết báo cáo ứng dụng"
        subtitle={selectedReport ? `Báo cáo từ ${selectedReport.user_name || 'N/A'}` : undefined}
        actions={[
          {
            key: 'handle',
            label: 'Xử lý báo cáo',
            variant: 'primary',
            onClick: () => {
              setActionModal(selectedReport);
              setStatusOption(selectedReport.status || 'PENDING');
              setAdminNote(selectedReport.admin_note || '');
              setActionError('');
            },
          },
        ]}
      >
        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
            <CategoryBadge category={selectedReport?.category} />
            <StatusBadge status={selectedReport?.status} />
          </div>

          <div className="space-y-1.5">
            <span className="text-gray-400 font-medium block">Tiêu đề</span>
            <p className="text-sm font-semibold text-gray-900 bg-white dark:bg-gray-100 border border-gray-200 rounded-2xl px-4 py-3">
              {selectedReport?.title}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-gray-400 font-medium block">Nội dung báo cáo</span>
            <p className="text-gray-800 font-medium leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-2xl p-4">
              {selectedReport?.content}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-medium block">Thời gian gửi</span>
              <span className="font-semibold text-gray-800">{formatTime(selectedReport?.created_at)}</span>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-gray-400 font-medium block">Người gửi</span>
              <span className="font-semibold text-gray-800">{selectedReport?.user_name || 'N/A'}</span>
              <span className="text-[11px] text-gray-500 block truncate">{selectedReport?.user_email || '—'}</span>
            </div>
          </div>

          {selectedReport?.admin_note && (
            <div className="space-y-1.5">
              <span className="text-gray-400 font-medium block">Ghi chú admin</span>
              <p className="text-gray-800 leading-relaxed bg-gray-50 border border-gray-100 rounded-2xl p-3.5 whitespace-pre-wrap">
                {selectedReport.admin_note}
              </p>
              <p className="text-[11px] text-gray-400">
                {selectedReport.handled_by_name ? `Bởi: ${selectedReport.handled_by_name} · ` : ''}
                {selectedReport.updated_at ? formatTime(selectedReport.updated_at) : ''}
              </p>
            </div>
          )}
        </div>
      </CellDetailComponent>

      {/* Status Update Modal */}
      <AddUpdateModelComponent
        open={!!actionModal}
        onClose={() => {
          setActionModal(null);
          setActionError('');
        }}
        title="Xử lý báo cáo ứng dụng"
        subtitle={actionModal ? `${actionModal.user_name || 'N/A'} · ${actionModal.title}` : undefined}
        headerIcon={
          <div className="p-2 rounded-2xl bg-blue-100 text-blue-600">
            <PiGearSix size={24} />
          </div>
        }
        onSubmit={handleSubmit}
        submitLabel="Lưu thay đổi"
        loading={actionLoading}
      >
        {actionError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 mb-4">
            <PiWarning size={18} className="text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm text-red-700 font-medium">{actionError}</span>
          </div>
        )}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Trạng thái xử lý *
          </label>
          <select
            value={statusOption}
            onChange={(e) => setStatusOption(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900"
          >
            <option value="PENDING">Chờ xử lý</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="RESOLVED">Đã xử lý</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            {statusOption === 'REJECTED' ? 'Ghi chú admin *' : 'Ghi chú admin'}
          </label>
          <textarea
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            placeholder={statusOption === 'REJECTED' ? 'Nhập lý do từ chối...' : 'Nhập ghi chú xử lý...'}
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
          />
        </div>
      </AddUpdateModelComponent>
    </div>
  );
};

export default AppReportTab;
