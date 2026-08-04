import React from "react";
import { PiX } from "react-icons/pi";

const submitVariants = {
  primary:
    "bg-gray-900 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 shadow-md",
  success: "bg-green-600 text-white hover:bg-green-700 shadow-md",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-md",
};

const AddUpdateModelComponent = ({
  open = false,
  onClose,
  title = "Tiêu đề",
  subtitle,
  headerIcon,
  children,
  onSubmit,
  submitLabel = "Lưu",
  submitVariant = "primary",
  submitDisabled = false,
  loading = false,
  cancelLabel = "Hủy",
  maxWidth = "max-w-md",
}) => {
  if (!open) return null;

  const handleClose = () => {
    if (loading) return;
    if (onClose) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
      onClick={handleClose}
    >
      <div
        className={`bg-white dark:bg-gray-100 rounded-3xl ${maxWidth} w-full border border-gray-100 shadow-2xl flex flex-col overflow-hidden max-h-screen animate-in fade-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(e);
          }}
          className="flex flex-col overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {headerIcon}
              <div>
                <h3 className="text-base font-bold text-gray-900">{title}</h3>
                {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition flex items-center justify-center cursor-pointer"
            >
              <PiX size={18} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto overscroll-contain flex-1">
            {children}
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="submit"
              disabled={loading || submitDisabled}
              className={`px-5 py-2.5 rounded-2xl text-white text-xs font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer ${
                submitVariants[submitVariant] || submitVariants.primary
              }`}
            >
              {loading ? "Đang xử lý..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUpdateModelComponent;
