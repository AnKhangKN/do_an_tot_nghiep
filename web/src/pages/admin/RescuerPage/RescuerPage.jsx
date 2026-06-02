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
    key: 'experience',
    title: 'Kinh nghiệm',
    dataIndex: 'experience',
  },
  {
    key: 'status',
    title: 'Trạng thái',
    render: (row) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.status === 'APPROVED'
            ? 'bg-green-100 text-green-700'
            : row.status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: 'createdAt',
    title: 'Ngày đăng ký',
    render: (row) => (
      <span className="text-gray-500 text-sm">
        {formatTime(row.createdAt)}
      </span>
    ),
  },
];

const mockRescuers = [
  {
    rescuerId: '1',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@gmail.com',
    phone: '0901234567',
    experience: '3 năm cứu hộ giao thông',
    status: 'APPROVED',
    createdAt: '2026-05-20T08:30:00',
  },
  {
    rescuerId: '2',
    fullName: 'Trần Thị B',
    email: 'tranthib@gmail.com',
    phone: '0912345678',
    experience: '2 năm sơ cứu y tế',
    status: 'PENDING',
    createdAt: '2026-05-18T14:10:00',
  },
  {
    rescuerId: '3',
    fullName: 'Lê Văn C',
    email: 'levanc@gmail.com',
    phone: '0987654321',
    experience: '5 năm cứu hộ thiên tai',
    status: 'APPROVED',
    createdAt: '2026-05-15T09:45:00',
  },
  {
    rescuerId: '4',
    fullName: 'Phạm Thị D',
    email: 'phamthid@gmail.com',
    phone: '0978123456',
    experience: '1 năm hỗ trợ cộng đồng',
    status: 'REJECTED',
    createdAt: '2026-05-12T17:20:00',
  },
  {
    rescuerId: '5',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@gmail.com',
    phone: '0966777888',
    experience: '4 năm cứu hộ đường thủy',
    status: 'APPROVED',
    createdAt: '2026-05-10T11:00:00',
  },
];

const RescuerPage = () => {
  const [rescuers, setRescuers] = React.useState(mockRescuers);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);

  return (
    <div>
      
        <TableComponent
          columns={columns}
          data={rescuers}
          rowKey="rescuerId"
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          loading={loading}
        />
      
    </div>
  );
};

export default RescuerPage;