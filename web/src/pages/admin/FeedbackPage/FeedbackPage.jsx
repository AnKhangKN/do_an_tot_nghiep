import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import ButtonComponent from '@/components/shared/ButtonComponent/ButtonComponent';
import { getAllRatingsAdmin } from '@/api/admin/RatingApi';

const ratingColumns = () => [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-xs font-medium text-gray-400">{index + 1}</span>
    ),
  },
  {
    key: 'victim_name',
    title: 'Nạn nhân (Người gửi)',
    render: (row) => (
      <div className="flex items-center gap-2">
        {row.victim_avatar ? (
          <img src={row.victim_avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
            {(row.victim_name || 'N/A').charAt(0)}
          </div>
        )}
        <span className="font-medium text-gray-900 text-xs">{row.victim_name || 'Khách'}</span>
      </div>
    ),
  },
  {
    key: 'rescuer_name',
    title: 'Cứu hộ viên',
    render: (row) => (
      <div className="flex items-center gap-2">
        {row.rescuer_avatar ? (
          <img src={row.rescuer_avatar} alt="" className="w-7 h-7 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700 shrink-0">
            {(row.rescuer_name || 'CHV').charAt(0)}
          </div>
        )}
        <span className="font-medium text-gray-900 text-xs">{row.rescuer_name || 'Cứu hộ viên'}</span>
      </div>
    ),
  },
  {
    key: 'rating',
    title: 'Đánh giá',
    render: (row) => (
      <div className="flex items-center gap-1 font-bold text-amber-600 text-xs">
        <span>⭐ {row.rating}/5</span>
        <div className="flex text-amber-400 text-xs ml-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i} className={i < row.rating ? 'text-amber-400' : 'text-gray-300'}>
              ★
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'comment',
    title: 'Nội dung nhận xét',
    render: (row) => (
      <p className="text-xs text-gray-700 italic leading-relaxed max-w-[300px] line-clamp-2 overflow-hidden">
        {row.comment ? `"${row.comment}"` : <span className="text-gray-400 font-normal not-italic">Không có lời nhắn</span>}
      </p>
    ),
  },
  {
    key: 'created_at',
    title: 'Thời gian',
    render: (row) => (
      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
        {formatTime(row.created_at)}
      </span>
    ),
  },
];

const mockReports = [
  {
    id: '1',
    reportedBy: 'Lê Văn C',
    reason: 'Spam bình luận',
    target: 'Bài viết khu vực nguy hiểm',
    createdAt: '2026-05-17T10:00:00',
  },
  {
    id: '2',
    reportedBy: 'Phạm Thị D',
    reason: 'Thông tin sai lệch',
    target: 'Bình luận người dùng',
    createdAt: '2026-05-16T09:20:00',
  },
];

const reportColumns = [
  {
    key: 'index',
    title: 'STT',
    render: (_, index) => (
      <span className="text-xs text-gray-500">{index + 1}</span>
    ),
  },
  {
    key: 'reportedBy',
    title: 'Người báo cáo',
    dataIndex: 'reportedBy',
  },
  {
    key: 'reason',
    title: 'Lý do',
    dataIndex: 'reason',
  },
  {
    key: 'target',
    title: 'Đối tượng',
    dataIndex: 'target',
  },
  {
    key: 'createdAt',
    title: 'Ngày báo cáo',
    render: (row) => (
      <span className="text-xs text-gray-500">
        {formatTime(row.createdAt)}
      </span>
    ),
  },
];

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('rating');
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, avgRating: 0.0, fiveStarCount: 0 });
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpandRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchRatings = async (currentPage = 1, filter = ratingFilter) => {
    setLoading(true);
    try {
      const res = await getAllRatingsAdmin(currentPage, 10, filter);
      if (res?.data) {
        setRatings(res.data.ratings || []);
        const total = res.data.total || 0;
        setTotalPages(Math.ceil(total / 10) || 1);
        setStats({
          total,
          avgRating: res.data.avgRating || 0.0,
          fiveStarCount: res.data.fiveStarCount || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load ratings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'rating') {
      fetchRatings(page, ratingFilter);
    }
  }, [activeTab, page, ratingFilter]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setRatingFilter(val);
    setPage(1);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'rating':
        return (
          <div className="space-y-4">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 font-bold text-xl">
                  ⭐
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Điểm trung bình</p>
                  <p className="text-xl font-bold text-gray-900">{stats.avgRating.toFixed(1)} / 5.0</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-lg">
                  💬
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Tổng số đánh giá</p>
                  <p className="text-xl font-bold text-gray-900">{stats.total} lượt</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-lg">
                  🌟
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Đánh giá 5 sao</p>
                  <p className="text-xl font-bold text-gray-900">{stats.fiveStarCount} lượt</p>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-gray-200 shadow-sm">
              <span className="text-xs font-semibold text-gray-700">Lọc theo số sao:</span>
              <select
                value={ratingFilter}
                onChange={handleFilterChange}
                className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="">Tất cả mức sao (1 - 5)</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 sao</option>
                <option value="4">⭐⭐⭐⭐ 4 sao</option>
                <option value="3">⭐⭐⭐ 3 sao</option>
                <option value="2">⭐⭐ 2 sao</option>
                <option value="1">⭐ 1 sao</option>
              </select>
            </div>

            <TableComponent
              columns={ratingColumns({ expandedRows, onToggleExpand: toggleExpandRow })}
              data={ratings}
              rowKey="rating_id"
              page={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
              loading={loading}
            />
          </div>
        );

      case 'report':
        return (
          <TableComponent
            columns={reportColumns}
            data={mockReports}
            rowKey="id"
            page={1}
            totalPages={1}
            onPageChange={() => { }}
            loading={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-2 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản Lý Phản Hồi & Đánh Giá Cứu Hộ</h1>
        <p className="text-sm text-gray-500">Theo dõi đánh giá chất lượng phục vụ của Cứu hộ viên từ Nạn nhân</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3">
        <ButtonComponent
          onClick={() => setActiveTab('rating')}
          className={`${activeTab === 'rating'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          ⭐ Đánh giá Cứu hộ
        </ButtonComponent>

        <ButtonComponent
          onClick={() => setActiveTab('report')}
          className={`${activeTab === 'report'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          🚩 Báo cáo vi phạm
        </ButtonComponent>
      </div>

      {renderContent()}
    </div>
  );
};

export default FeedbackPage;