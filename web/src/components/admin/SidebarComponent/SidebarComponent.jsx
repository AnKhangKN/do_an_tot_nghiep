import React from "react";
import { Link } from "react-router-dom";

const SidebarComponent = () => {
  const menuItems = [
    { name: "Tổng quan", path: "/admin/dashboard" },
    { name: "Người dùng", path: "/admin/user" },
    { name: "Cứu hộ", path: "/admin/rescuer" },
    { name: "Khu vực nguy hiểm", path: "/admin/dangerous-zone" },
    { name: "Phương tiện", path: "/admin/vehicle" },
    { name: "Loại sự cố", path: "/admin/incident-type" },
    { name: "Map", path: "/admin/map" },
    { name: "Phản hồi", path: "/admin/feedback" },
    { name: "Setting", path: "/admin/setting" },
  ];

  return (
    <div className="border flex flex-col justify-between gap-20 p-4 w-52">
      <div className="bg-blue-400">rescue admin</div>

      <ul className="flex justify-between flex-col h-full border">
        {menuItems.map((item) => (
          <li className="bg-blue-400" key={item.path}>
            <Link to={item.path}>{item.name}</Link>
          </li>
        ))}
      </ul>

      <div>@2026 by AnKhang. All rights reserved.</div>
    </div>
  );
};

export default SidebarComponent;
