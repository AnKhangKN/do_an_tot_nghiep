import { formatTime } from '@/utils/format_date.util';
import React from 'react';
import { getAppeals, approveAppeal, rejectAppeal } from '@/api/admin/AppealApi';
import { PiCheck, PiX, PiWarningCircle, PiClipboardText } from 'react-icons/pi';

const STATUS_LABEL = {
    PENDING: { label: 'Chờ xử lý', class: 'bg-yellow-100 text-yellow-700' },
    APPROVED: { label: 'Đã duyệt', class: 'bg-green-100 text-green-700' },
    REJECTED: { label: 'Từ chối', class: 'bg-red-100 text-red-700' },
};

const AppealPage = () => {
    const [appeals, setAppeals] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [loading, setLoading] = React.useState(false);
    const [totalPages, setTotalPages] = React.useState(1);
    const [statusFilter, setStatusFilter] = React.useState('');
    const LIMIT = 10;

    const [actionModal, setActionModal] = React.useState(null);
    const [adminNote, setAdminNote] = React.useState('');
    const [actionLoading, setActionLoading] = React.useState(false);
    const [actionError, setActionError] = React.useState('');

    const fetchAppeals = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await getAppeals(page, LIMIT, statusFilter || undefined);

            if (response && (response.success || response.status === 200)) {
                const body = response.data;

                setAppeals(body.data || []);
                setTotalPages(body.totalPages || 1);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đơn kháng cáo:", error);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter]);

    React.useEffect(() => {
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

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-lg font-bold text-gray-900">Đơn kháng cáo</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    className="px-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="APPROVED">Đã duyệt</option>
                    <option value="REJECTED">Đã từ chối</option>
                </select>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Đang tải...</div>
                ) : appeals.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">Không có đơn kháng cáo nào.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {appeals.map((appeal) => {
                            const st = STATUS_LABEL[appeal.status] || STATUS_LABEL.PENDING;
                            return (
                                <div key={appeal.id} className="p-6 hover:bg-gray-50/50 transition">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-bold text-gray-900 truncate">{appeal.user_name}</span>
                                                <span className="text-xs text-gray-400">({appeal.user_email})</span>
                                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${st.class}`}>{st.label}</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap line-clamp-3">{appeal.reason}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span>Gửi lúc: {formatTime(appeal.created_at)}</span>
                                                {appeal.handled_at && <span>Xử lý lúc: {formatTime(appeal.handled_at)}</span>}
                                                {appeal.handled_by_name && <span>Bởi: {appeal.handled_by_name}</span>}
                                            </div>
                                            {appeal.admin_note && (
                                                <div className="mt-2 p-2 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                                                    <span className="font-semibold">Ghi chú admin:</span> {appeal.admin_note}
                                                </div>
                                            )}
                                        </div>
                                        {appeal.status === 'PENDING' && (
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setActionModal({ ...appeal, action: 'approve' })}
                                                    className="px-4 py-2 rounded-2xl bg-green-50 text-green-700 hover:bg-green-100 text-xs font-bold border border-green-200 transition cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <PiCheck size={14} />
                                                    Duyệt
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ ...appeal, action: 'reject' })}
                                                    className="px-4 py-2 rounded-2xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold border border-red-200 transition cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <PiX size={14} />
                                                    Từ chối
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-100">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-2 rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-bold border border-gray-200 disabled:opacity-40 transition cursor-pointer"
                        >
                            Trước
                        </button>
                        <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-2 rounded-2xl bg-gray-50 text-gray-700 hover:bg-gray-100 text-xs font-bold border border-gray-200 disabled:opacity-40 transition cursor-pointer"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {actionModal && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-[9999] flex items-center justify-center"
                    onClick={() => { setActionModal(null); setActionError(''); }}
                >
                    <div
                        className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-2xl ${actionModal.action === 'approve' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {actionModal.action === 'approve' ? <PiCheck size={24} /> : <PiX size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">
                                        {actionModal.action === 'approve' ? 'Duyệt đơn kháng cáo' : 'Từ chối đơn kháng cáo'}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {actionModal.user_name} ({actionModal.user_email})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setActionModal(null); setActionError(''); }}
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
                                <p className="text-sm text-gray-900 bg-gray-50 rounded-2xl p-3 border border-gray-100">{actionModal.reason}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                                    {actionModal.action === 'approve' ? 'Ghi chú (không bắt buộc)' : 'Lý do từ chối *'}
                                </label>
                                <textarea
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    placeholder={actionModal.action === 'approve' ? 'Nhập ghi chú...' : 'Nhập lý do từ chối...'}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => { setActionModal(null); setActionError(''); }}
                                className="px-5 py-2.5 rounded-2xl bg-white text-gray-700 hover:bg-gray-100 text-xs font-bold transition border border-gray-200 cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={() => handleAction(actionModal.action === 'approve')}
                                disabled={actionLoading}
                                className={`px-5 py-2.5 rounded-2xl text-white text-xs font-bold transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer ${actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {actionLoading ? 'Đang xử lý...' : actionModal.action === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppealPage;
