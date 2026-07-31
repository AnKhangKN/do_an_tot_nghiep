import React, { useState } from "react";
import { PiCalendarBlankBold, PiCheckBold, PiXBold } from "react-icons/pi";

const TIME_OPTIONS = [
  { label: "7 ngày qua", value: 7 },
  { label: "14 ngày qua", value: 14 },
  { label: "30 ngày qua", value: 30 },
  { label: "90 ngày qua", value: 90 },
];

const TimeComponent = ({ selectedDays = 7, onSelectDays }) => {
  const [open, setOpen] = useState(false);
  const [tempDays, setTempDays] = useState(selectedDays);

  const selectedOption = TIME_OPTIONS.find((opt) => opt.value === selectedDays) || TIME_OPTIONS[0];

  const handleApply = () => {
    if (onSelectDays) {
      onSelectDays(tempDays);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => {
          setTempDays(selectedDays);
          setOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white dark:bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition duration-150 cursor-pointer"
      >
        <PiCalendarBlankBold className="text-lg text-gray-600" />
        <span>{selectedOption.label}</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-100 p-6 shadow-2xl animate-in fade-in zoom-in duration-200 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-900">
                  <PiCalendarBlankBold className="text-xl" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Chọn khoảng thời gian</h2>
                  <p className="text-xs text-gray-500">Lọc dữ liệu thống kê bảng điều khiển</p>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition cursor-pointer"
              >
                <PiXBold className="text-lg" />
              </button>
            </div>

            {/* Options list */}
            <div className="py-5 space-y-2">
              {TIME_OPTIONS.map((option) => {
                const isSelected = tempDays === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setTempDays(option.value)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-sm font-medium transition cursor-pointer ${
                      isSelected
                        ? "bg-gray-900 text-white shadow-sm dark:bg-gray-200 dark:text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <PiCheckBold className="text-lg text-white" />}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={handleApply}
                className="rounded-2xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 shadow-sm transition cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimeComponent;