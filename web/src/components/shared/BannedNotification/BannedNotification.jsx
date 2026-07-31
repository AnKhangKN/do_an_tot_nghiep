import React from "react";
import { PiLock, PiWarningCircle, PiPaperPlaneTilt } from "react-icons/pi";

const BannedNotification = ({ reason, onAppeal, onLogout }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[99999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-100 rounded-3xl max-w-md w-full mx-4 shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center mb-4">
            <PiLock size={32} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Tài khoản đã bị khóa
          </h2>
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-red-50 border border-red-200 text-left mb-4">
            <PiWarningCircle size={18} className="text-red-600 mt-0.5 shrink-0" />
            <span className="text-sm text-red-700 font-medium">
              {reason || "Tài khoản của bạn đã bị Admin khóa do vi phạm chính sách hệ thống."}
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Bạn không thể tiếp tục sử dụng ứng dụng cho đến khi tài khoản được mở khóa.
          </p>
          <div className="flex flex-col gap-3">
            {onAppeal && (
              <button
                onClick={onAppeal}
                className="w-full px-5 py-3 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 text-sm font-bold transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <PiPaperPlaneTilt size={18} />
                Gửi yêu cầu kháng cáo
              </button>
            )}
            <button
              onClick={onLogout}
              className="w-full px-5 py-3 rounded-2xl bg-white dark:bg-gray-100 text-gray-700 hover:bg-gray-100 text-sm font-bold transition border border-gray-200 cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannedNotification;
