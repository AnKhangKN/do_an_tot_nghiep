import React, { useEffect, useState } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import { formatTime } from '@/utils/format_date.util';
import {
  getCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  getAmenitiesAdmin,
  updateAmenityStatusAdmin,
  deleteAmenityAdmin,
  getFeedbacksAdmin,
  updateFeedbackStatusAdmin
} from '@/api/admin/EmergencyAmenityApi';
import {
  PiPlusBold,
  PiCheckBold,
  PiXBold,
  PiTrashBold,
  PiStorefrontBold,
  PiListDashesBold,
  PiEyeBold,
  PiMapPinBold,
  PiPhoneBold,
  PiClockBold,
  PiUserBold,
  PiPencilBold,
  PiImageBold,
  PiFlagBold,
  PiWarningBold
} from 'react-icons/pi';


export default function EmergencyAmenityPage() {
  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'categories' | 'feedbacks'

  // Points State
  const [points, setPoints] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsPage, setPointsPage] = useState(1);
  const [pointsTotalPages, setPointsTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);

  // Feedbacks State
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbacksPage, setFeedbacksPage] = useState(1);
  const [feedbacksTotalPages, setFeedbacksTotalPages] = useState(1);
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState('');


  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newIconName, setNewIconName] = useState('wrench');

  // Edit Category State
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editIconName, setEditIconName] = useState('wrench');
  const [editStatus, setEditStatus] = useState('ACTIVE');

  // Load Points
  const fetchPoints = async (page = 1, status = '') => {
    setPointsLoading(true);
    try {
      const res = await getAmenitiesAdmin(page, 10, status);
      if (res.success) {
        setPoints(res.data.data || []);
        setPointsTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching amenities:', err);
    } finally {
      setPointsLoading(false);
    }
  };

  // Load Categories
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await getCategoriesAdmin();
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load Feedbacks
  const fetchFeedbacks = async (page = 1, status = '') => {
    setFeedbacksLoading(true);
    try {
      const res = await getFeedbacksAdmin(page, 10, status);
      if (res.success) {
        setFeedbacks(res.data.data || []);
        setFeedbacksTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    } finally {
      setFeedbacksLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'points') {
      fetchPoints(pointsPage, statusFilter);
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'feedbacks') {
      fetchFeedbacks(feedbacksPage, feedbackStatusFilter);
    }
  }, [activeTab, pointsPage, statusFilter, feedbacksPage, feedbackStatusFilter]);

  const handleResolveFeedback = async (feedbackId, status, action, amenityId) => {
    try {
      const res = await updateFeedbackStatusAdmin(feedbackId, { status, action, amenityId });
      if (res.success) {
        fetchFeedbacks(feedbacksPage, feedbackStatusFilter);
        fetchPoints(pointsPage, statusFilter);
      }
    } catch (err) {
      console.error('Error resolving feedback:', err);
    }
  };


  // Points Actions
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await updateAmenityStatusAdmin(id, newStatus);
      if (res.success) {
        if (selectedPoint && selectedPoint.amenityId === id) {
          setSelectedPoint((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        fetchPoints(pointsPage, statusFilter);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDeletePoint = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa điểm tiện ích này?')) return;
    try {
      const res = await deleteAmenityAdmin(id);
      if (res.success) {
        if (selectedPoint && selectedPoint.amenityId === id) {
          setSelectedPoint(null);
        }
        fetchPoints(pointsPage, statusFilter);
      }
    } catch (err) {
      console.error('Error deleting point:', err);
    }
  };

  // Category Actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      const res = await createCategoryAdmin({ categoryName: newCategoryName, iconName: newIconName });
      if (res.success) {
        setShowAddCategoryModal(false);
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  };

  const handleOpenEditCategory = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.categoryName || '');
    setEditIconName(category.iconName || 'wrench');
    setEditStatus(category.status || 'ACTIVE');
    setShowEditCategoryModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editCategoryName.trim()) return;
    try {
      const res = await updateCategoryAdmin(editingCategory.amenityCategoryId, {
        categoryName: editCategoryName,
        iconName: editIconName,
        status: editStatus
      });
      if (res.success) {
        setShowEditCategoryModal(false);
        setEditingCategory(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('Error updating category:', err);
    }
  };

  const handleToggleCategoryStatus = async (category) => {
    const nextStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await updateCategoryAdmin(category.amenityCategoryId, {
        categoryName: category.categoryName,
        iconName: category.iconName,
        status: nextStatus
      });
      if (res.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Error toggling category:', err);
    }
  };

  const pointColumns = [
    {
      key: 'index',
      title: 'STT',
      render: (_, index) => <span className="text-xs font-medium text-gray-400 block text-center">{(pointsPage - 1) * 10 + index + 1}</span>,
    },
    {
      key: 'categoryName',
      title: 'Loại tiện ích',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm block">
            {row.categoryName || 'Tiện ích khẩn cấp'}
          </span>
          {row.imageUrl && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg border border-blue-200 shadow-2xs"
              title="Có ảnh thực tế đính kèm"
            >
              <PiImageBold className="w-3.5 h-3.5" />
              Có ảnh
            </span>
          )}
        </div>
      ),
    },

    {
      key: 'phone',
      title: 'Số điện thoại',
      render: (row) => (
        <span className="text-xs font-mono text-gray-700 block">
          {row.phone || '--'}
        </span>
      ),
    },
    {
      key: 'coords',
      title: 'Tọa độ (Lat, Lng)',
      render: (row) => (
        <span className="text-xs font-mono text-gray-500 block">
          {row.latitude?.toFixed(4)}, {row.longitude?.toFixed(4)}
        </span>
      ),
    },
    {
      key: 'openingHours',
      title: 'Giờ mở cửa',
      render: (row) => <span className="text-xs text-gray-600 font-medium block">{row.openingHours || '07:00 - 21:00'}</span>,
    },
    {
      key: 'reporterName',
      title: 'Người đóng góp',
      render: (row) => <span className="text-xs text-gray-600 block">{row.reporterName || 'Hệ thống'}</span>,
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (row) => {
        const isApproved = row.status === 'APPROVED';
        const isPending = row.status === 'PENDING';
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${
              isApproved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                : isPending
                ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                : 'bg-rose-50 text-rose-700 border border-rose-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isApproved ? 'bg-emerald-500' : isPending ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
            {isApproved ? 'Đã duyệt' : isPending ? 'Chờ duyệt' : 'Đã từ chối'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Ngày tạo',
      render: (row) => <span className="text-xs text-gray-500 block">{formatTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      title: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedPoint(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
            title="Xem chi tiết & Duyệt"
          >
            <PiEyeBold className="w-3.5 h-3.5 text-gray-600" />
            Chi tiết
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeletePoint(row.amenityId);
            }}
            className="p-1.5 bg-gray-100 text-gray-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"
            title="Xóa vĩnh viễn"
          >
            <PiTrashBold className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const categoryColumns = [
    {
      key: 'index',
      title: 'STT',
      render: (_, index) => <span className="text-xs font-medium text-gray-400 block text-center">{index + 1}</span>,
    },
    {
      key: 'categoryName',
      title: 'Tên danh mục',
      render: (row) => <span className="font-semibold text-gray-900 text-sm block">{row.categoryName}</span>,
    },
    {
      key: 'iconName',
      title: 'Biểu tượng (Icon)',
      render: (row) => <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{row.iconName || 'wrench'}</span>,
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-semibold ${
            row.status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}
        >
          {row.status === 'ACTIVE' ? 'Hoạt động' : 'Tạm khóa'}
        </span>
      ),
    },

    {
      key: 'actions',
      title: 'Thao tác',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenEditCategory(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition"
            title="Chỉnh sửa danh mục"
          >
            <PiPencilBold className="w-3.5 h-3.5 text-gray-600" />
            Sửa
          </button>
          <button
            onClick={() => handleToggleCategoryStatus(row)}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${
              row.status === 'ACTIVE'
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
            }`}
          >
            {row.status === 'ACTIVE' ? 'Tạm khóa' : 'Kích hoạt'}
          </button>
        </div>
      ),
    },
  ];

  const feedbackColumns = [

    {
      key: 'index',
      title: 'STT',
      render: (_, index) => <span className="text-xs font-medium text-gray-400 block text-center">{(feedbacksPage - 1) * 10 + index + 1}</span>,
    },
    {
      key: 'categoryName',
      title: 'Tiện ích bị báo cáo',
      render: (row) => (
        <div>
          <span className="font-semibold text-gray-900 text-sm block">
            {row.categoryName || 'Tiện ích khẩn cấp'}
          </span>
          <span className="text-xs font-mono text-gray-500 block">
            SĐT: {row.amenityPhone || 'Không có'}
          </span>
        </div>
      ),
    },
    {
      key: 'reason',
      title: 'Lý do báo cáo',
      render: (row) => {
        const reasonMap = {
          CLOSED_DOWN: { label: 'Đã đóng cửa / Không còn', style: 'bg-rose-50 text-rose-700 border-rose-200' },
          SCAM_FRAUD: { label: 'Lừa đảo / Giả mạo', style: 'bg-red-100 text-red-800 border-red-300 font-bold' },
          INCORRECT_INFO: { label: 'Sai vị trí / SĐT', style: 'bg-amber-50 text-amber-700 border-amber-200' },
          OTHER: { label: 'Khác', style: 'bg-gray-100 text-gray-700 border-gray-200' },
        };
        const conf = reasonMap[row.reason] || reasonMap.OTHER;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-semibold border ${conf.style}`}>
            {conf.label}
          </span>
        );
      },
    },
    {
      key: 'comment',
      title: 'Ghi chú phản hồi',
      render: (row) => (
        <span className="text-xs text-gray-700 block max-w-xs line-clamp-2">
          {row.comment || '(Không có ghi chú thêm)'}
        </span>
      ),
    },
    {
      key: 'reporterName',
      title: 'Người gửi báo cáo',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-gray-900 block">{row.reporterName || 'Nạn nhân'}</span>
          <span className="text-[11px] text-gray-500 block">{row.reporterEmail || '--'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái xử lý',
      render: (row) => {
        const isPending = row.status === 'PENDING';
        const isResolved = row.status === 'RESOLVED';
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-semibold ${
              isResolved
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isPending
                ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}
          >
            {isResolved ? 'Đã gỡ điểm' : isPending ? 'Chờ xử lý' : 'Đã bác bỏ'}
          </span>
        );
      },
    },
    {
      key: 'createdAt',
      title: 'Thời gian',
      render: (row) => <span className="text-xs text-gray-500 block">{formatTime(row.createdAt)}</span>,
    },
    {
      key: 'actions',
      title: 'Hành động Admin',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'PENDING' ? (
            <>
              <button
                onClick={() => handleResolveFeedback(row.feedbackId, 'RESOLVED', 'REJECT_AMENITY', row.amenityId)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                title="Tạm dừng/Gỡ ngay địa điểm này khỏi hệ thống"
              >
                Gỡ điểm vi phạm
              </button>
              <button
                onClick={() => handleResolveFeedback(row.feedbackId, 'DISMISSED', 'DISMISS', row.amenityId)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
                title="Bác bỏ báo cáo này"
              >
                Bác bỏ
              </button>
            </>
          ) : (
            <span className="text-xs text-gray-400 font-medium">Đã hoàn thành</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bản Đồ Tiện Ích Cộng Đồng</h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý danh mục, xử lý báo cáo vi phạm và duyệt điểm tiện ích khẩn cấp trên toàn hệ thống.
          </p>
        </div>

        {/* Action Button */}
        {activeTab === 'categories' && (
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition"
          >
            <PiPlusBold className="w-4 h-4" />
            Thêm Danh Mục Mới
          </button>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTab('points')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === 'points'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PiStorefrontBold className="w-4 h-4" />
            Các Điểm Tiện Ích
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === 'categories'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PiListDashesBold className="w-4 h-4" />
            Quản Lý Danh Mục
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${
              activeTab === 'feedbacks'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <PiFlagBold className="w-4 h-4" />
            Báo Cáo Vi Phạm
          </button>
        </div>

        {activeTab === 'points' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Lọc trạng thái:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPointsPage(1);
              }}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-gray-900"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        )}

        {activeTab === 'feedbacks' && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-medium">Lọc báo cáo:</label>
            <select
              value={feedbackStatusFilter}
              onChange={(e) => {
                setFeedbackStatusFilter(e.target.value);
                setFeedbacksPage(1);
              }}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl px-3 py-2 outline-none focus:border-gray-900"
            >
              <option value="">Tất cả báo cáo</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="RESOLVED">Đã gỡ điểm</option>
              <option value="DISMISSED">Đã bác bỏ</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-4">
        {activeTab === 'points' ? (
          <TableComponent
            columns={pointColumns}
            data={points}
            loading={pointsLoading}
            page={pointsPage}
            totalPages={pointsTotalPages}
            onPageChange={(p) => setPointsPage(p)}
            onRowClick={(row) => setSelectedPoint(row)}
          />
        ) : activeTab === 'categories' ? (
          <TableComponent
            columns={categoryColumns}
            data={categories}
            loading={categoriesLoading}
          />
        ) : (
          <TableComponent
            columns={feedbackColumns}
            data={feedbacks}
            loading={feedbacksLoading}
            page={feedbacksPage}
            totalPages={feedbacksTotalPages}
            onPageChange={(p) => setFeedbacksPage(p)}
          />
        )}
      </div>


      {/* Detail Point Modal */}
      {selectedPoint && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gray-100 rounded-2xl text-gray-900">
                  <PiStorefrontBold className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedPoint.categoryName || 'Tiện ích khẩn cấp'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Chi tiết thông tin & Phê duyệt điểm</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPoint(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition cursor-pointer"
              >
                <PiXBold className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: Split 2 Columns (Left: Image, Right: Grid Info) */}
            <div className="flex flex-col md:flex-row gap-5">
              {/* Left Column: Hình ảnh đính kèm */}
              <div className="w-full md:w-5/12 flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium mb-2">
                  <PiImageBold className="w-4 h-4 text-blue-600" />
                  Hình ảnh minh họa thực tế
                </div>
                <div className="flex-1 min-h-[220px] bg-gray-50 rounded-2xl border border-gray-200 p-2 flex items-center justify-center relative group overflow-hidden">
                  {selectedPoint.imageUrl ? (
                    <>
                      <img
                        src={selectedPoint.imageUrl}
                        alt="Ảnh tiện ích"
                        className="w-full h-full max-h-[300px] object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                      />
                      <a
                        href={selectedPoint.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-3 right-3 px-3 py-1.5 bg-gray-900/80 hover:bg-gray-900 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition shadow-sm"
                      >
                        Phóng to ↗
                      </a>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2">
                      <PiImageBold className="w-10 h-10 text-gray-300" />
                      <p className="text-xs italic">Không có hình ảnh đính kèm cho tiện ích này</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Grid Thông tin chi tiết */}
              <div className="w-full md:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <PiStorefrontBold className="w-4 h-4 text-gray-400" />
                    Loại tiện ích
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selectedPoint.categoryName || 'Chưa xác định'}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                  <div className="text-xs text-gray-500 font-medium">Trạng thái phê duyệt</div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${
                        selectedPoint.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : selectedPoint.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${selectedPoint.status === 'APPROVED' ? 'bg-emerald-500' : selectedPoint.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'}`} />
                      {selectedPoint.status === 'APPROVED' ? 'Đã duyệt' : selectedPoint.status === 'PENDING' ? 'Chờ duyệt' : 'Đã từ chối'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <PiPhoneBold className="w-4 h-4 text-gray-400" />
                    Số điện thoại
                  </div>
                  <div className="text-sm font-mono font-semibold text-gray-900">
                    {selectedPoint.phone || 'Không có SĐT'}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <PiClockBold className="w-4 h-4 text-gray-400" />
                    Giờ mở cửa
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedPoint.openingHours || '07:00 - 21:00'}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                      <PiMapPinBold className="w-4 h-4 text-rose-500" />
                      Tọa độ GPS (Lat, Lng)
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${selectedPoint.latitude},${selectedPoint.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      Mở Google Maps →
                    </a>
                  </div>
                  <div className="text-sm font-mono font-semibold text-gray-900">
                    {selectedPoint.latitude}, {selectedPoint.longitude}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <PiUserBold className="w-4 h-4 text-gray-400" />
                    Người đóng góp
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    {selectedPoint.reporterName || 'Hệ thống'}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                  <div className="text-xs text-gray-500 font-medium">Thời gian gửi</div>
                  <div className="text-sm text-gray-900">
                    {formatTime(selectedPoint.createdAt)}
                  </div>
                </div>
              </div>
            </div>



            {/* Modal Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => handleDeletePoint(selectedPoint.amenityId)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-2xl transition"
              >
                <PiTrashBold className="w-4 h-4" />
                Xóa điểm
              </button>

              <div className="flex items-center gap-2">
                {selectedPoint.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPoint.amenityId, 'REJECTED')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-2xl transition"
                  >
                    <PiXBold className="w-4 h-4" />
                    Từ chối
                  </button>
                )}

                {selectedPoint.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPoint.amenityId, 'APPROVED')}
                    className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-2xl shadow-sm transition"
                  >
                    <PiCheckBold className="w-4 h-4" />
                    Duyệt điểm tiện ích
                  </button>
                )}

                <button
                  onClick={() => setSelectedPoint(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-2xl transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Thêm Danh Mục Tiện Ích Mới</h3>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Tên danh mục (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trạm sạc EV, Sửa xe cứu hộ..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Tên Icon</label>
                <input
                  type="text"
                  placeholder="wrench, gas-pump, first-aid, tire"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-semibold shadow-sm transition"
                >
                  Tạo danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && editingCategory && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Cập Nhật Danh Mục Tiện Ích</h3>
              <button
                onClick={() => setShowEditCategoryModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
              >
                <PiXBold className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Tên danh mục (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trạm sạc EV, Sửa xe cứu hộ..."
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Tên Icon</label>
                <input
                  type="text"
                  placeholder="wrench, gas-pump, first-aid, tire"
                  value={editIconName}
                  onChange={(e) => setEditIconName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Trạng thái</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-900"
                >
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="INACTIVE">Tạm khóa (INACTIVE)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditCategoryModal(false)}
                  className="px-4 py-2 rounded-2xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-xs font-semibold shadow-sm transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
