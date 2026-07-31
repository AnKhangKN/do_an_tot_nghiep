import React, { useState, useMemo } from "react";
import { PiX, PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

const TableComponent = ({
  columns = [],
  data = [],
  rowKey = "id",

  // direct pagination props
  page: directPage,
  totalPages: directTotalPages,
  onPageChange: directOnPageChange,

  // object pagination prop (support pagination={{ page, totalPages, total, limit, onChange }})
  pagination,

  loading = false,
  onRowClick, // Callback tùy chọn từ component cha
}) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // Memoize image URL extraction for selectedRow
  const attachedImage = useMemo(() => {
    if (!selectedRow) return null;
    return selectedRow.imageUrl || selectedRow.image_url || selectedRow.avatarUrl || selectedRow.avatar_url || selectedRow.iconUrl || null;
  }, [selectedRow]);

  // Memoize extra fields calculation for selectedRow
  const extraFields = useMemo(() => {
    if (!selectedRow) return [];
    const columnDataIndexes = new Set(columns.map((c) => c.dataIndex).filter(Boolean));
    const columnKeys = new Set(columns.map((c) => c.key).filter(Boolean));

    return Object.entries(selectedRow).filter(([key, val]) => {
      if (!key || val === null || val === undefined || val === "") return false;
      if (columnDataIndexes.has(key) || columnKeys.has(key)) return false;
      if (["index", "action", "password", "token", "imageUrl", "image_url", "avatarUrl", "avatar_url"].includes(key)) return false;
      return true;
    });
  }, [selectedRow, columns]);

  // Normalize pagination parameters across direct props & pagination object
  const activePage = directPage ?? pagination?.page ?? 1;
  const calculatedTotalPages = directTotalPages ?? pagination?.totalPages ?? (pagination?.total && pagination?.limit ? Math.ceil(pagination.total / pagination.limit) : 1);
  const totalPages = Math.max(1, calculatedTotalPages);
  const totalItems = pagination?.total ?? data.length;
  const pageChangeHandler = directOnPageChange || pagination?.onPageChange || pagination?.onChange || (() => {});

  const handlePageClick = (p) => {
    if (p >= 1 && p <= totalPages && p !== activePage) {
      pageChangeHandler(p);
    }
  };

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
    <div className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden bg-white dark:bg-gray-100">

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">

          <thead className="bg-gray-900 dark:bg-gray-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3.5 text-left font-semibold text-white text-xs uppercase tracking-wider whitespace-nowrap align-middle"
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
                  {columns.map((col) => {
                    const content = col.render ? col.render(row, index) : row[col.dataIndex];
                    const isSpecialCol = col.key === "action" || col.key === "index";
                    return (
                      <td key={col.key} className="px-4 py-3.5 text-sm text-gray-700 align-middle">
                        {isSpecialCol ? (
                          content
                        ) : (
                          <div className="line-clamp-2 overflow-hidden leading-relaxed">{content}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>

        </table>
      </div>

      {/* PAGINATION FOOTER */}
      {(totalPages >= 1 || totalItems > 0) && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-gray-100 border-t border-gray-100">
          <div className="text-xs text-gray-500 font-medium">
            {totalItems > 0 ? (
              <>
                Hiển thị trang <span className="font-bold text-gray-900">{activePage}</span> / <span className="font-bold text-gray-900">{totalPages}</span> (Tổng số <span className="font-bold text-gray-900">{totalItems}</span> bản ghi)
              </>
            ) : (
              <span>Trang {activePage} / {totalPages}</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Nút Trước */}
            <button
              type="button"
              disabled={activePage <= 1}
              onClick={() => handlePageClick(activePage - 1)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-100 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-100 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <PiCaretLeftBold size={14} />
              <span>Trước</span>
            </button>

            {/* Các nút số trang */}
            {(() => {
              const pages = [];

              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (activePage > 3) pages.push("...");

                const start = Math.max(2, activePage - 1);
                const end = Math.min(totalPages - 1, activePage + 1);

                for (let i = start; i <= end; i++) {
                  if (!pages.includes(i)) pages.push(i);
                }

                if (activePage < totalPages - 2) pages.push("...");
                pages.push(totalPages);
              }

              return pages.map((p, idx) => {
                if (p === "...") {
                  return (
                    <span key={`dots-${idx}`} className="px-2 text-xs text-gray-400 font-bold select-none">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageClick(p)}
                    className={`w-8 h-8 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all duration-200 ${
                      activePage === p
                        ? "bg-gray-900 text-white border-gray-900 shadow-sm dark:bg-gray-200 dark:text-white dark:border-gray-100"
                        : "bg-white dark:bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {p}
                  </button>
                );
              });
            })()}

            {/* Nút Sau */}
            <button
              type="button"
              disabled={activePage >= totalPages}
              onClick={() => handlePageClick(activePage + 1)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white dark:bg-gray-100 hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-gray-100 disabled:cursor-not-allowed transition-all flex items-center gap-1"
            >
              <span>Sau</span>
              <PiCaretRightBold size={14} />
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL DRAWER */}
      {selectedRow && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-[9999] flex justify-end transition-opacity duration-200"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-100 rounded-l-3xl max-w-lg w-full border-l border-gray-100 shadow-xl flex flex-col overflow-hidden h-full transform-gpu will-change-transform overscroll-contain animate-in fade-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Chi tiết thông tin bản ghi
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                  Hiển thị đầy đủ nội dung chi tiết
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-2xl text-gray-400 hover:bg-gray-200/60 hover:text-gray-900 transition flex items-center justify-center cursor-pointer"
              >
                <PiX size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto overscroll-contain scroll-smooth space-y-5 flex-1 font-sans">
              {/* Load & Hiển thị ảnh nếu dòng đó có chứa hình ảnh */}
              {attachedImage && (
                <div className="flex flex-col gap-1.5 border-b border-gray-100 pb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Hình ảnh đính kèm
                  </span>
                  <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center max-h-64">
                    <img
                      src={attachedImage}
                      alt="Hình ảnh đính kèm"
                      className="w-full h-auto max-h-64 object-cover rounded-2xl"
                    />
                  </div>
                </div>
              )}

              {/* Lặp qua các cột chính để hiển thị nội dung đầy đủ */}
              {columns
                .filter((col) => col.key !== "index" && col.key !== "action")
                .map((col) => {
                  const dataKey = col.dataIndex || col.key;
                  const rawVal = dataKey && selectedRow[dataKey] !== undefined ? selectedRow[dataKey] : null;
                  const renderedVal = col.render ? col.render(selectedRow, selectedRowIndex) : null;

                  return (
                    <div
                      key={col.key}
                      className="flex flex-col gap-1.5 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {col.title}
                      </span>

                      {/* Hiển thị ĐẦY ĐỦ VĂN BẢN thô (nếu có) để không bị cắt bởi line-clamp */}
                      {rawVal !== undefined && rawVal !== null && rawVal !== "" && typeof rawVal !== "object" ? (
                        <div className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap break-words bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100">
                          {typeof rawVal === "boolean" ? (rawVal ? "Có / Hoạt động" : "Không / Tắt") : String(rawVal)}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900 leading-relaxed">
                          {renderedVal || <em className="text-gray-400">Không có dữ liệu</em>}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Hiển thị các trường dữ liệu bổ sung của bản ghi */}
              {extraFields.length > 0 && (
                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Thông tin bổ sung khác
                  </h4>
                  {extraFields.map(([key, val]) => {
                    const displayLabel = key.replace(/_/g, " ").replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                    return (
                      <div key={key} className="flex flex-col gap-1.5 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-xs font-semibold text-gray-500">
                          {displayLabel}
                        </span>
                        <div className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap break-words bg-gray-50/80 p-3 rounded-2xl border border-gray-100">
                          {typeof val === "object" ? JSON.stringify(val, null, 2) : String(val)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-slate-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 text-xs font-bold transition shadow-md hover:shadow-lg active:scale-95 cursor-pointer"
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
