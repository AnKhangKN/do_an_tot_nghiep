import React from "react";
import { PiX } from "react-icons/pi";

const actionVariants = {
  primary:
    "bg-gray-900 text-white hover:bg-slate-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 shadow-md",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  danger: "bg-rose-50 text-rose-600 hover:bg-rose-100",
  warning: "bg-amber-50 text-amber-700 hover:bg-amber-100",
  ghost: "bg-gray-100 text-gray-700 hover:bg-gray-200",
};

const CellDetailComponent = ({
  open = false,
  onClose,
  title = "Chi tiết thông tin bản ghi",
  subtitle = "Hiển thị đầy đủ nội dung chi tiết",
  columns = [],
  row = null,
  rowIndex = 0,
  imageUrl = null,
  extraFields = [],
  children,
  actions = [],
  closeLabel = "Đóng",
}) => {
  if (!open) return null;

  const renderValue = (col) => {
    const dataKey = col.dataIndex || col.key;
    const rawVal = dataKey && row[dataKey] !== undefined ? row[dataKey] : null;
    const renderedVal = col.render ? col.render(row, rowIndex) : null;

    if (
      rawVal !== undefined &&
      rawVal !== null &&
      rawVal !== "" &&
      typeof rawVal !== "object"
    ) {
      return (
        <div className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap break-words bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
          {typeof rawVal === "boolean"
            ? rawVal
              ? "Có / Hoạt động"
              : "Không / Tắt"
            : String(rawVal)}
        </div>
      );
    }
    return (
      <div className="text-sm font-medium text-gray-900 leading-relaxed">
        {renderedVal || <em className="text-gray-400">Không có dữ liệu</em>}
      </div>
    );
  };

  const renderAction = (action) => {
    const Icon = action.icon;
    return (
      <button
        key={action.key}
        type="button"
        onClick={action.onClick}
        disabled={action.loading || action.disabled}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
          actionVariants[action.variant] || actionVariants.primary
        }`}
      >
        {Icon && <Icon size={15} />}
        {action.loading ? "Đang xử lý..." : action.label}
      </button>
    );
  };

  const leftActions = actions.filter((a) => a.position === "left" && !a.hidden);
  const rightActions = actions.filter((a) => a.position !== "left" && !a.hidden);

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 z-[9999] flex justify-end"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-100 rounded-l-3xl max-w-lg w-full border-l border-gray-100 shadow-xl flex flex-col overflow-hidden h-screen animate-in fade-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-gray-400 hover:bg-gray-200/60 hover:text-gray-900 transition flex items-center justify-center cursor-pointer"
          >
            <PiX size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto overscroll-contain scroll-smooth space-y-5 flex-1 font-sans">
          {children ?? (
            <>
              {imageUrl && (
                <div className="flex flex-col gap-1.5 border-b border-gray-100 pb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Hình ảnh đính kèm
                  </span>
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center max-h-64">
                    <img
                      src={imageUrl}
                      alt="Hình ảnh đính kèm"
                      className="w-full h-auto max-h-64 object-cover rounded-2xl"
                    />
                  </div>
                </div>
              )}

              {columns
                .filter((col) => col.key !== "index" && col.key !== "action")
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex flex-col gap-1.5 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {col.title}
                    </span>
                    {renderValue(col)}
                  </div>
                ))}

              {extraFields.length > 0 && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Thông tin bổ sung khác
                  </h4>
                  {extraFields.map(([key, val]) => {
                    const displayLabel = key
                      .replace(/_/g, " ")
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (s) => s.toUpperCase());
                    return (
                      <div
                        key={key}
                        className="flex flex-col gap-1.5 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-xs font-semibold text-gray-500">
                          {displayLabel}
                        </span>
                        <div className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap break-words bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                          {typeof val === "object"
                            ? JSON.stringify(val, null, 2)
                            : String(val)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
          {leftActions.length > 0 && (
            <div className="flex items-center gap-2">{leftActions.map(renderAction)}</div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            {rightActions.map(renderAction)}
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-slate-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 text-xs font-bold transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellDetailComponent;
