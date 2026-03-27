"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiAmbulanceLight,
  PiCirclesFourLight,
  PiListChecksLight,
  PiSealWarningLight,
  PiSirenLight,
  PiUsersLight,
  PiUserSoundLight,
  PiGearSixLight,
  PiSignOutLight,
  PiCaretLeftLight,
  PiCaretRightLight,
} from "react-icons/pi";

const menuItems = [
  { icon: PiCirclesFourLight, link: "/dashboard", label: "Tổng quan" },
  { icon: PiUserSoundLight, link: "/users", label: "Người dùng" },
  { icon: PiSirenLight, link: "/requests", label: "Yêu cầu" },
  { icon: PiUsersLight, link: "/rescuers", label: "Thành viên" },
  { icon: PiAmbulanceLight, link: "/vehicles", label: "Phương tiện" },
  { icon: PiListChecksLight, link: "/services", label: "Dịch vụ" },
  { icon: PiSealWarningLight, link: "/feedback", label: "Phản hồi" },
];

export default function SidebarComponent() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        relative h-screen flex flex-col bg-white shadow-xl
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-20" : "w-64"}
      `}
    >
      {/* TOGGLE BUTTON */}
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-10 bg-amber-300 py-3 px-1.5 rounded-2xl 
        shadow-2xl shadow-gray-400 cursor-pointer shrink-0"
      >
        {collapsed ? (
          <PiCaretRightLight size={18} />
        ) : (
          <PiCaretLeftLight size={18} />
        )}
      </div>

      {/* LOGO */}
      <div className="p-4">
        <Link
          href="/dashboard"
          className={`flex items-center gap-3 rounded-xl hover:bg-gray-100 transition 
            ${collapsed ? "gap-0" : "gap-3"}`}
        >
          <Image
            src="/images/logo/logo_app.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded-lg shrink-0 border border-gray-800"
          />

          <span
            className={`
              font-semibold text-lg whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-in-out
              ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
            `}
          >
            Rescue Admin
          </span>
        </Link>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-2">
        <ul className="space-y-2">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.link;
            const Icon = item.icon;

            return (
              <li key={idx}>
                <Link
                  href={item.link}
                  className={`
                    flex items-center p-2 rounded-xl
                    transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                   ${collapsed ? "gap-0" : "gap-3"} 
                  `}
                >
                  {/* ICON */}
                  <div
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-lg border shrink-0
                      ${
                        isActive
                          ? "bg-white text-blue-600 border-white"
                          : "border-gray-800 text-gray-600"
                      }
                    `}
                  >
                    <Icon size={20} />
                  </div>

                  {/* LABEL */}
                  <span
                    className={`
                      font-medium whitespace-nowrap overflow-hidden
                      transition-all duration-300 ease-in-out
                      ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* BOTTOM */}
      <div className="p-4 flex flex-col gap-3">
        {/* SETTINGS */}
        <Link
          href="/settings"
          className={`flex items-center gap-3 rounded-xl hover:bg-gray-100 transition ${collapsed ? "gap-0" : "gap-3"}`}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-800 shrink-0">
            <PiGearSixLight size={20} />
          </div>

          <span
            className={`
              whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-in-out
              ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
            `}
          >
            Cài đặt
          </span>
        </Link>

        {/* LOGOUT */}
        <Link
          href="/logout"
          className={`flex items-center rounded-xl hover:bg-red-50 transition 
            ${collapsed ? "gap-0" : "gap-3"}`}
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-600 text-white shrink-0">
            <PiSignOutLight size={20} />
          </div>

          <span
            className={`
              text-red-600 font-medium whitespace-nowrap overflow-hidden
              transition-all duration-300 ease-in-out
              ${collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"}
            `}
          >
            Đăng xuất
          </span>
        </Link>
      </div>
    </aside>
  );
}
