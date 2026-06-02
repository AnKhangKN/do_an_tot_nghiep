import React from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';

const columns = [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-gray-500">{index + 1}</span>
    ),
  },
  {
    key: 'zoneName',
    title: 'Tên khu vực',
    dataIndex: 'zoneName',
  },
  {
    key: 'address',
    title: 'Địa chỉ',
    dataIndex: 'address',
  },
  {
    key: 'dangerLevel',
    title: 'Mức độ nguy hiểm',
    render: (row) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.dangerLevel === 'HIGH'
            ? 'bg-red-100 text-red-700'
            : row.dangerLevel === 'MEDIUM'
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {row.dangerLevel}
      </span>
    ),
  },
  {
    key: 'status',
    title: 'Trạng thái',
    render: (row) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.status === 'PENDING'
            ? 'bg-yellow-100 text-yellow-700'
            : row.status === 'APPROVED'
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
  {
    key: 'approvedBy',
    title: 'Người duyệt',
    render: (row) => (
      <span className="text-sm text-gray-600">
        {row.approvedBy || '--'}
      </span>
    ),
  },
  {
    key: 'action',
    title: 'Hành động',
    render: (row) =>
      row.status === 'PENDING' ? (
        <div className="flex gap-2">
          <button className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600">
            Duyệt
          </button>

          <button className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">
            Từ chối
          </button>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">
          Đã xử lý
        </span>
      ),
  },
];

const mockDangerousZones = [
  {
    zoneId: '1',
    zoneName: 'Khu vực sạt lở Cần Thơ',
    address: 'Ninh Kiều, Cần Thơ',
    dangerLevel: 'HIGH',
    status: 'PENDING',
    approvedBy: null,
    createdAt: '2026-05-20T08:30:00',
  },
  {
    zoneId: '2',
    zoneName: 'Đường ngập nước Quốc lộ 1A',
    address: 'Cái Răng, Cần Thơ',
    dangerLevel: 'MEDIUM',
    status: 'PENDING',
    approvedBy: null,
    createdAt: '2026-05-19T14:10:00',
  },
  {
    zoneId: '3',
    zoneName: 'Khu vực cây đổ',
    address: 'Bình Thủy, Cần Thơ',
    dangerLevel: 'LOW',
    status: 'PENDING',
    approvedBy: null,
    createdAt: '2026-05-18T09:20:00',
  },
  {
    zoneId: '4',
    zoneName: 'Cầu yếu nguy hiểm',
    address: 'Ô Môn, Cần Thơ',
    dangerLevel: 'HIGH',
    status: 'APPROVED',
    approvedBy: 'Admin',
    createdAt: '2026-05-15T10:00:00',
  },
  {
    zoneId: '5',
    zoneName: 'Khu vực ngập sâu',
    address: 'Thốt Nốt, Cần Thơ',
    dangerLevel: 'MEDIUM',
    status: 'APPROVED',
    approvedBy: 'Moderator',
    createdAt: '2026-05-12T15:45:00',
  },
];

const DangerousZonePage = () => {
  const [dangerousZones, setDangerousZones] = React.useState(
    mockDangerousZones
  );

  return (
    <div className="">
      

      <TableComponent
        columns={columns}
        data={dangerousZones}
        rowKey="zoneId"
        page={1}
        totalPages={1}
        onPageChange={() => {}}
        loading={false}
      />
    </div>
  );
};

export default DangerousZonePage;