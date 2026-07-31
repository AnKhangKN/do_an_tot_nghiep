import React, { useState, useEffect } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import ButtonComponent from '@/components/shared/ButtonComponent/ButtonComponent';
import { getAllRatingsAdmin } from '@/api/admin/RatingApi';
import TrendChartComponent from './components/TrendChartComponent';
import {
  PiStarFill,
  PiStar,
  PiLightningFill,
  PiHandshakeFill,
  PiLifebuoyFill,
  PiChatCircleFill,
  PiSparkleFill,
  PiSmileyFill,
  PiSmileyMehFill,
  PiSmileySadFill,
  PiChartLineUpFill,
  PiFlagFill,
} from 'react-icons/pi';

const SENTIMENT_META = {
  POSITIVE: { label: 'Tích cực', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  NEUTRAL: { label: 'Trung lập', className: 'bg-gray-100 text-gray-600 border-gray-200' },
  NEGATIVE: { label: 'Tiêu cực', className: 'bg-red-50 text-red-700 border-red-200' },
};

const SentimentBadge = ({ row }) => {
  const meta = SENTIMENT_META[row.sentiment];
  if (!meta) {
    return <span className="text-xs text-gray-400 font-medium">Chưa phân tích</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${meta.className}`}>
      {row.sentiment === 'POSITIVE' && <PiSmileyFill size={12} />}
      {row.sentiment === 'NEUTRAL' && <PiSmileyMehFill size={12} />}
      {row.sentiment === 'NEGATIVE' && <PiSmileySadFill size={12} />}
      {meta.label}
      {row.sentiment_confidence != null && (
        <span className="font-normal opacity-70">{(row.sentiment_confidence * 100).toFixed(0)}%</span>
      )}
    </span>
  );
};

const AspectStars = ({ value }) => {
  if (value == null) return <span className="text-xs text-gray-400">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < value ? (
          <PiStarFill key={i} size={11} className="text-amber-400" />
        ) : (
          <PiStar key={i} size={11} className="text-gray-300 dark:text-gray-600" />
        )
      )}
    </div>
  );
};

const AspectCell = ({ row }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-1.5">
      <span className="w-24 flex items-center gap-1 text-[10px] text-gray-500 font-medium">
        <PiLightningFill className="text-amber-500" /> Phản ứng
      </span>
      <AspectStars value={row.response_speed} />
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-24 flex items-center gap-1 text-[10px] text-gray-500 font-medium">
        <PiHandshakeFill className="text-teal-600" /> Thái độ
      </span>
      <AspectStars value={row.attitude} />
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-24 flex items-center gap-1 text-[10px] text-gray-500 font-medium">
        <PiLifebuoyFill className="text-sky-600" /> Hỗ trợ
      </span>
      <AspectStars value={row.support_level} />
    </div>
  </div>
);

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
        <span className="flex items-center gap-1"><PiStarFill className="text-amber-400" /> {row.rating}/5</span>
        <div className="flex text-amber-400 text-xs ml-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <span key={i}>
              {i < row.rating ? <PiStarFill size={11} className="text-amber-400" /> : <PiStar size={11} className="text-gray-300 dark:text-gray-600" />}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    key: 'aspects',
    title: 'Khía cạnh',
    render: (row) => <AspectCell row={row} />,
  },
  {
    key: 'comment',
    title: 'Nội dung nhận xét',
    render: (row) => (
      <div className="flex flex-col gap-1.5 max-w-[260px]">
        {row.is_flagged && (
          <span className="inline-flex w-fit items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-[10px] font-semibold text-red-700">
            <PiFlagFill size={11} /> Vi phạm tiêu chuẩn
          </span>
        )}
        <p className="text-xs text-gray-700 italic leading-relaxed line-clamp-2 overflow-hidden">
          {row.comment ? `"${row.comment}"` : <span className="text-gray-400 font-normal not-italic">Không có lời nhắn</span>}
        </p>
        <SentimentBadge row={row} />
      </div>
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

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('rating');
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, avgRating: 0.0, fiveStarCount: 0 });
  const [aspectStats, setAspectStats] = useState({ responseSpeed: 0.0, attitude: 0.0, supportLevel: 0.0 });

  const fetchRatings = async (currentPage = 1, filter = ratingFilter, sentiment = sentimentFilter) => {
    setLoading(true);
    try {
      const res = await getAllRatingsAdmin(currentPage, 10, filter, sentiment);
      if (res?.data) {
        setRatings(res.data.ratings || []);
        const total = res.data.total || 0;
        setTotalPages(Math.ceil(total / 10) || 1);
        setStats({
          total,
          avgRating: res.data.avgRating || 0.0,
          fiveStarCount: res.data.fiveStarCount || 0,
        });
        setAspectStats({
          responseSpeed: res.data.aspectStats?.responseSpeed || 0.0,
          attitude: res.data.aspectStats?.attitude || 0.0,
          supportLevel: res.data.aspectStats?.supportLevel || 0.0,
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
      fetchRatings(page, ratingFilter, sentimentFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, page, ratingFilter, sentimentFilter]);

  const handleFilterChange = (e) => {
    setRatingFilter(e.target.value);
    setPage(1);
  };

  const handleSentimentFilterChange = (e) => {
    setSentimentFilter(e.target.value);
    setPage(1);
  };

  const StatCard = ({ icon, iconClass, label, value, sub }) => (
    <div className="bg-white dark:bg-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${iconClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900">
          {value}
          {sub && <span className="text-xs text-gray-400 font-medium"> {sub}</span>}
        </p>
      </div>
    </div>
  );

  const renderRatingTab = () => (
    <div className="space-y-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<PiStarFill size={20} />} iconClass="bg-amber-50 text-amber-500" label="Điểm trung bình" value={stats.avgRating.toFixed(1)} sub="/ 5.0" />
        <StatCard icon={<PiChatCircleFill size={20} />} iconClass="bg-blue-50 text-blue-600" label="Tổng số đánh giá" value={`${stats.total} lượt`} />
        <StatCard icon={<PiSparkleFill size={20} />} iconClass="bg-emerald-50 text-emerald-600" label="Đánh giá 5 sao" value={`${stats.fiveStarCount} lượt`} />
      </div>

      {/* Aspect stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={<PiLightningFill size={20} />} iconClass="bg-orange-50 text-orange-500" label="Tốc độ phản ứng (TB)" value={aspectStats.responseSpeed.toFixed(1)} sub="/ 5.0" />
        <StatCard icon={<PiHandshakeFill size={20} />} iconClass="bg-teal-50 text-teal-600" label="Thái độ phục vụ (TB)" value={aspectStats.attitude.toFixed(1)} sub="/ 5.0" />
        <StatCard icon={<PiLifebuoyFill size={20} />} iconClass="bg-sky-50 text-sky-600" label="Mức độ hỗ trợ (TB)" value={aspectStats.supportLevel.toFixed(1)} sub="/ 5.0" />
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3 bg-white dark:bg-gray-100 p-3 rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-xs font-semibold text-gray-700">Lọc:</span>
        <div className="flex flex-wrap gap-3">
          <select
            value={ratingFilter}
            onChange={handleFilterChange}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Tất cả mức sao (1 - 5)</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={handleSentimentFilterChange}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">Tất cả cảm xúc</option>
            <option value="POSITIVE">Tích cực</option>
            <option value="NEUTRAL">Trung lập</option>
            <option value="NEGATIVE">Tiêu cực</option>
          </select>
        </div>
      </div>

      <TableComponent
        columns={ratingColumns()}
        data={ratings}
        rowKey="rating_id"
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p)}
        loading={loading}
      />
    </div>
  );

  const renderTrendTab = () => <TrendChartComponent />;

  const renderContent = () => {
    switch (activeTab) {
      case 'rating':
        return renderRatingTab();

      case 'trend':
        return renderTrendTab();

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
      <div className="flex gap-3 flex-wrap">
        <ButtonComponent
          onClick={() => setActiveTab('rating')}
          className={`${activeTab === 'rating'
            ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <PiStarFill className="text-amber-400" /> Đánh giá Cứu hộ
          </span>
        </ButtonComponent>

        <ButtonComponent
          onClick={() => setActiveTab('trend')}
          className={`${activeTab === 'trend'
            ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <span className="flex items-center gap-1.5">
            <PiChartLineUpFill className="text-emerald-500" /> Xu hướng chất lượng
          </span>
        </ButtonComponent>
      </div>

      {renderContent()}
    </div>
  );
};

export default FeedbackPage;
