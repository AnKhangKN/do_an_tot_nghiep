import React from "react";
import { PiDevices, PiWarningCircle } from "react-icons/pi";

const KickedNotification = ({ message, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-100 rounded-3xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-gray-100 flex items-center justify-center mb-4">
            <PiDevices size={32} className="text-gray-900" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Đã đăng nhập trên thiết bị khác
          </h2>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-200 text-left mb-4">
            <PiWarningCircle size={18} className="text-gray-600 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700 font-medium">
              {message || "Tài khoản của bạn đã được đăng nhập trên thiết bị khác. Bạn đã bị đăng xuất khỏi phiên này."}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Vui lòng đăng nhập lại nếu bạn muốn tiếp tục sử dụng trên thiết bị này.
          </p>
          <button
            onClick={onConfirm}
            className="w-full px-5 py-3 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 text-sm font-bold transition shadow-md cursor-pointer"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
};

export default KickedNotification;
