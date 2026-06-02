import React from "react";
import {
  PiBellSimpleLight,
  PiMoonLight,
  PiCaretDownLight,
} from "react-icons/pi";
import { useSelector } from "react-redux";
import { useLocation, NavLink } from "react-router-dom";

const HeaderComponent = () => {
  const state = useSelector((state) => state.user);

  const location = useLocation();

  const pathName = [
    { nav: location.pathname === "/admin/dashboard", label: "Tổng quan" },
    { nav: location.pathname === "/admin/user", label: "Người dùng" },
    { nav: location.pathname === "/admin/rescuer", label: "Người cứu hộ" },
    {
      nav: location.pathname === "/admin/dangerous-zone",
      label: "Khu vực nguy hiểm",
    },
    {
      nav: location.pathname === "/admin/incident-type",
      label: "Loại sự cố",
    },
    { nav: location.pathname === "/admin/map", label: "Bản đồ" },
    { nav: location.pathname === "/admin/feedback", label: "Phản hồi" },
    { nav: location.pathname === "/admin/setting", label: "Cài đặt" },
    { nav: location.pathname === "/admin/notification", label: "Thông báo" },
    { nav: location.pathname === "/admin/profile", label: "Hồ sơ cá nhân" },
  ];

  const currentPage = pathName.find((item) => item.nav);

  return (
    <div className="h-20 bg-white border-b border-gray-100 px-6 flex items-center justify-between shadow-sm">
      {/* LEFT */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {currentPage?.label}
        </h1>

        <p className="text-sm text-gray-400 mt-1">
          Welcome back, {state?.user?.fullName}
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-2">
          {/* DARK MODE */}
          <button
            className="
              w-11 h-11 rounded-2xl border border-gray-200
              flex items-center justify-center
              text-gray-600 hover:bg-gray-100
              transition-all duration-200
            "
          >
            <PiMoonLight size={22} />
          </button>

          {/* NOTIFICATION */}
          <NavLink to="/admin/notification">
            <button
              className="
              relative w-11 h-11 rounded-2xl border border-gray-200
              flex items-center justify-center
              text-gray-600 hover:bg-gray-100
              transition-all duration-200
            "
            >
              <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>

              <PiBellSimpleLight size={22} />
            </button>
          </NavLink>
        </div>

        {/* PROFILE */}
        <div className="relative group">
          {/* trigger */}
          <div
            className="
              flex items-center gap-3 cursor-pointer
              border border-gray-200 rounded-3xl
              px-2 py-2 hover:bg-gray-50
              transition-all duration-200
            "
          >
            {/* avatar */}
            <div
              className="
                w-11 h-11 rounded-2xl
                bg-linear-to-br from-gray-800 to-gray-600
                text-white font-semibold
                flex items-center justify-center
                shadow-md
              "
            >
              {state?.user?.fullName?.charAt(0)}
            </div>

            {/* info */}
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {state?.user?.fullName}
              </p>

              <p className="text-xs text-gray-400">Administrator</p>
            </div>

            <PiCaretDownLight className="text-gray-500" />
          </div>

          {/* dropdown */}
          <div
            className="
              absolute right-0 top-full mt-3
              w-56 bg-white border border-gray-100
              rounded-2xl shadow-xl overflow-hidden
              opacity-0 invisible
              group-hover:opacity-100
              group-hover:visible
              transition-all duration-200
              z-50
            "
          >
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-800">
                {state?.user?.fullName}
              </p>

              <p className="text-xs text-gray-400">admin@gmail.com</p>
            </div>

            <div className="p-2">
              <NavLink to="/admin/profile">
                <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-sm transition-all">
                  Hồ sơ cá nhân
                </button>
              </NavLink>

              <NavLink to="/admin/setting">
                <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 text-sm transition-all">
                  Cài đặt
                </button>
              </NavLink>

              <button className="w-full text-left px-3 py-2 rounded-xl hover:bg-red-50 text-red-500 text-sm transition-all">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
