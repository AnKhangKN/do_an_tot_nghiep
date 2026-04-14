import React, { useEffect } from "react";
import * as IncidentTypesApi from "@/api/admin/IncidentTypeApi";
import { formatTime } from "@/utils/format_date.util";
import TableComponent from "@/components/admin/TableComponent/TableComponent";
import ButtonComponent from "@/components/shared/ButtonComponent/ButtonComponent";

const columns = [
  {
    key: "index",
    title: "STT",
    render: (_, index) => <span className="text-gray-500">{index + 1}</span>,
  },
  {
    key: "name",
    title: "Loại sự cố",
    dataIndex: "incidentType",
  },
  {
    key: "status",
    title: "Trạng thái",
    render: (row) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          row.status === "ACTIVE"
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        }`}
      >
        {row.status}
      </span>
    ),
  },
  {
    key: "createdAt",
    title: "Ngày tạo",
    render: (row) => (
      <span className="text-gray-500 text-sm">{formatTime(row.createdAt)}</span>
    ),
  },
];

const IncidentTypePage = () => {
  const [incidentTypes, setIncidentTypes] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState(1);

  useEffect(() => {
    const fetchIncidentTypes = async () => {
      const limit = 10;

      try {
        setLoading(true);

        const response = await IncidentTypesApi.getIncidentTypes(page, limit);

        setIncidentTypes(response?.data?.data || []);
        setTotalPages(response?.data?.totalPages || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidentTypes();
  }, [page]);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Danh sách loại sự cố
          </h1>
          <p className="text-sm text-gray-500">
            Quản lý tất cả các loại sự cố trong hệ thống
          </p>
        </div>

        <ButtonComponent className="bg-blue-500 text-white hover:bg-blue-600">
          + Tạo loại sự cố
        </ButtonComponent>
      </div>

      {/* TABLE CARD */}
      <div className="">
        <TableComponent
          columns={columns}
          data={incidentTypes}
          rowKey="incidentId"
          page={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default IncidentTypePage;
