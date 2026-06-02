import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import React from 'react';

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
          row.status === 'ONLINE'
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

const mockUsers = [
  {
    userId: '1',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    role: 'ADMIN',
    status: 'ONLINE',
    createdAt: '2026-05-20T08:30:00',
  },
  {
    userId: '2',
    fullName: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0912345678',
    role: 'VICTIM',
    status: 'OFFLINE',
    createdAt: '2026-05-18T14:10:00',
  },
  {
    userId: '3',
    fullName: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0987654321',
    role: 'RESCUER',
    status: 'ONLINE',
    createdAt: '2026-05-15T09:45:00',
  },
  {
    userId: '4',
    fullName: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    phone: '0978123456',
    role: 'VICTIM',
    status: 'OFFLINE',
    createdAt: '2026-05-12T17:20:00',
  },
  {
    userId: '5',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    phone: '0966777888',
    role: 'RESCUER',
    status: 'ONLINE',
    createdAt: '2026-05-10T11:00:00',
  },
];

const UserPage = () => {
  const [users, setUsers] = React.useState(mockUsers);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);

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