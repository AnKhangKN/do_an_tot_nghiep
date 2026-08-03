import React from "react";
import {
  PiDownloadSimple,
  PiGraduationCapFill,
  PiMapPinFill,
  PiNavigationArrowFill,
  PiShieldCheckFill,
  PiSirenFill,
  PiWarningFill,
} from "react-icons/pi";

const HeroSectionComponent = ({ data = {} }) => {
  const apkUrl = data.app_apk_url || "";
  const school = data.thesis_school || "";
  const supervisor = data.thesis_supervisor || "";

  return (
    <section className="relative flex min-h-dvh flex-col justify-center overflow-hidden bg-gray-950 text-white will-change-transform dark:bg-[#05060a]">
      <div className="absolute -right-32 top-24 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/30" />
      <div className="absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-red-500/15 blur-3xl dark:bg-red-500/25" />
      <div className="absolute left-1/2 top-0 h-40 w-[42rem] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl dark:bg-cyan-400/20" />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-4 py-12 sm:gap-10 sm:px-6 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-3 lg:mb-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-gray-200 sm:px-4 sm:py-2 sm:text-sm dark:bg-white dark:text-gray-900">
              <PiGraduationCapFill className="text-amber-300" size={17} />
              Đồ án tốt nghiệp
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-gray-200 sm:inline-flex dark:bg-white dark:text-gray-900">
              <PiShieldCheckFill className="text-emerald-300" size={18} />
              Trung tâm điều phối cứu hộ
            </div>
          </div>

          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl xl:text-6xl dark:text-white">
            Hệ thống Cứu hộ Khẩn cấp{" "}
            <span className="text-red-400">Thời gian thực</span> & Định vị
            Cảnh báo Nhanh chóng
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-gray-300 sm:mt-6 sm:text-base dark:text-gray-400">
            Kết nối tức thì người cần trợ giúp với đội ngũ cứu hộ và trung tâm
            điều phối chuyên nghiệp — trên Mobile App và Web Admin.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row">
            {apkUrl ? (
              <a
                href={apkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-600/25 transition hover:bg-red-500"
              >
                <PiDownloadSimple size={19} />
                Tải ứng dụng Mobile
              </a>
            ) : (
              <button
                type="button"
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3.5 text-sm font-semibold text-white opacity-70"
              >
                <PiDownloadSimple size={19} />
                Tải ứng dụng Mobile
              </button>
            )}
          </div>

          {(school || supervisor) && (
            <p className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-400">
              <PiGraduationCapFill className="text-amber-300" size={17} />
              {school && <span className="dark:text-gray-400">{school}</span>}
              {school && supervisor && <span className="text-gray-600 dark:text-gray-400">•</span>}
              {supervisor && (
                <span>
                  Giảng viên hướng dẫn: <span className="text-gray-300 dark:text-gray-400">{supervisor}</span>
                </span>
              )}
            </p>
          )}
        </div>

        {/* Ẩn mockup trên màn hình nhỏ (< sm), hiển thị từ sm trở lên */}
        <div className="hidden sm:block">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
};

const HeroMockup = () => {
  return (
    <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
      <div className="absolute -inset-8 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Phone frame */}
      <div className="relative w-[220px] rounded-[2.2rem] border border-white/15 bg-gray-900 p-3 shadow-2xl sm:w-[270px] sm:rounded-[2.6rem] lg:w-[290px] dark:border-white/25 dark:bg-gray-800">
        <div className="overflow-hidden rounded-[1.7rem] bg-gray-950 sm:rounded-[2.1rem] dark:bg-black">
          <div className="flex items-center justify-between px-6 pb-2 pt-5">
            <span className="text-[11px] font-semibold text-gray-300">9:41</span>
            <div className="h-2.5 w-14 rounded-full bg-gray-800" />
          </div>

          <div className="relative mx-3 h-44 overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 sm:h-52 lg:h-56">
            <div className="absolute inset-0 opacity-25">
              <div className="absolute left-0 top-0 h-px w-full bg-gray-700/60" />
              <div className="absolute left-0 top-1/4 h-px w-full bg-gray-700/60" />
              <div className="absolute left-0 top-2/4 h-px w-full bg-gray-700/60" />
              <div className="absolute left-0 top-3/4 h-px w-full bg-gray-700/60" />
              <div className="absolute left-0 top-full h-px w-full bg-gray-700/60" />
              <div className="absolute left-1/4 top-0 h-full w-px bg-gray-700/60" />
              <div className="absolute left-2/4 top-0 h-full w-px bg-gray-700/60" />
              <div className="absolute left-3/4 top-0 h-full w-px bg-gray-700/60" />
            </div>

            <div className="absolute bottom-10 left-8 h-24 w-32 rounded-t-full border-2 border-b-0 border-blue-400/60" />
            <div className="absolute bottom-10 right-6 h-20 w-28 rounded-t-full border-2 border-b-0 border-blue-400/60" />

            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-xl bg-red-600 px-2.5 py-1.5 text-[10px] font-bold text-white shadow-lg">
              <PiSirenFill size={13} />
              SOS #1042
            </div>

            <div className="absolute left-1/2 top-12 -translate-x-1/2 rounded-full bg-red-600 p-2 shadow-lg shadow-red-600/40">
              <PiSirenFill size={22} />
            </div>
          </div>

          <div className="px-8 pb-5 pt-3 text-center sm:pb-6 sm:pt-4">
            <button
              type="button"
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-600 text-xs font-black tracking-wide shadow-xl shadow-red-600/40 ring-4 ring-red-600/30 sm:h-20 sm:w-20 sm:text-sm"
            >
              SOS
            </button>
            <p className="mt-3 text-xs font-semibold text-gray-300">
              Giữ nút để phát tín hiệu khẩn cấp
            </p>
          </div>
        </div>
      </div>

      {/* Floating rescue card */}
      <div className="absolute -left-2 top-8 rounded-2xl border border-white/10 bg-gray-800/95 p-3 shadow-xl sm:-left-6 dark:border-white/15 dark:bg-gray-900/95">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <PiNavigationArrowFill size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white dark:text-gray-900">Cứu hộ viên đang tới</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-900">Cách hiện trường 1.2 km</p>
          </div>
        </div>
      </div>

      {/* Floating danger zone card */}
      <div className="absolute -right-2 bottom-16 rounded-2xl border border-white/10 bg-gray-800/95 p-3 shadow-xl sm:-right-8 dark:border-white/15 dark:bg-gray-900/95">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
            <PiWarningFill size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white dark:text-gray-900">Vùng nguy hiểm</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-900">Cảnh báo ngập lụt trong 500m</p>
          </div>
        </div>
      </div>

      {/* Floating amenity card */}
      <div className="absolute -bottom-4 left-6 rounded-2xl border border-white/10 bg-gray-800/95 p-3 shadow-xl dark:border-white/15 dark:bg-gray-900/95">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
            <PiMapPinFill size={18} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-white dark:text-gray-900">Tiện ích gần nhất</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-900">Bệnh viện Đa khoa • 350m</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSectionComponent;
