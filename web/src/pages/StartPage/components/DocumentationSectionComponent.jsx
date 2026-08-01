import React from "react";
import {
  PiArrowSquareOut,
  PiFilePdfFill,
  PiGithubLogo,
} from "react-icons/pi";

const DocumentationSectionComponent = ({ data = {} }) => {
  const githubUrl = data.thesis_github_url || "";
  const reportUrl = data.thesis_report_url || "";

  const items = [
    {
      icon: PiGithubLogo,
      iconClass: "text-gray-700",
      title: "Source code",
      desc: "Kho mã nguồn đầy đủ của dự án trên GitHub",
      url: githubUrl,
      cta: "Mở GitHub",
    },
    {
      icon: PiFilePdfFill,
      iconClass: "text-red-500",
      title: "Báo cáo đồ án",
      desc: "Báo cáo đồ án tốt nghiệp định dạng PDF",
      url: reportUrl,
      cta: "Xem báo cáo",
    },
  ];

  return (
    <section className="flex min-h-dvh flex-col justify-center border-y border-gray-200 bg-gray-50 dark:border-gray-200/60">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-gray-500">
            Tài liệu & Source code
          </p>
          <h2 className="mt-3 text-2xl font-bold text-gray-900 sm:text-4xl">
            Tham khảo dự án
          </h2>
          <p className="mt-4 text-sm leading-7 text-gray-500 sm:text-base">
            Truy cập mã nguồn và tài liệu báo cáo chi tiết của đồ án.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-4 sm:gap-6 lg:mt-12 md:grid-cols-2">
          {items.map((item) => {
            const Icon = item.icon;
            const hasUrl = Boolean(item.url);
            return (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md sm:p-7 dark:bg-gray-100"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-200">
                  <Icon className={item.iconClass} size={28} />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-gray-500">{item.desc}</p>
                  {hasUrl ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300"
                    >
                      {item.cta}
                      <PiArrowSquareOut size={14} />
                    </a>
                  ) : (
                    <p className="mt-4 text-xs font-medium text-gray-400">
                      Link sẽ được cập nhật sớm
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DocumentationSectionComponent;
