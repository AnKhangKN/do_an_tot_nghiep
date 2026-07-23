import React, { useEffect, useState } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import { getDangerousZones, approveDangerousZone, rejectDangerousZone } from '@/api/admin/DangerousZoneApi';

const columns = ({ onApprove, onReject, loading }) => [
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
    render: (row) => row.zoneName || '--',
  },
  {
    key: 'address',
    title: 'Địa chỉ',
    render: (row) => row.address || '--',
  },
  {
    key: 'description',
    title: 'Mô tả',
    render: (row) => (
      <span className="text-sm text-gray-600 max-w-xs truncate">
        {row.description || '--'}
      </span>
    ),
  },
  {
    key: 'dangerLevel',
    title: 'Mức độ nguy hiểm',
    render: (row) => {
      const levelLabel =
        row.dangerLevel === 'HIGH'
          ? 'Cao'
          : row.dangerLevel === 'MEDIUM'
            ? 'Trung bình'
            : 'Thấp';
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.dangerLevel === 'HIGH'
              ? 'bg-red-100 text-red-700'
              : row.dangerLevel === 'MEDIUM'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
          }`}
        >
          {levelLabel}
        </span>
      );
    },
  },
  {
    key: 'status',
    title: 'Trạng thái',
    render: (row) => {
      const statusLabel =
        row.status === 'PENDING'
          ? 'Chờ duyệt'
          : row.status === 'APPROVED'
            ? 'Đã duyệt'
            : 'Đã từ chối';
      return (
        <span
          className={`px-2 py-1 text-xs rounded-full font-medium ${
            row.status === 'PENDING'
              ? 'bg-yellow-100 text-yellow-700'
              : row.status === 'APPROVED'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
          }`}
        >
          {statusLabel}
        </span>
      );
    },
  },
  {
    key: 'reporterName',
    title: 'Người báo cáo',
    render: (row) => row.reporterName || '--',
  },
  {
    key: 'createdAt',
    title: 'Ngày tạo',
    render: (row) => formatTime(row.createdAt),
  },
  {
    key: 'action',
    title: 'Hành động',
    render: (row) =>
      row.status === 'PENDING' ? (
        <div className="flex gap-2">
          <button
            onClick={() => onApprove(row.dangerousPointId)}
            disabled={loading}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Duyệt
          </button>

          <button
            onClick={() => onReject(row.dangerousPointId)}
            disabled={loading}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
          >
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

const DangerousZonePage = () => {
  const [dangerousZones, setDangerousZones] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDangerousZones = async () => {
    const limit = 10;
    try {
      setLoading(true);
      const response = await getDangerousZones(page, limit);
      setDangerousZones(response?.data?.data || []);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDangerousZones();
  }, [page]);

  const handleApprove = async (dangerousPointId) => {
    try {
      setActionLoading(true);
      await approveDangerousZone(dangerousPointId);
      if (page === 1) {
        fetchDangerousZones();
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (dangerousPointId) => {
    try {
      setActionLoading(true);
      await rejectDangerousZone(dangerousPointId);
      if (page === 1) {
        fetchDangerousZones();
      } else {
        setPage(1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý điểm nguy hiểm</h1>
      </div>

      <TableComponent
        columns={columns({ onApprove: handleApprove, onReject: handleReject, loading: actionLoading })}
        data={dangerousZones}
        rowKey="dangerousPointId"
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        loading={loading}
      />
    </div>
  );
};

export default DangerousZonePage;
