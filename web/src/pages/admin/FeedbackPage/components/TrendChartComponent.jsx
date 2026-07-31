import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import TimeComponent from "@/pages/admin/DashboardPage/components/TimeComponent";
import { getRatingTrendsAdmin } from "@/api/admin/RatingApi";

const ASPECT_META = {
  avgRating: { label: "Điểm tổng", color: "#111827" },
  avgResponseSpeed: { label: "Tốc độ phản ứng", color: "#f59e0b" },
  avgAttitude: { label: "Thái độ phục vụ", color: "#10b981" },
  avgSupportLevel: { label: "Mức độ hỗ trợ", color: "#3b82f6" },
};

const SENTIMENT_META = [
  { key: "positive", label: "Tích cực", color: "#10b981" },
  { key: "neutral", label: "Trung lập", color: "#9ca3af" },
  { key: "negative", label: "Tiêu cực", color: "#ef4444" },
];

const TrendChartComponent = () => {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [trendData, setTrendData] = useState([]);
  const [summary, setSummary] = useState({
    avgRating: 0,
    avgResponseSpeed: 0,
    avgAttitude: 0,
    avgSupportLevel: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    total: 0,
  });

  const fetchTrends = async (currentDays = days) => {
    setLoading(true);
    try {
      const res = await getRatingTrendsAdmin(currentDays);
      const raw = res?.data?.data || [];
      const mapped = raw.map((row) => ({
        date: (row.date || "").slice(0, 10),
        total: row.total || 0,
        avgRating: Number(row.avg_rating || 0),
        avgResponseSpeed: Number(row.avg_response_speed || 0),
        avgAttitude: Number(row.avg_attitude || 0),
        avgSupportLevel: Number(row.avg_support_level || 0),
        positive: row.positive_count || 0,
        neutral: row.neutral_count || 0,
        negative: row.negative_count || 0,
      }));
      setTrendData(mapped);

      const ratedDays = mapped.filter((d) => d.total > 0);
      const avgOf = (key) => {
        if (ratedDays.length === 0) return 0;
        const sum = ratedDays.reduce((acc, d) => acc + d[key], 0);
        return sum / ratedDays.length;
      };
      setSummary({
        avgRating: avgOf("avgRating"),
        avgResponseSpeed: avgOf("avgResponseSpeed"),
        avgAttitude: avgOf("avgAttitude"),
        avgSupportLevel: avgOf("avgSupportLevel"),
        positive: mapped.reduce((a, d) => a + d.positive, 0),
        neutral: mapped.reduce((a, d) => a + d.neutral, 0),
        negative: mapped.reduce((a, d) => a + d.negative, 0),
        total: mapped.reduce((a, d) => a + d.total, 0),
      });
    } catch (err) {
      console.error("Failed to load rating trends:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrends(days);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const aspectChartData = trendData.map((d) => {
    const row = { date: d.date, total: d.total };
    Object.keys(ASPECT_META).forEach((key) => {
      row[key] = d[key];
    });
    return row;
  });

  const sentimentChartData = trendData.map((d) => ({
    date: d.date,
    positive: d.positive,
    neutral: d.neutral,
    negative: d.negative,
  }));

  const tooltipStyle = {
    backgroundColor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    fontSize: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-gray-100 p-3 rounded-2xl border border-gray-200 shadow-sm">
        <span className="text-xs font-semibold text-gray-700">
          Xu hướng chất lượng cứu hộ trong khoảng thời gian:
        </span>
        <TimeComponent selectedDays={days} onSelectDays={(d) => setDays(d)} />
      </div>

      {loading ? (
        <div className="bg-white dark:bg-gray-100 rounded-2xl border border-gray-200 shadow-sm text-center py-12 text-gray-500 text-sm">
          Đang tải dữ liệu...
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(ASPECT_META).map(([key, meta]) => (
              <div key={key} className="bg-white dark:bg-gray-100 p-4 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  <p className="text-xs text-gray-500 font-medium">{meta.label}</p>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {summary[key].toFixed(1)} <span className="text-xs text-gray-400 font-medium">/ 5.0</span>
                </p>
              </div>
            ))}
          </div>

          {/* Aspect trend chart */}
          <div className="bg-white dark:bg-gray-100 p-5 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">Điểm đánh giá trung bình theo ngày</h3>
              <span className="text-xs text-gray-400 font-medium">{summary.total} lượt đánh giá</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={aspectChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                {Object.entries(ASPECT_META).map(([key, meta]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={meta.label}
                    stroke={meta.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sentiment distribution chart */}
          <div className="bg-white dark:bg-gray-100 p-5 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Phân bố cảm xúc phản hồi theo ngày
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={sentimentChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f9fafb" }} />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                {SENTIMENT_META.map((s) => (
                  <Bar key={s.key} dataKey={s.key} name={s.label} stackId="sentiment" fill={s.color} radius={s.key === "negative" ? [0, 0, 4, 4] : s.key === "positive" ? [4, 4, 0, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>

            {/* Sentiment totals */}
            <div className="flex flex-wrap gap-3 mt-4">
              {SENTIMENT_META.map((s) => (
                <div key={s.key} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs text-gray-600 font-medium">{s.label}:</span>
                  <span className="text-sm font-bold text-gray-900">{summary[s.key]}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TrendChartComponent;
