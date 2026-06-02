import React, { useState } from "react";

const TimeComponent = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setOpen(true)}
        className="border border-gray-300 bg-white px-4 py-2 rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all duration-200"
      >
        Thời gian
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-100 rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Chọn thời gian
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-gray-100 transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="py-6 text-gray-600">
              Nội dung chọn thời gian ở đây...
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                onClick={() => setOpen(false)}
                className="rounded-xl border px-4 py-2 hover:bg-gray-50 transition"
              >
                Hủy
              </button>

              <button className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 transition">
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TimeComponent;