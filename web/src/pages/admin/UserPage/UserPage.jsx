import TableComponent from '@/components/admin/TableComponent/TableComponent';
import AddUpdateModelComponent from '@/components/admin/AddUpdateModelComponent/AddUpdateModelComponent';
import { formatTime } from '@/utils/format_date.util';
import React from 'react';
import { getUsersAdmin, banUser, unbanUser } from '@/api/admin/UserApi';
import { PiLock, PiLockOpen, PiWarningCircle } from 'react-icons/pi';

const UserPage = () => {
  const [users, setUsers] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);
  const LIMIT = 10;

  const [banModal, setBanModal] = React.useState(null);
  const [banReason, setBanReason] = React.useState('');
  const [banning, setBanning] = React.useState(false);
  const [banError, setBanError] = React.useState('');

  const [unbanConfirm, setUnbanConfirm] = React.useState(null);
  const [unbanning, setUnbanning] = React.useState(false);
  const [unbanError, setUnbanError] = React.useState('');

  const columns = [
    {
      key: 'index',
      title: 'STT',
      render: (_, index) => (
        <span className="text-gray-500">{index + 1}</span>
      ),
    },
    {
      key: 'fullName',
      title: 'Họ và tên',
      dataIndex: 'fullName',
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      dataIndex: 'phone',
    },
    {
      key: 'role',
      title: 'Vai trò',
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.role === 'ADMIN'
              ? 'bg-purple-100 text-purple-700'
              : row.role === 'RESCUER'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (row) => (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.status === 'ACTIVE'
              ? 'bg-green-100 text-green-700'
              : row.status === 'BANNED'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (row) => (
        <span className="text-gray-500 text-sm">
          {formatTime(row.createdAt)}
        </span>
      ),
    },
    {
      key: 'action',
      title: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.role !== 'ADMIN' && (
            row.status === 'BANNED' ? (
              <button
                onClick={(e) => { e.stopPropagation(); setUnbanConfirm(row); }}
                className="px-3 py-1.5 rounded-2xl bg-green-50 text-green-700 hover:bg-green-100 text-xs font-semibold transition-all flex items-center gap-1.5 border border-green-200"
              >
                <PiLockOpen size={14} />
                Mở khóa
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); setBanModal(row); setBanReason(''); }}
                className="px-3 py-1.5 rounded-2xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-semibold transition-all flex items-center gap-1.5 border border-red-200"
              >
                <PiLock size={14} />
                Khóa
              </button>
            )
          )}
        </div>
      ),
    },
  ];

  const fetchUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUsersAdmin(page, LIMIT);
      if (response && response.success) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách người dùng:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleBan = async () => {
    if (!banModal || !banReason.trim()) return;
    setBanning(true);
    setBanError('');
    try {
      await banUser(banModal.userId, banReason.trim());
      setBanModal(null);
      setBanReason('');
      fetchUsers();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể khóa tài khoản!';
      setBanError(msg);
    } finally {
      setBanning(false);
    }
  };

  const handleUnban = async () => {
    if (!unbanConfirm) return;
    setUnbanning(true);
    setUnbanError('');
    try {
      await unbanUser(unbanConfirm.userId);
      setUnbanConfirm(null);
      fetchUsers();
    } catch (error) {
      const msg = error?.response?.data?.message || 'Không thể mở khóa tài khoản!';
      setUnbanError(msg);
    } finally {
      setUnbanning(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-gray-900">Quản lý người dùng</h1>
      </div>

      <TableComponent
        columns={columns}
        data={users}
        rowKey="userId"
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        loading={loading}
      />

      {/* Ban Modal */}
      <AddUpdateModelComponent
        open={!!banModal}
        onClose={() => { setBanModal(null); setBanError(''); }}
        title="Khóa tài khoản"
        subtitle={banModal ? `${banModal.fullName} (${banModal.email})` : undefined}
        headerIcon={
          <div className="p-2 rounded-2xl bg-red-100 text-red-600">
            <PiWarningCircle size={24} />
          </div>
        }
        onSubmit={handleBan}
        submitLabel="Xác nhận khóa"
        submitVariant="danger"
        submitDisabled={!banReason.trim()}
        loading={banning}
      >
        {banError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 mb-4">
            <PiWarningCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm text-red-700 font-medium">{banError}</span>
          </div>
        )}
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
            Lý do khóa
          </label>
          <textarea
            value={banReason}
            onChange={(e) => { setBanReason(e.target.value); setBanError(''); }}
            placeholder="Nhập lý do khóa tài khoản..."
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 resize-none"
          />
        </div>
      </AddUpdateModelComponent>

      {/* Unban Confirm */}
      <AddUpdateModelComponent
        open={!!unbanConfirm}
        onClose={() => { setUnbanConfirm(null); setUnbanError(''); }}
        title="Mở khóa tài khoản"
        subtitle={unbanConfirm ? `Bạn có chắc muốn mở khóa tài khoản ${unbanConfirm.fullName}?` : undefined}
        onSubmit={handleUnban}
        submitLabel="Xác nhận mở khóa"
        submitVariant="success"
        loading={unbanning}
        maxWidth="max-w-sm"
      >
        {unbanError && (
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200">
            <PiWarningCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm text-red-700 font-medium">{unbanError}</span>
          </div>
        )}
      </AddUpdateModelComponent>
    </div>
  );
};

export default UserPage;