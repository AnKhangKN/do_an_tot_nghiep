import React from "react";
import {
  PiArrowLeft,
  PiArrowRight,
  PiDeviceMobileFill,
  PiHardDrivesFill,
  PiLightningFill,
  PiMonitorFill,
} from "react-icons/pi";

const LAYERS = [
  {
    icon: PiDeviceMobileFill,
    iconClass: "text-blue-400",
    title: "Mobile App",
    tech: "Flutter",
    desc: "Ứng dụng dành cho Nạn nhân & Cứu hộ viên với GPS, SOS, chỉ đường.",
  },
  {
    icon: PiHardDrivesFill,
    iconClass: "text-emerald-400",
    title: "Backend Server",
    tech: "Express.js • PostgreSQL • Redis",
    desc: "Xử lý nghiệp vụ, ghép đôi cứu hộ, push notification và AI moderation.",
  },
  {
    icon: PiMonitorFill,
    iconClass: "text-amber-400",
    title: "Web Admin",
    tech: "React • TailwindCSS",
    desc: "Dashboard điều phối realtime, bản đồ heatmap và quản lý dữ liệu.",
  },
];

const ArchitectureSectionComponent = () => {
  return (
    <section className="flex min-h-dvh flex-col justify-center border-y border-gray-200 bg-gray-50 dark:border-gray-200/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Kiến trúc hệ thống
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-4xl">
            Mô hình Monorepo 3 tầng
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Frontend giao tiếp với Backend qua REST API & Socket.io — không kết
            nối trực tiếp cơ sở dữ liệu.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:gap-2 lg:mt-12">
          {LAYERS.map((layer, index) => {
            const Icon = layer.icon;
            const isLast = index === LAYERS.length - 1;
            return (
              <React.Fragment key={layer.title}>
                <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-7 dark:bg-gray-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md sm:h-14 sm:w-14 dark:bg-gray-200 dark:text-white">
                    <Icon className={layer.iconClass} size={26} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-gray-900 sm:mt-5 sm:text-lg">
                    {layer.title}
                  </h3>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500 sm:text-xs">
                    {layer.tech}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-gray-500 sm:mt-3 sm:text-sm sm:leading-6">
                    {layer.desc}
                  </p>
                </div>

                {!isLast && (
                  <div className="flex items-center justify-center">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm sm:h-10 sm:w-10 dark:bg-gray-100">
                      <PiArrowRight className="hidden md:block" size={20} />
                      <PiArrowLeft className="block rotate-180 md:hidden" size={20} />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="mx-auto mt-8 flex max-w-3xl items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3.5 text-xs text-gray-600 shadow-sm sm:mt-10 sm:px-6 sm:py-4 sm:text-sm dark:bg-gray-100">
          <PiLightningFill className="shrink-0 text-amber-500" size={20} />
          <span>
            Truyền dữ liệu thời gian thực qua <strong>Socket.io</strong> và REST
            API bảo mật JWT giữa các tầng.
          </span>
        </div>
      </div>
    </section>
  );
};

export default ArchitectureSectionComponent;
