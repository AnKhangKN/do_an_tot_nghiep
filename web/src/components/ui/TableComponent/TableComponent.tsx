import React from "react";

type Column<T> = {
  key: string; // UI key (unique)
  dataKey?: keyof T;
  title: string;
  render?: (row: T) => React.ReactNode;
};

type TableProps<T> = {
  data: T[];
  columns: Column<T>[];
};

export default function TableComponent<T>({ data, columns }: TableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white shadow-md shadow-gray-400 border p-4 border-gray-200 rounded-xl">
      <table className="w-full ">
        {/* HEADER */}
        <thead>
          <tr className="bg-gray-400">
            {columns.map((col) => (
              <th key={String(col.key)} className="px-3 py-2 text-left">
                {col.title}
              </th>
            ))}
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500"
              >
                No data
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-gray-50">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-3 py-2">
                    {col.render
                      ? col.render(row)
                      : col.dataKey
                        ? (row[col.dataKey] as React.ReactNode)
                        : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
