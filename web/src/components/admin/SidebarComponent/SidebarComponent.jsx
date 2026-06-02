import React from "react";
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
} from "react-icons/pi";
import { NavLink } from "react-router-dom";

const SidebarComponent = () => {
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
    <div className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* LOGO */}
      <div className="h-20 flex items-center gap-3 px-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-md">
          <PiLifebuoyFill size={24} />
        </div>

        <div>
          <h1 className="text-lg font-bold text-gray-900">
            Rescue Admin
          </h1>

          <p className="text-xs text-gray-500">
            Hệ thống quản lý cứu hộ
          </p>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 overflow-y-auto px-4 py-6">

        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `
                  group flex items-center gap-2 px-2 py-2 rounded-2xl
                  transition-all duration-200 font-medium text-sm
                  ${
                    isActive
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
                        w-10 h-10 rounded-xl flex items-center justify-center text-lg
                        transition-all duration-200
                        ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-white"
                        }
                      `}
                    >
                      {item.icon}
                    </div>

                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t border-gray-100">
        

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2026 AnKhang
        </p>
      </div>
    </div>
  );
};

export default SidebarComponent;