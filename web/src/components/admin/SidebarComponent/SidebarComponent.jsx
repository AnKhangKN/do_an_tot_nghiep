import React, { useState } from "react";
import {
  PiRectangleFill,
  PiTriangleFill,
  PiUserFill,
  PiShieldFill,
  PiWarningFill,
  PiMapPinFill,
  PiChatCircleFill,
  PiGearFill,
  PiLifebuoyFill,
  PiTrophyFill,
  PiCaretLeftBold,
} from "react-icons/pi";
import { NavLink } from "react-router-dom";

const SidebarComponent = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      name: "Tổng quan",
      path: "/admin/dashboard",
      icon: <PiRectangleFill />,
    },
    {
      name: "Người dùng",
      path: "/admin/user",
      icon: <PiUserFill />,
    },
    {
      name: "Người cứu hộ",
      path: "/admin/rescuer",
      icon: <PiShieldFill />,
    },
    {
      name: "Hiệu suất Cứu hộ",
      path: "/admin/rescuer-analytics",
      icon: <PiTrophyFill />,
    },
    {
      name: "Khu vực nguy hiểm",
      path: "/admin/dangerous-zone",
      icon: <PiWarningFill />,
    },
    {
      name: "Loại sự cố",
      path: "/admin/incident-type",
      icon: <PiTriangleFill />,
    },
    {
      name: "Bản đồ",
      path: "/admin/map",
      icon: <PiMapPinFill />,
    },
    {
      name: "Phản hồi",
      path: "/admin/feedback",
      icon: <PiChatCircleFill />,
    },
    {
      name: "Cài đặt",
      path: "/admin/setting",
      icon: <PiGearFill />,
    },
  ];

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm transition-all duration-300 ease-in-out shrink-0 select-none ${isCollapsed ? "w-24" : "w-72"
        }`}
    >
      {/* LOGO & TOGGLE BUTTON */}
      <div className="h-20 flex items-center justify-between px-3.5 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-md shrink-0">
            <PiLifebuoyFill size={24} />
          </div>

          <div
            className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${isCollapsed
                ? "opacity-0 max-w-0 pointer-events-none"
                : "opacity-100 max-w-[160px] ml-3"
              }`}
          >
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Rescue Admin
            </h1>
            <p className="text-xs text-gray-500">Hệ thống cứu hộ</p>
          </div>
        </div>

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer active:scale-95"
          title={isCollapsed ? "Mở rộng Sidebar" : "Thu gọn Sidebar"}
        >
          <PiCaretLeftBold
            className={`text-sm transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""
              }`}
          />
        </button>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `
                  group flex items-center px-2 py-2 rounded-2xl
                  transition-all duration-300 font-medium text-sm gap-3
                  ${isActive
                    ? "bg-gray-900 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }
                `
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`
                        w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0
                        transition-all duration-300
                        ${isActive
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600 group-hover:bg-white"
                        }
                      `}
                    >
                      {item.icon}
                    </div>

                    <span
                      className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${isCollapsed
                          ? "opacity-0 max-w-0 pointer-events-none"
                          : "opacity-100 max-w-[180px]"
                        }`}
                    >
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100 flex justify-center items-center overflow-hidden">
        <p
          className={`text-center text-xs text-gray-400 transition-all duration-300 ease-in-out whitespace-nowrap ${isCollapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-[200px]"
            }`}
        >
          © 2026 AnKhang
        </p>
      </div>
    </div>
  );
};

export default SidebarComponent;