import React, { useEffect, useState } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import { getDangerousZones, approveDangerousZone, rejectDangerousZone, autoDetectDangerousZones } from '@/api/admin/DangerousZoneApi';
import { PiLightningFill } from 'react-icons/pi';

const columns = ({ onApprove, onReject, expandedRows, onToggleExpand, loading }) => [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-xs font-medium text-gray-400 text-center block">{index + 1}</span>
    ),
  },
  {
    key: 'zoneName',
    title: 'Tên khu vực',
    render: (row) => (
      <span className="font-semibold text-gray-900 text-sm leading-snug block max-w-[180px]">
        {row.zoneName || '--'}
      </span>
    ),
  },
  {
    key: 'address',
    title: 'Địa chỉ',
    render: (row) => (
      <p className="text-xs text-gray-600 leading-relaxed max-w-[200px] line-clamp-2 overflow-hidden">
        {row.address || '--'}
      </p>
    ),
  },
  {
    key: 'description',
    title: 'Mô tả chi tiết',
    render: (row) => (
      <p className="text-xs text-gray-600 leading-relaxed max-w-[280px] line-clamp-2 overflow-hidden">
        {row.description || '--'}
      </p>
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
          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs rounded-full font-semibold shadow-2xs ${row.dangerLevel === 'HIGH'
            ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
            : row.dangerLevel === 'MEDIUM'
              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
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
          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs rounded-full font-semibold shadow-2xs ${row.status === 'PENDING'
            ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
            : row.status === 'APPROVED'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
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
    render: (row) => {
      const name = row.reporterName || '--';
      const isSystem = name.includes('Crowd-Sourced') || name.includes('Hệ thống');

      return (
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs rounded-full font-semibold border shadow-2xs ${isSystem
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-gray-100 text-gray-800 border-gray-200'
            }`}
        >
          <span>{name}</span>
        </span>
      );
    },
  },
  {
    key: 'createdAt',
    title: 'Ngày tạo',
    render: (row) => (
      <span className="whitespace-nowrap text-xs text-gray-500 font-medium">
        {formatTime(row.createdAt)}
      </span>
    ),
  },
  {
    key: 'action',
    title: 'Hành động',
    render: (row) =>
      row.status === 'PENDING' ? (
        <div className="flex items-center gap-2 whitespace-nowrap">
          <button
            onClick={() => onApprove(row.dangerousPointId)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            Duyệt
          </button>

          <button
            onClick={() => onReject(row.dangerousPointId)}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-semibold bg-rose-600 text-white rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all active:scale-95 shadow-2xs cursor-pointer"
          >
            Từ chối
          </button>
        </div>
      ) : (
        <span className="whitespace-nowrap text-xs text-gray-400 font-medium">
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
  const [autoDetecting, setAutoDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpandRow = (key) => {
    setExpandedRows((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

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

  const handleAutoDetect = async () => {
    try {
      setAutoDetecting(true);
      setDetectMsg(null);
      const res = await autoDetectDangerousZones();
      setDetectMsg(res?.message || 'Quét thành công!');
      fetchDangerousZones();
    } catch (error) {
      console.error(error);
      setDetectMsg('⚠️ Có lỗi xảy ra khi quét tự động.');
    } finally {
      setAutoDetecting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý điểm nguy hiểm</h1>
          <p className="text-sm text-gray-500 mt-0.5">Duyệt các vị trí rủi ro báo cáo bởi người dùng hoặc hệ thống tự phát hiện</p>
        </div>

        <button
          onClick={handleAutoDetect}
          disabled={autoDetecting}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-medium shadow-sm transition-all disabled:opacity-50 text-sm cursor-pointer"
        >
          {autoDetecting ? "Đang phân tích gom cụm..." : "Quét tự động"}
        </button>
      </div>

      {detectMsg && (
        <div className="px-4 py-3 rounded-2xl bg-gray-100 border border-gray-200 text-gray-900 text-sm flex items-center justify-between shadow-xs">
          <span>{detectMsg}</span>
          <button onClick={() => setDetectMsg(null)} className="text-gray-500 hover:text-gray-700 font-bold ml-4 cursor-pointer">✕</button>
        </div>
      )}

      <TableComponent
        columns={columns({
          onApprove: handleApprove,
          onReject: handleReject,
          expandedRows,
          onToggleExpand: toggleExpandRow,
          loading: actionLoading,
        })}
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
