import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { getAppeals, approveAppeal, rejectAppeal } from '@/api/admin/AppealApi';
import { formatTime } from '@/utils/format_date.util';
import { PiCheck, PiX, PiWarningCircle } from 'react-icons/pi';

const STATUS_LABEL = {
  PENDING: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  APPROVED: { label: 'Đã duyệt', class: 'bg-green-100 text-green-700 border-green-200' },
  REJECTED: { label: 'Từ chối', class: 'bg-red-100 text-red-700 border-red-200' },
};

const AppealPage = () => {
  const [appeals, setAppeals] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const LIMIT = 10;

  const [actionModal, setActionModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAppeals(page, LIMIT, statusFilter || undefined);

      if (response && (response.success || response.status === 200)) {
        const body = response.data;
        setAppeals(body.data || []);
        setTotalPages(body.totalPages || 1);
        setTotal(body.total ?? (body.data ? body.data.length : 0));
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn kháng cáo:", error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchAppeals();
  }, [fetchAppeals]);

  const handleAction = async (approve) => {
    if (!actionModal) return;
    setActionLoading(true);
    setActionError('');
    try {
      if (approve) {
        await approveAppeal(actionModal.id, adminNote || null);
      } else {
        if (!adminNote.trim()) {
          setActionError('Vui lòng nhập lý do từ chối!');
          setActionLoading(false);
          return;
        }
        await rejectAppeal(actionModal.id, adminNote.trim());
      }
      setActionModal(null);
      setAdminNote('');
      fetchAppeals();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Thao tác thất bại!';
      setActionError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        key: 'index',
        title: 'STT',
        render: (_, index) => (
          <span className="text-xs font-medium text-gray-400">
            {(page - 1) * LIMIT + index + 1}
          </span>
        ),
      },
      {
        key: 'user',
        title: 'Người gửi',
        render: (row) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900 text-xs truncate">{row.user_name || 'N/A'}</span>
            <span className="text-[11px] text-gray-400 truncate">{row.user_email || '—'}</span>
          </div>
        ),
      },
      {
        key: 'reason',
        title: 'Nội dung kháng cáo',
        dataIndex: 'reason',
        render: (row) => (
          <p className="text-xs text-gray-700 line-clamp-2" title={row.reason}>
            {row.reason}
          </p>
        ),
      },
      {
        key: 'status',
        title: 'Trạng thái',
        render: (row) => {
          const st = STATUS_LABEL[row.status] || STATUS_LABEL.PENDING;
          return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${st.class}`}>
              {st.label}
            </span>
          );
        },
      },
      {
        key: 'created_at',
        title: 'Thời gian gửi',
        render: (row) => (
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTime(row.created_at)}
          </span>
        ),
      },
      {
        key: 'handled_info',
        title: 'Thông tin xử lý',
        render: (row) =>
          row.handled_at ? (
            <div className="flex flex-col text-xs text-gray-500">
              <span>{formatTime(row.handled_at)}</span>
              {row.handled_by_name && (
                <span className="text-[11px] text-gray-400">Bởi: {row.handled_by_name}</span>
              )}
            </div>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },
      {
        key: 'admin_note',
        title: 'Ghi chú admin',
        dataIndex: 'admin_note',
        render: (row) =>
          row.admin_note ? (
            <p className="text-xs text-gray-600 line-clamp-2" title={row.admin_note}>
              {row.admin_note}
            </p>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          ),
      },

    ],
    [page]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">Đơn kháng cáo</h1>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xử lý</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Đã từ chối</option>
        </select>
      </div>

      <TableComponent
        columns={columns}
        data={appeals}
        rowKey="id"
        pagination={{
          page,
          totalPages,
          total,
          limit: LIMIT,
          onPageChange: (p) => setPage(p),
        }}
        loading={loading}
      />

      {/* Action Modal */}
      {actionModal && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[9999] flex items-center justify-center"
          onClick={() => {
            setActionModal(null);
            setActionError('');
          }}
        >
          <div
            className="bg-white dark:bg-gray-100 rounded-3xl max-w-md w-full mx-4 shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-2xl ${actionModal.action === 'approve'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                    }`}
                >
                  {actionModal.action === 'approve' ? <PiCheck size={24} /> : <PiX size={24} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {actionModal.action === 'approve'
                      ? 'Duyệt đơn kháng cáo'
                      : 'Từ chối đơn kháng cáo'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {actionModal.user_name} ({actionModal.user_email})
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionError('');
                }}
                className="p-2 rounded-2xl text-gray-400 hover:bg-gray-200/60 hover:text-gray-900 transition cursor-pointer"
              >
                <PiX size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {actionError && (
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200">
                  <PiWarningCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
                  <span className="text-sm text-red-700 font-medium">{actionError}</span>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1 font-semibold">Nội dung kháng cáo</p>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-2xl p-3 border border-gray-100">
                  {actionModal.reason}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  {actionModal.action === 'approve'
                    ? 'Ghi chú (không bắt buộc)'
                    : 'Lý do từ chối *'}
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder={
                    actionModal.action === 'approve' ? 'Nhập ghi chú...' : 'Nhập lý do từ chối...'
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionError('');
                }}
                className="px-5 py-2.5 rounded-2xl bg-white dark:bg-gray-100 text-gray-700 hover:bg-gray-100 text-xs font-bold transition border border-gray-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={() => handleAction(actionModal.action === 'approve')}
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-2xl text-white text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer ${actionModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                  }`}
              >
                {actionLoading
                  ? 'Đang xử lý...'
                  : actionModal.action === 'approve'
                    ? 'Xác nhận duyệt'
                    : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealPage;

