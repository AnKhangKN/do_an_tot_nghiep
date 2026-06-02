import React from "react";

const TableComponent = ({
  columns = [],
  data = [],
  rowKey = "id",

  // pagination props
  page = 1,
  totalPages = 1,
  onPageChange = () => {},

  loading = false,
}) => {
  return (
    <div className="rounded-lg border border-gray-200 shadow-lg overflow-hidden bg-white">

      {/* TABLE */}
      <table className="w-full">

        <thead className="bg-gray-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-medium text-white"
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="">

          {/* loading */}
          {loading && (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                Loading...
              </td>
            </tr>
          )}

          {/* empty */}
          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="text-center py-6 text-gray-500">
                Không có dữ liệu
              </td>
            </tr>
          )}

          {/* data */}
          {!loading &&
            data.map((row, index) => (
              <tr
                key={row[rowKey] || index}
                className="hover:bg-gray-50 transition"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    {col.render
                      ? col.render(row, index)
                      : row[col.dataIndex]}
                  </td>
                ))}
              </tr>
            ))}
        </tbody>

      </table>

      {/* PAGINATION */}
      <div className="flex justify-end gap-2 p-3 bg-gray-100">

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded border text-sm flex items-center justify-center transition
              ${page === p
                ? "bg-gray-500 text-white border-gray-500"
                : "hover:bg-gray-100"
              }`}
          >
            {p}
          </button>
        ))}

      </div>

    </div>
  );
};

export default TableComponent;