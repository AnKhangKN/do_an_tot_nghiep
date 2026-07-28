import React, { useEffect, useState, useCallback } from "react";
import * as IncidentTypesApi from "@/api/admin/IncidentTypeApi";
import { formatTime } from "@/utils/format_date.util";
import TableComponent from "@/components/admin/TableComponent/TableComponent";
import ButtonComponent from "@/components/shared/ButtonComponent/ButtonComponent";
import { PiPlus, PiX, PiPencilSimpleBold, PiToggleLeftBold, PiToggleRightBold } from "react-icons/pi";

const IncidentTypePage = () => {
  const [incidentTypes, setIncidentTypes] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  // States cho modal tạo mới
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [newIncidentType, setNewIncidentType] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // States cho modal chỉnh sửa
  const [editingItem, setEditingItem] = useState(null);
  const [editIncidentType, setEditIncidentType] = useState("");
  const [editStatus, setEditStatus] = useState("ACTIVE");
  const [editLoading, setEditLoading] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const fetchIncidentTypes = useCallback(async () => {
    const limit = 10;
    try {
      setLoading(true);
      const response = await IncidentTypesApi.getIncidentTypes(page, limit);
      setIncidentTypes(response?.data?.data || []);
      setTotalPages(response?.data?.totalPages || 1);
    } catch (error) {
      console.error("Fetch incident types error:", error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchIncidentTypes();
  }, [fetchIncidentTypes]);

  // Xử lý tạo mới loại sự cố
  const handleCreate = async (e) => {
    e.preventDefault();
    const trimmed = newIncidentType.trim();
    if (!trimmed) {
      setErrorMessage("Vui lòng nhập tên loại sự cố!");
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 100) {
      setErrorMessage("Tên loại sự cố phải có độ dài từ 2 đến 100 ký tự!");
      return;
    }

    try {
      setCreateLoading(true);
      setErrorMessage("");
      const response = await IncidentTypesApi.createIncidentType(trimmed);

      if (response && response.success) {
        setNewIncidentType("");
        setIsOpenModal(false);
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

  // Mở modal chỉnh sửa
  const handleOpenEdit = (row) => {
    setEditingItem(row);
    setEditIncidentType(row.incidentType || "");
    setEditStatus(row.status || "ACTIVE");
    setEditErrorMessage("");
  };

  // Xử lý cập nhật loại sự cố
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    const trimmed = editIncidentType.trim();
    if (!trimmed) {
      setEditErrorMessage("Vui lòng nhập tên loại sự cố!");
      return;
    }
    if (trimmed.length < 2 || trimmed.length > 100) {
      setEditErrorMessage("Tên loại sự cố phải có độ dài từ 2 đến 100 ký tự!");
      return;
    }

    try {
      setEditLoading(true);
      setEditErrorMessage("");
      const response = await IncidentTypesApi.updateIncidentType(editingItem.incidentTypeId, {
        incidentType: trimmed,
        status: editStatus
      });

      if (response && response.success) {
        setEditingItem(null);
        fetchIncidentTypes();
      } else {
        setEditErrorMessage(response?.message || "Đã xảy ra lỗi khi cập nhật!");
      }
    } catch (error) {
      console.error(error);
      setEditErrorMessage(
        error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật loại sự cố!"
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Xử lý nhanh Bật/Tắt trạng thái (Toggle Status)
  const handleToggleStatus = async (row) => {
    const newStatus = row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    setTogglingId(row.incidentTypeId);
    try {
      const response = await IncidentTypesApi.toggleIncidentTypeStatus(row.incidentTypeId, newStatus);
      if (response && response.success) {
        setIncidentTypes((prev) =>
          prev.map((item) =>
            item.incidentTypeId === row.incidentTypeId ? { ...item, status: newStatus } : item
          )
        );
      }
    } catch (error) {
      console.error("Toggle status error:", error);
    } finally {
      setTogglingId(null);
    }
  };

  const columns = [
    {
      key: "index",
      title: "STT",
      render: (_, index) => (
        <span className="text-xs font-medium text-gray-400 block text-center">
          {(page - 1) * 10 + index + 1}
        </span>
      ),
    },
    {
      key: "name",
      title: "Tên loại sự cố (Tự động In hoa)",
      render: (row) => (
        <span className="font-bold text-gray-900 text-sm tracking-wide">
          {row.incidentType}
        </span>
      ),
    },
    {
      key: "status",
      title: "Trạng thái hoạt động",
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row)}
          disabled={togglingId === row.incidentTypeId}
          title="Bấm để Bật/Tắt trạng thái hoạt động"
          className="inline-flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
        >
          {row.status === "ACTIVE" ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
              <PiToggleRightBold size={18} className="text-emerald-600" />
              <span>ACTIVE (Đang hoạt động)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
              <PiToggleLeftBold size={18} className="text-rose-500" />
              <span>INACTIVE (Đã tắt)</span>
            </span>
          )}
        </button>
      ),
    },
    {
      key: "createdAt",
      title: "Ngày khởi tạo",
      render: (row) => (
        <span className="text-gray-500 text-xs">{formatTime(row.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      render: (row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl border border-gray-200 transition-all cursor-pointer active:scale-95"
        >
          <PiPencilSimpleBold size={14} />
          <span>Chỉnh sửa</span>
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            Quản lý loại sự cố khẩn cấp
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Thêm mới, tự động in hoa và bật/tắt trạng thái hoạt động của các danh mục sự cố
          </p>
        </div>
        <ButtonComponent
          onClick={() => setIsOpenModal(true)}
          className="bg-gray-900 text-white hover:bg-gray-800 flex items-center gap-2 rounded-2xl shadow-sm px-4 py-2.5 font-semibold text-xs transition-all cursor-pointer active:scale-95"
        >
          <PiPlus size={16} />
          <span>Tạo loại sự cố mới</span>
        </ButtonComponent>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-2">
        <TableComponent
          columns={columns}
          data={incidentTypes}
          rowKey="incidentTypeId"
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
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
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

            <form onSubmit={handleCreate}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Tên loại sự cố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newIncidentType}
                    onChange={(e) => {
                      setNewIncidentType(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="Nhập tên loại sự cố (Ví dụ: Cứu hộ ngập lụt, Tai nạn...)"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 text-xs font-semibold text-gray-900"
                    disabled={createLoading}
                    autoFocus
                  />
                  <p className="text-[11px] text-gray-400 italic">
                    * Hệ thống sẽ tự động in hoa và lưu vào cơ sở dữ liệu.
                  </p>
                  {errorMessage && (
                    <span className="text-xs text-rose-600 font-medium">
                      {errorMessage}
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpenModal(false);
                    setNewIncidentType("");
                    setErrorMessage("");
                  }}
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 text-xs font-semibold transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {createLoading ? "Đang tạo..." : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHỈNH SỬA LOẠI SỰ CỐ */}
      {editingItem && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-300"
          onClick={() => {
            if (!editLoading) setEditingItem(null);
          }}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full border border-gray-100 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                Chỉnh sửa loại sự cố
              </h3>
              <button
                onClick={() => {
                  if (!editLoading) setEditingItem(null);
                }}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition flex items-center justify-center"
              >
                <PiX size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="p-6 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Tên loại sự cố <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editIncidentType}
                    onChange={(e) => {
                      setEditIncidentType(e.target.value);
                      if (editErrorMessage) setEditErrorMessage("");
                    }}
                    placeholder="Nhập tên loại sự cố"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 text-xs font-semibold text-gray-900"
                    disabled={editLoading}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-gray-900 text-xs font-semibold text-gray-900"
                    disabled={editLoading}
                  >
                    <option value="ACTIVE">ACTIVE - Hoạt động (Hiển thị cho Nạn nhân)</option>
                    <option value="INACTIVE">INACTIVE - Tắt (Ẩn khỏi ứng dụng)</option>
                  </select>
                </div>

                {editErrorMessage && (
                  <span className="text-xs text-rose-600 font-medium">
                    {editErrorMessage}
                  </span>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-2xl border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-5 py-2.5 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 text-xs font-semibold transition shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
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
