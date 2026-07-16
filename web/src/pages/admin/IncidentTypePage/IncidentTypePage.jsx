import React, { useEffect } from "react";
import * as IncidentTypesApi from "@/api/admin/IncidentTypeApi";
import { formatTime } from "@/utils/format_date.util";
import TableComponent from "@/components/admin/TableComponent/TableComponent";
import ButtonComponent from "@/components/shared/ButtonComponent/ButtonComponent";
import { PiPlus, PiX } from "react-icons/pi";

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

  // States cho modal tạo loại sự cố
  const [isOpenModal, setIsOpenModal] = React.useState(false);
  const [newIncidentType, setNewIncidentType] = React.useState("");
  const [createLoading, setCreateLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

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

  useEffect(() => {
    fetchIncidentTypes();
  }, [page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newIncidentType.trim()) {
      setErrorMessage("Vui lòng nhập tên loại sự cố!");
      return;
    }

    try {
      setCreateLoading(true);
      setErrorMessage("");
      const response = await IncidentTypesApi.createIncidentType(newIncidentType.trim());
      
      if (response && response.success) {
        setNewIncidentType("");
        setIsOpenModal(false);
        // Tải lại danh sách từ trang 1 nếu thành công
        if (page === 1) {
          fetchIncidentTypes();
        } else {
          setPage(1);
        }
      } else {
        setErrorMessage(response?.message || "Đã xảy ra lỗi khi tạo loại sự cố!");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.message || "Đã xảy ra lỗi khi kết nối đến server!"
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-2">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý loại sự cố</h1>
        <ButtonComponent
          onClick={() => setIsOpenModal(true)}
          className="bg-gray-900 text-white border-transparent hover:bg-gray-800 flex items-center gap-2 rounded-2xl shadow-sm px-4 py-2 font-semibold"
        >
          <PiPlus className="text-lg" />
          Tạo loại sự cố
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

      {/* MODAL TẠO LOẠI SỰ CỐ */}
      {isOpenModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
          onClick={() => {
            if (!createLoading) {
              setIsOpenModal(false);
              setNewIncidentType("");
              setErrorMessage("");
            }
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Tạo loại sự cố mới
              </h3>
              <button
                onClick={() => {
                  if (!createLoading) {
                    setIsOpenModal(false);
                    setNewIncidentType("");
                    setErrorMessage("");
                  }
                }}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition flex items-center justify-center"
              >
                <PiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">
                    Tên loại sự cố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newIncidentType}
                    onChange={(e) => {
                      setNewIncidentType(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Nhập tên loại sự cố (ví dụ: Cháy nhà, Tai nạn...)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 text-sm font-medium text-gray-900"
                    disabled={createLoading}
                    autoFocus
                  />
                  {errorMessage && (
                    <span className="text-xs text-red-600 font-medium">
                      {errorMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenModal(false);
                    setNewIncidentType("");
                    setErrorMessage("");
                  }}
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-sm font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 text-sm font-semibold transition shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createLoading ? "Đang tạo..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentTypePage;
