import React from "react";
import {
  PiCrossFill,
  PiLightningFill,
  PiMapPinFill,
} from "react-icons/pi";

const STATS = [
  {
    icon: PiLightningFill,
    iconClass: "text-amber-400",
    value: "99.9%",
    label: "Thời gian tiếp nhận tín hiệu tức thì",
    desc: "Realtime WebSockets",
  },
  {
    icon: PiMapPinFill,
    iconClass: "text-red-400",
    value: "24/7",
    label: "Cảnh báo vùng nguy hiểm & sự cố",
    desc: "Giám sát liên tục mọi lúc",
  },
  {
    icon: PiCrossFill,
    iconClass: "text-emerald-400",
    value: "100+",
    label: "Tiện ích khẩn cấp tích hợp",
    desc: "Bệnh viện, trạm cứu hỏa, hỗ trợ",
  },
];

const StatsSectionComponent = () => {
  return (
    <section className="flex min-h-dvh flex-col justify-center border-y border-gray-200 bg-gray-50 dark:border-gray-200/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mb-8 text-center sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">Hiệu suất hệ thống</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">Số liệu thực tế</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 dark:bg-gray-100"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md sm:h-14 sm:w-14 dark:bg-gray-200 dark:text-white">
                  <Icon className={stat.iconClass} size={24} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm font-medium text-gray-700">{stat.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSectionComponent;
