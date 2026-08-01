import React from "react";
import {
  PiChatCircleTextFill,
  PiFirstAidFill,
  PiSirenFill,
} from "react-icons/pi";

const STEPS = [
  {
    icon: PiSirenFill,
    iconClass: "text-red-400",
    step: "Bước 1",
    title: "Phát tín hiệu",
    desc: "Người dân phát SOS hoặc báo cáo sự cố qua Mobile App với định vị GPS chính xác.",
  },
  {
    icon: PiChatCircleTextFill,
    iconClass: "text-blue-400",
    step: "Bước 2",
    title: "Tiếp nhận & Điều phối",
    desc: "Hệ thống đẩy thông báo realtime tới cứu hộ viên gần nhất và Trung tâm Admin.",
  },
  {
    icon: PiFirstAidFill,
    iconClass: "text-emerald-400",
    step: "Bước 3",
    title: "Trợ giúp Kịp thời",
    desc: "Cứu hộ viên tiếp cận vị trí qua chỉ đường bản đồ và hoàn thành ca cứu hộ.",
  },
];

const HowItWorksSectionComponent = () => {
  return (
    <section className="flex min-h-dvh flex-col justify-center border-y border-gray-200 bg-gray-50 dark:border-gray-200/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Quy trình hoạt động
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-4xl">
            Cứu hộ trong 3 bước
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Quy trình được tối ưu để phản hồi nhanh nhất trong những tình huống
            nguy cấp.
          </p>
        </div>

        <div className="relative mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:mt-12">
          <div className="absolute left-1/2 top-8 hidden h-px w-2/3 -translate-x-1/2 bg-gray-200 sm:block" />

          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="relative text-center">
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md sm:h-16 sm:w-16 dark:bg-gray-200 dark:text-white">
                  <Icon className={item.iconClass} size={26} />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white shadow sm:h-7 sm:w-7 sm:text-xs">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {item.step}
                </p>
                <h3 className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
                  {item.title}
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSectionComponent;
