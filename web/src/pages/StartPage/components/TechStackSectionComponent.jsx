import React from "react";
import {
  PiBellFill,
  PiCodeBlockFill,
  PiDatabaseFill,
  PiDeviceMobileFill,
  PiHardDrivesFill,
  PiLightningFill,
  PiMapTrifoldFill,
  PiQueueFill,
  PiSparkleFill,
  PiStackFill,
} from "react-icons/pi";

const TECHNOLOGIES = [
  { icon: PiCodeBlockFill, name: "React & Vite", desc: "Web Admin" },
  { icon: PiHardDrivesFill, name: "Express.js", desc: "Backend API" },
  { icon: PiDatabaseFill, name: "PostgreSQL", desc: "CSDL quan hệ" },
  { icon: PiStackFill, name: "Redis Geo", desc: "Định vị & cache" },
  { icon: PiLightningFill, name: "Socket.io", desc: "Realtime" },
  { icon: PiDeviceMobileFill, name: "Flutter", desc: "Mobile App" },
  { icon: PiQueueFill, name: "BullMQ", desc: "Hàng đợi công việc" },
  { icon: PiBellFill, name: "Firebase FCM", desc: "Push notification" },
  { icon: PiSparkleFill, name: "Groq AI", desc: "Kiểm duyệt & phân tích" },
  { icon: PiMapTrifoldFill, name: "React Leaflet", desc: "Bản đồ tương tác" },
];

const TechStackSectionComponent = () => {
  return (
    <section className="flex min-h-dvh flex-col justify-center bg-white dark:bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Công nghệ sử dụng
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-4xl">
            Kiến trúc kỹ thuật hiện đại
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Kết hợp hạ tầng thời gian thực, AI và nền tảng di động để đảm bảo
            phản hồi nhanh, ổn định.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-14 lg:grid-cols-5">
          {TECHNOLOGIES.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="flex flex-col items-center rounded-3xl border border-gray-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6 dark:bg-gray-100"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-md sm:h-12 sm:w-12 dark:bg-gray-200 dark:text-white">
                  <Icon size={22} className="text-emerald-400" />
                </div>
                <p className="mt-3 text-xs font-bold text-gray-900 sm:mt-4 sm:text-sm">
                  {tech.name}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
                  {tech.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TechStackSectionComponent;
