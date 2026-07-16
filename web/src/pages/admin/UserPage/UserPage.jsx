import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import React from 'react';
import { getUsersAdmin } from '@/api/admin/UserApi';

const UserPage = () => {
  const [users, setUsers] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);
  const LIMIT = 10;

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
            row.status === 'ACTIVE' || row.status === 'ONLINE'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
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
  ];

  React.useEffect(() => {
    const fetchUsers = async () => {
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
    };

    fetchUsers();
  }, [page]);

  return (
    <div>
      <TableComponent
        columns={columns}
        data={users}
        rowKey="userId"
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        loading={loading}
      />
    </div>
  );
};

export default UserPage;