import React, { useState, useMemo } from "react";
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";
import CellDetailComponent from "./CellDetailComponent/CellDetailComponent";

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
  detailActions = [], // Nút hành động hiển thị ở footer drawer chi tiết
  detailTitle,
  detailSubtitle,
  detailCloseLabel,
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
      <CellDetailComponent
        open={!!selectedRow}
        onClose={closeModal}
        title={detailTitle}
        subtitle={detailSubtitle}
        columns={columns}
        row={selectedRow}
        rowIndex={selectedRowIndex}
        imageUrl={attachedImage}
        extraFields={extraFields}
        actions={detailActions}
        closeLabel={detailCloseLabel}
      />

    </div>
  );
};

export default TableComponent;
