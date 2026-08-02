import React from "react";
import { Link } from "react-router-dom";
import { PiArrowLeft, PiWarningFill } from "react-icons/pi";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10 text-gray-900">
      <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md dark:bg-gray-200 dark:text-white">
          <PiWarningFill size={30} />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-500">
          <img
            src="/images/SOS-black.png"
            alt="Rescue Admin"
            className="h-5 w-5 rounded-md object-contain shrink-0"
          />
          Rescue Admin
        </div>

        <h1 className="mt-4 text-5xl font-bold">404</h1>
        <p className="mt-3 text-base font-semibold">Không tìm thấy trang</p>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Đường dẫn này không tồn tại hoặc bạn không có quyền truy cập.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/admin/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300"
          >
            <PiArrowLeft size={18} />
            Trang chủ
          </Link>

          <Link
            to="/admin/login"
            className="inline-flex flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white dark:bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
