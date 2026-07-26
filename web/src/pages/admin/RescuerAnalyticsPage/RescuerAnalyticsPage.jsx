import React, { useEffect, useState } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { getRescuerAnalytics } from '@/api/admin/RescuerAnalyticsApi';
import {
  PiShieldFill,
  PiCheckCircleFill,
  PiTimerFill,
  PiStarFill,
  PiTrophyFill,
  PiMagnifyingGlassBold,
  PiSparkleFill
} from 'react-icons/pi';

const columns = [
  {
    key: 'rank',
    title: 'Hạng',
    render: (_, index) => {
      if (index === 0) return <span className="text-xl leading-none">🥇</span>;
      if (index === 1) return <span className="text-xl leading-none">🥈</span>;
      if (index === 2) return <span className="text-xl leading-none">🥉</span>;
      return <span className="text-xs font-semibold text-gray-400 text-center block">{index + 1}</span>;
    },
  },
  {
    key: 'rescuer',
    title: 'Cứu hộ viên',
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
          {row.avatarUrl ? (
            <img src={row.avatarUrl} alt={row.fullName} className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-gray-700 text-xs">{row.fullName?.charAt(0) || 'U'}</span>
          )}
        </div>
        <div>
          <div className="font-semibold text-gray-900 text-sm">{row.fullName || 'Cứu hộ viên'}</div>
          <div className="text-xs text-gray-500 font-medium">{row.phone || row.email || '--'}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'area',
    title: 'Khu vực',
    render: (row) => (
      <span className="text-xs text-gray-600 font-medium whitespace-nowrap">
        {row.area || 'Toàn quốc'}
      </span>
    ),
  },
  {
    key: 'completedCount',
    title: 'Ca hoàn thành',
    render: (row) => (
      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs whitespace-nowrap">
        <PiCheckCircleFill className="text-emerald-500 text-sm" />
        {row.completedCount} ca
      </span>
    ),
  },
  {
    key: 'responseRate',
    title: 'Tỷ lệ nhận ca',
    render: (row) => {
      const rate = row.responseRate ?? 100;
      let colorClass = 'bg-emerald-500';
      if (rate < 60) colorClass = 'bg-rose-500';
      else if (rate < 85) colorClass = 'bg-amber-500';

      return (
        <div className="w-28 space-y-1">
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-gray-700">{rate}%</span>
            <span className="text-gray-400 text-[10px]">({row.acceptedCount}/{row.totalOffers})</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${colorClass} rounded-full transition-all duration-300`} style={{ width: `${rate}%` }} />
          </div>
        </div>
      );
    },
  },
  {
    key: 'avgResponseTime',
    title: 'Thời gian phản hồi',
    render: (row) => (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium bg-amber-50 text-amber-800 border border-amber-200/80 whitespace-nowrap">
        <PiTimerFill className="text-amber-500 text-sm" />
        {row.avgResponseTimeSeconds > 0 ? `${row.avgResponseTimeSeconds}s` : '< 5s'}
      </span>
    ),
  },
  {
    key: 'avgRating',
    title: 'Đánh giá Nạn nhân',
    render: (row) => (
      <div className="flex items-center gap-1 whitespace-nowrap">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-bold bg-yellow-50 text-yellow-800 border border-yellow-200/80 shadow-2xs">
          <PiStarFill className="text-yellow-500 text-xs" />
          {row.avgRating > 0 ? row.avgRating.toFixed(1) : '5.0'}
        </div>
        <span className="text-[11px] text-gray-400 font-medium">({row.totalRatings} lượt)</span>
      </div>
    ),
  },
  {
    key: 'status',
    title: 'Trạng thái',
    render: (row) => {
      const isOnline = row.status === 'ONLINE' || row.status === 'ACTIVE';
      return (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-semibold whitespace-nowrap shadow-2xs ${
            isOnline
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              : 'bg-gray-100 text-gray-600 border border-gray-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          {isOnline ? 'Hoạt động' : 'Ngoại tuyến'}
        </span>
      );
    },
  },
];

const RescuerAnalyticsPage = () => {
  const [data, setData] = useState([]);
  const [overview, setOverview] = useState({
    totalRescuers: 0,
    totalCompletedSos: 0,
    overallAvgResponseTime: 0,
    overallAvgRating: 0,
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getRescuerAnalytics(page, 10, search);
      if (res?.success) {
        setData(res.data?.data || []);
        setTotalPages(res.data?.totalPages || 1);
        if (res.data?.overview) {
          setOverview(res.data.overview);
        }
      }
    } catch (error) {
      console.error("Fetch rescuer analytics error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAnalytics();
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Phân tích hiệu suất Cứu hộ viên</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 rounded-full flex items-center gap-1 border border-purple-200">
              <PiSparkleFill className="text-purple-600 text-xs" /> Analytics
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">Bảng xếp hạng KPI, tốc độ phản hồi và chất lượng phục vụ của đội ngũ cứu hộ</p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
          <input
            type="text"
            placeholder="Tìm theo tên, email, số ĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-gray-900 transition-colors"
          />
          <PiMagnifyingGlassBold className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        </form>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <PiShieldFill className="text-indigo-600 text-xl" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tổng Cứu Hộ Viên</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5">{overview.totalRescuers}</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
            <PiCheckCircleFill className="text-emerald-600 text-xl" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Ca Hoàn Thành</div>
            <div className="text-2xl font-bold text-emerald-700 mt-0.5">{overview.totalCompletedSos} ca</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
            <PiTimerFill className="text-amber-600 text-xl" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phản Hồi Trung Bình</div>
            <div className="text-2xl font-bold text-amber-700 mt-0.5">
              {overview.overallAvgResponseTime > 0 ? `${overview.overallAvgResponseTime}s` : '< 5s'}
            </div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 border border-yellow-100 flex items-center justify-center shrink-0">
            <PiStarFill className="text-yellow-500 text-xl" />
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Đánh Giá Trung Bình</div>
            <div className="text-2xl font-bold text-gray-900 mt-0.5 flex items-center gap-1">
              {overview.overallAvgRating > 0 ? overview.overallAvgRating.toFixed(1) : '5.0'}
              <span className="text-xs font-normal text-gray-400">/ 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PiTrophyFill className="text-amber-500 text-lg" />
            <h2 className="font-bold text-gray-900 text-base">Bảng Xếp Hạng & Chỉ Số Hiệu Suất</h2>
          </div>
          <span className="text-xs text-gray-500 font-medium">Sắp xếp theo số ca hoàn thành & điểm đánh giá</span>
        </div>

        <TableComponent
          columns={columns}
          data={data}
          rowKey="userId"
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default RescuerAnalyticsPage;
