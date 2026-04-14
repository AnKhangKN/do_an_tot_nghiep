import React from "react";
import {
  PiRectangleFill,
  PiTriangleFill,
  PiUserFill,
  PiShieldFill,
  PiWarningFill,
  PiCarFill,
  PiMapPinFill,
  PiChatCircleFill,
  PiGearFill,
} from "react-icons/pi";
import { NavLink } from "react-router-dom";

const SidebarComponent = () => {
  const menuItems = [
    { name: "Tổng quan", path: "/admin/dashboard", icon: <PiRectangleFill /> },
    { name: "Người dùng", path: "/admin/user", icon: <PiUserFill /> },
    { name: "Cứu hộ", path: "/admin/rescuer", icon: <PiShieldFill /> },
    {
      name: "Khu vực nguy hiểm",
      path: "/admin/dangerous-zone",
      icon: <PiWarningFill />,
    },
    { name: "Phương tiện", path: "/admin/vehicle", icon: <PiCarFill /> },
    {
      name: "Loại sự cố",
      path: "/admin/incident-type",
      icon: <PiTriangleFill />,
    },
    { name: "Bản đồ", path: "/admin/map", icon: <PiMapPinFill /> },
    { name: "Phản hồi", path: "/admin/feedback", icon: <PiChatCircleFill /> },
    { name: "Cài đặt", path: "/admin/setting", icon: <PiGearFill /> },
  ];

  return (
    <div className="w-60 h-screen bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-4 text-lg font-bold">🚑 Rescue Admin</div>

      {/* Menu */}
      <ul className="flex-1 overflow-y-auto p-2 space-y-1">
        {menuItems.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all
                ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="p-3 text-xs text-gray-500 border-t">© 2026 AnKhang</div>
    </div>
  );
};

export default SidebarComponent;
