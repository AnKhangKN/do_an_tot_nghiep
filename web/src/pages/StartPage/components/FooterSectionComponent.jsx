import React from "react";
import {
  PiEnvelopeFill,
  PiGraduationCapFill,
  PiPhoneCallFill,
  PiPhoneFill,
} from "react-icons/pi";

const FooterSectionComponent = ({ data = {} }) => {
  const hotlines = [
    {
      number: data.hotline_medical || "115",
      label: "Cấp cứu y tế",
    },
    {
      number: data.hotline_fire || "114",
      label: "Chữa cháy & Cứu nạn",
    },
    {
      number: data.hotline_police || "113",
      label: "Cảnh sát",
    },
  ];

  const school = data.thesis_school || "";
  const author = data.thesis_author_name || "";
  const studentId = data.thesis_student_id || "";
  const thesisClass = data.thesis_class || "";
  const supervisor = data.thesis_supervisor || "";
  const email = data.thesis_contact_email || "";
  const phone = data.thesis_contact_phone || "";

  return (
    <footer
      className="flex min-h-dvh flex-col justify-center bg-gray-950 text-white"
      style={{
        "--color-gray-50": "#f9fafb",
        "--color-gray-100": "#f3f4f6",
        "--color-gray-200": "#e5e7eb",
        "--color-gray-300": "#d1d5db",
        "--color-gray-400": "#9ca3af",
        "--color-gray-500": "#6b7280",
        "--color-gray-600": "#4b5563",
        "--color-gray-700": "#374151",
        "--color-gray-800": "#1f2937",
        "--color-gray-900": "#111827",
        "--color-gray-950": "#030712",
      }}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr] lg:gap-12">
          {/* Brand & emergency */}
          <div>
            <div className="flex items-center gap-3.5">
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 p-0.5 ring-1 ring-white/20 shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105">
                <img
                  src="/images/SOS-black.png"
                  alt="Rescue System"
                  className="h-full w-full rounded-[14px] object-cover"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight leading-tight">
                  Rescue System
                </h3>
                <p className="mt-0.5 text-xs font-medium text-gray-400">
                  Hệ thống Cứu hộ Khẩn cấp dựa trên định vị GPS và cơ chế thông báo tức thời
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-400">
              Kết nối tức thì người cần trợ giúp với đội ngũ cứu hộ và trung
              tâm điều phối chuyên nghiệp.
            </p>

            <div className="mt-6">
              <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-300">
                <PiPhoneCallFill className="text-red-400" size={18} />
                Gọi khẩn cấp ngay
              </p>
              <div className="flex flex-wrap gap-3">
                {hotlines.map((hotline) => (
                  <a
                    key={hotline.number}
                    href={`tel:${hotline.number}`}
                    className="flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
                  >
                    <PiPhoneCallFill size={16} className="text-emerald-300" />
                    {hotline.number}
                    <span className="hidden text-xs font-normal text-gray-400 sm:inline">
                      {hotline.label}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Author / thesis info */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
              <PiGraduationCapFill className="text-amber-300" size={18} />
              Đồ án tốt nghiệp
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-gray-300">
              {school && (
                <li className="flex flex-col">
                  <span className="text-xs text-gray-500">Trường</span>
                  <span className="font-medium">{school}</span>
                </li>
              )}
              {author && (
                <li className="flex flex-col">
                  <span className="text-xs text-gray-500">Sinh viên thực hiện</span>
                  <span className="font-medium">
                    {author}
                    {studentId && <span className="text-gray-400"> — {studentId}</span>}
                    {thesisClass && <span className="text-gray-400"> • {thesisClass}</span>}
                  </span>
                </li>
              )}
              {supervisor && (
                <li className="flex flex-col">
                  <span className="text-xs text-gray-500">Giảng viên hướng dẫn</span>
                  <span className="font-medium">{supervisor}</span>
                </li>
              )}
              {!school && !author && !supervisor && (
                <li className="text-gray-500">Thông tin đồ án sẽ được cập nhật</li>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-400">
              <PiPhoneFill className="text-blue-300" size={18} />
              Liên hệ dự án
            </h4>
            <ul className="mt-5 space-y-3 text-sm text-gray-300">
              {email && (
                <li>
                  <a
                    href={`mailto:${email}?subject=${encodeURIComponent(
                      "Liên hệ - Hệ thống Cứu hộ Khẩn cấp Thời gian thực",
                    )}&body=${encodeURIComponent(
                      "Xin chào,\n\nTôi muốn tìm hiểu thêm về hệ thống cứu hộ khẩn cấp thời gian thực.\n\nTrân trọng.",
                    )}`}
                    className="flex items-center gap-2.5 transition hover:text-white"
                  >
                    <PiEnvelopeFill className="shrink-0 text-gray-500" size={17} />
                    {email}
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center gap-2.5 transition hover:text-white"
                  >
                    <PiPhoneFill className="shrink-0 text-gray-500" size={17} />
                    {phone}
                  </a>
                </li>
              )}
              {!email && !phone && (
                <li className="text-gray-500">Chưa có thông tin liên hệ</li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-gray-500 sm:flex-row">
          <p>
            © 2026 Rescue System — Đồ án tốt nghiệp Hệ thống Cứu hộ Khẩn cấp
            Thời gian thực.
          </p>
          <div className="flex items-center gap-4">
            <span>Bản quyền thuộc tác giả đồ án</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSectionComponent;
