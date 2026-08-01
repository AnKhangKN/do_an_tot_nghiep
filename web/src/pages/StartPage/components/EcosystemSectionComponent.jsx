import React from "react";
import {
  PiCheckCircleFill,
  PiDeviceMobileFill,
  PiDownloadSimple,
  PiMonitorFill,
  PiQrCodeFill,
} from "react-icons/pi";

const EcosystemSectionComponent = ({ data = {} }) => {
  const apkUrl = data.app_apk_url || "";

  return (
    <section className="flex min-h-dvh flex-col justify-center bg-white dark:bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Hệ sinh thái
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-4xl">
            Đa nền tảng, một hệ thống
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Trải nghiệm liền mạch giữa ứng dụng di động ngoài hiện trường và
            trung tâm điều phối trên web.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:gap-6 lg:mt-12 lg:grid-cols-2">
          {/* Mobile App */}
          <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8 dark:bg-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md dark:bg-gray-200 dark:text-white">
                <PiDeviceMobileFill className="text-blue-400" size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">Mobile App</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Flutter — Nạn nhân & Cứu hộ viên
                </p>
              </div>
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {[
                "Nút SOS nhấn giữ 2 giây chống chạm nhầm",
                "Theo dõi GPS & chỉ đường OSRM thời gian thực",
                "Nhận ca cứu hộ qua mã QR khi mất mạng",
                "Cảnh báo vùng nguy hiểm theo Geofencing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <PiCheckCircleFill className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {apkUrl ? (
              <a
                href={apkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300"
              >
                <PiDownloadSimple size={18} />
                Tải App (APK)
              </a>
            ) : (
              <div className="mt-7 inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-400">
                <PiQrCodeFill size={18} />
                Link tải App chưa có
              </div>
            )}
          </div>

          {/* Web Admin */}
          <div className="flex flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-8 dark:bg-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md dark:bg-gray-200 dark:text-white">
                <PiMonitorFill className="text-amber-400" size={28} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 sm:text-lg">Web Admin</h3>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  React & Tailwind — Ban quản lý & điều phối
                </p>
              </div>
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {[
                "Dashboard theo dõi ca SOS thời gian thực",
                "Bản đồ heatmap điểm nóng & vùng nguy hiểm",
                "Điều phối, quản lý cứu hộ viên và tiện ích",
                "Kiểm duyệt AI & báo cáo chất lượng dịch vụ",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <PiCheckCircleFill className="mt-0.5 shrink-0 text-emerald-500" size={18} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemSectionComponent;
