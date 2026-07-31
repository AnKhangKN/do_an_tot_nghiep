import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import React from 'react';
import { getRescuersAdmin, verifyRescuerAdmin } from '@/api/admin/RescuerApi';

const RescuerPage = () => {
  const [rescuers, setRescuers] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);
  const LIMIT = 10;

  const handleVerify = async (userId) => {
    try {
      const response = await verifyRescuerAdmin(userId);
      if (response && response.success) {
        setRescuers((prev) =>
          prev.map((r) =>
            r.userId === userId ? { ...r, isVerified: true } : r
          )
        );
        alert("Duyệt người cứu hộ thành công!");
      } else {
        alert(response.message || "Duyệt người cứu hộ thất bại.");
      }
    } catch (error) {
      console.error("Lỗi duyệt cứu hộ:", error);
      alert("Đã xảy ra lỗi khi duyệt người cứu hộ.");
    }
  };

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
      key: 'isVerified',
      title: 'Xác minh hồ sơ',
      render: (row) => (
        row.isVerified ? (
          <span className="px-2.5 py-1 text-xs rounded-full font-semibold bg-green-50 text-green-700 border border-green-200">
            Đăng ký thành công
          </span>
        ) : (
          <button
            onClick={() => handleVerify(row.userId)}
            className="px-3.5 py-1.5 text-xs rounded-2xl font-bold bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 transition shadow-sm hover:shadow active:scale-95 cursor-pointer"
          >
            Duyệt
          </button>
        )
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
          {row.status === 'ACTIVE' || row.status === 'ONLINE' ? 'ONLINE' : 'OFFLINE'}
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

  React.useEffect(() => {
    const fetchRescuers = async () => {
      setLoading(true);
      try {
        const response = await getRescuersAdmin(page, LIMIT);
        if (response && response.success) {
          setRescuers(response.data.data || []);
          setTotalPages(response.data.totalPages || 1);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách cứu hộ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRescuers();
  }, [page]);

  return (
    <div>
      <TableComponent
        columns={columns}
        data={rescuers}
        rowKey="userId"
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        loading={loading}
      />
    </div>
  );
};

export default RescuerPage;