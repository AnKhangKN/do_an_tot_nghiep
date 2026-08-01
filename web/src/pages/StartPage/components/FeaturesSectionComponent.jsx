import React from "react";
import {
  PiMapPinFill,
  PiSirenFill,
  PiWarningFill,
} from "react-icons/pi";

const FEATURES = [
  {
    icon: PiSirenFill,
    iconClass: "text-red-400",
    title: "Tín hiệu SOS Khẩn cấp",
    desc: "Định vị GPS chính xác, gửi yêu cầu cứu hộ tức thì kèm hình ảnh và mô tả sự cố.",
  },
  {
    icon: PiWarningFill,
    iconClass: "text-amber-400",
    title: "Bản đồ Cảnh báo Vùng nguy hiểm",
    desc: "Theo dõi các điểm ngập lụt, sạt lở, tai nạn giao thông được duyệt chính thức.",
  },
  {
    icon: PiMapPinFill,
    iconClass: "text-emerald-400",
    title: "Tra cứu Tiện ích Khẩn cấp",
    desc: "Tìm kiếm vị trí bệnh viện, trạm cứu thương, cây xăng, dịch vụ cứu hộ gần nhất.",
  },
];

const FeaturesSectionComponent = () => {
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-white dark:bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Tính năng cốt lõi
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-4xl">
            Hệ thống cứu hộ toàn diện trong một nền tảng
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Từ phát tín hiệu, cảnh báo rủi ro đến điều phối đội ngũ — mọi thứ
            vận hành mượt mà trên 3 nền tảng.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:mt-14 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6 dark:bg-gray-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md transition group-hover:scale-105 lg:h-14 lg:w-14 dark:bg-gray-200 dark:text-white">
                  <Icon className={feature.iconClass} size={24} />
                </div>
                <h3 className="mt-4 text-sm font-bold text-gray-900 sm:text-base">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
                  {feature.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSectionComponent;
