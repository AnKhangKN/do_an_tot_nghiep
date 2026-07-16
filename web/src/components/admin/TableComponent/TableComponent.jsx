import React, { useState } from "react";
import { PiX } from "react-icons/pi";

const TableComponent = ({
  columns = [],
  data = [],
  rowKey = "id",

  // pagination props
  page = 1,
  totalPages = 1,
  onPageChange = () => { },

  loading = false,
  onRowClick, // Callback tùy chọn từ component cha
}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const handleRowClick = (row, index, event) => {
    // Ngăn hiển thị chi tiết khi người dùng nhấn vào các thẻ tương tác như button, link, input...
    if (
      event.target.closest("button") ||
      event.target.closest("a") ||
      event.target.closest("input") ||
      event.target.closest("select") ||
      event.target.closest("textarea")
    ) {
      return;
    }

    if (onRowClick) {
      onRowClick(row, index);
    } else {
      setSelectedRow(row);
      setSelectedRowIndex(index);
    }
  };

  const closeModal = () => {
    setSelectedRow(null);
    setSelectedRowIndex(null);
  };

  return (
    <div className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden bg-white">

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          <thead className="bg-gray-900">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-5 py-4 text-left font-semibold text-white text-sm tracking-wider"
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {/* loading */}
            {loading && (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500 text-sm">
                  Đang tải dữ liệu...
                </td>
              </tr>
            )}

            {/* empty */}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-gray-500 text-sm">
                  Không có dữ liệu
                </td>
              </tr>
            )}

            {/* data */}
            {!loading &&
              data.map((row, index) => (
                <tr
                  key={row[rowKey] || index}
                  onClick={(e) => handleRowClick(row, index, e)}
                  className="hover:bg-gray-50/80 transition-colors duration-150 cursor-pointer"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-5 py-4 text-sm text-gray-700">
                      {col.render
                        ? col.render(row, index)
                        : row[col.dataIndex]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>

        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2 p-4 bg-white border-t border-gray-100">

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-xl border text-sm font-semibold flex items-center justify-center transition-all duration-200
                ${page === p
                  ? "bg-gray-900 text-white border-gray-900 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              {p}
            </button>
          ))}

        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedRow && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex justify-end backdrop-blur-sm transition-all duration-300"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-l-3xl max-w-md w-full border-l border-gray-100 shadow-2xl flex flex-col overflow-hidden h-full animate-in fade-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Chi tiết thông tin
              </h3>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition flex items-center justify-center"
              >
                <PiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              {columns
                .filter((col) => col.key !== "index" && col.key !== "action")
                .map((col) => {
                  const val = col.render
                    ? col.render(selectedRow, selectedRowIndex)
                    : selectedRow[col.dataIndex];
                  return (
                    <div
                      key={col.key}
                      className="flex flex-col gap-1.5 border-b border-gray-100 pb-3.5 last:border-0 last:pb-0"
                    >
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {col.title}
                      </span>
                      <div className="text-sm font-medium text-gray-900 leading-relaxed">
                        {val || <em className="text-gray-400">Không có dữ liệu</em>}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition shadow-md hover:shadow-lg active:scale-95"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TableComponent;