import React, { useEffect, useState } from 'react';
import TableComponent from '@/components/admin/TableComponent/TableComponent';
import CellDetailComponent from '@/components/admin/TableComponent/CellDetailComponent/CellDetailComponent';
import AddUpdateModelComponent from '@/components/admin/AddUpdateModelComponent/AddUpdateModelComponent';
import { formatTime } from '@/utils/format_date.util';
import {
  getCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  getAmenitiesAdmin,
  updateAmenityStatusAdmin,
  deleteAmenityAdmin,
  getFeedbacksAdmin,
  getDuplicateAmenitiesAdmin,
  mergeAmenitiesAdmin
} from '@/api/admin/EmergencyAmenityApi';

import {
  PiPlusBold,
  PiCheckBold,
  PiXBold,
  PiTrashBold,
  PiStorefrontBold,
  PiListDashesBold,
  // PiEyeBold,
  PiMapPinBold,
  PiPhoneBold,
  PiClockBold,
  PiUserBold,
  PiPencilBold,
  PiImageBold,
  PiFlagBold,
  PiWarningBold,
  PiCopyBold,
  PiGitMergeBold,
  PiCrossBold,
  PiFireBold,
  PiPoliceCarBold,
  PiGasPumpBold,
  PiWrenchBold,
  PiHouseBold,
  PiBowlFoodBold,
  // PiLightningFill
} from 'react-icons/pi';

const AMENITY_ICONS = [
  { key: 'medical', label: 'Y tế / Cấp cứu', Icon: PiCrossBold, color: '#dc2626' },
  { key: 'fire', label: 'Chữa cháy / Cứu hỏa', Icon: PiFireBold, color: '#ea580c' },
  { key: 'police', label: 'Công an / Cảnh sát', Icon: PiPoliceCarBold, color: '#2563eb' },
  { key: 'gas', label: 'Trạm xăng / Nhiên liệu', Icon: PiGasPumpBold, color: '#d97706' },
  { key: 'repair', label: 'Sửa xe / Cứu hộ xe', Icon: PiWrenchBold, color: '#f97316' },
  { key: 'shelter', label: 'Nơi trú ẩn / Sơ tán', Icon: PiHouseBold, color: '#059669' },
  { key: 'food', label: 'Thực phẩm / Nước uống', Icon: PiBowlFoodBold, color: '#0d9488' },
  { key: 'store', label: 'Khác (Mặc định)', Icon: PiStorefrontBold, color: '#6b7280' },
];

const ICON_ALIASES = { wrench: 'repair', 'gas-pump': 'gas', 'first-aid': 'medical', tire: 'repair' };

const normalizeIcon = (icon) => {
  if (!icon) return 'store';
  const value = String(icon).trim().toLowerCase();
  if (AMENITY_ICONS.some((i) => i.key === value)) return value;
  if (ICON_ALIASES[value]) return ICON_ALIASES[value];
  return 'store';
};


export default function EmergencyAmenityPage() {
  const [activeTab, setActiveTab] = useState('points'); // 'points' | 'categories' | 'feedbacks' | 'duplicates'

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

  // Duplicates State
  const [duplicates, setDuplicates] = useState([]);
  const [duplicatesLoading, setDuplicatesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);


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

  // Load Duplicates
  const fetchDuplicates = async () => {
    setDuplicatesLoading(true);
    try {
      const res = await getDuplicateAmenitiesAdmin();
      if (res.success) {
        setDuplicates(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching duplicate amenities:', err);
    } finally {
      setDuplicatesLoading(false);
    }
  };

  const handleMerge = async (primaryAmenityId, duplicateAmenityId) => {
    try {
      setActionLoading(true);
      const res = await mergeAmenitiesAdmin(primaryAmenityId, duplicateAmenityId);
      if (res.success) {
        fetchDuplicates();
      }
    } catch (err) {
      console.error('Error merging amenities:', err);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'points') {
      fetchPoints(pointsPage, statusFilter);
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'feedbacks') {
      fetchFeedbacks(feedbacksPage, feedbackStatusFilter);
    } else if (activeTab === 'duplicates') {
      fetchDuplicates();
    }
  }, [activeTab, pointsPage, statusFilter, feedbacksPage, feedbackStatusFilter]);

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
      const res = await createCategoryAdmin({ categoryName: newCategoryName, iconName: normalizeIcon(newIconName) });
      if (res.success) {
        setShowAddCategoryModal(false);
        setNewCategoryName('');
        fetchCategories();
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
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

  const handleOpenEditCategory = (row) => {
    setEditingCategory(row);
    setEditCategoryName(row.categoryName || '');
    setEditIconName(normalizeIcon(row.iconName));
    setEditStatus(row.status || 'ACTIVE');
    setShowEditCategoryModal(true);
  };

  const handleToggleCategoryStatus = async (row) => {
    const nextStatus = row.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await updateCategoryAdmin(row.amenityCategoryId, {
        categoryName: row.categoryName,
        iconName: normalizeIcon(row.iconName),
        status: nextStatus
      });
      if (res.success) {
        fetchCategories();
      }
    } catch (err) {
      console.error('Error toggling category status:', err);
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
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-medium ${isApproved
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
    }
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
      render: (row) => {
        const icon = AMENITY_ICONS.find((i) => i.key === normalizeIcon(row.iconName)) || AMENITY_ICONS[AMENITY_ICONS.length - 1];
        const IconComp = icon.Icon;
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className="flex items-center justify-center w-7 h-7 rounded-lg text-white"
              style={{ backgroundColor: icon.color }}
            >
              <IconComp className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">{icon.key}</span>
          </span>
        );
      },
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (row) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 text-xs rounded-full font-semibold ${row.status === 'ACTIVE'
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
            className={`px-3 py-1.5 text-xs font-medium rounded-xl transition ${row.status === 'ACTIVE'
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
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full font-semibold ${isResolved
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
    {/*
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
  */}
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
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 dark:bg-gray-200 dark:hover:bg-gray-300 text-white px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm transition"
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
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${activeTab === 'points'
              ? 'bg-white dark:bg-gray-100 text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <PiStorefrontBold className="w-4 h-4" />
            Các Điểm Tiện Ích
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${activeTab === 'categories'
              ? 'bg-white dark:bg-gray-100 text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <PiListDashesBold className="w-4 h-4" />
            Quản Lý Danh Mục
          </button>
          <button
            onClick={() => setActiveTab('feedbacks')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${activeTab === 'feedbacks'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <PiFlagBold className="w-4 h-4" />
            Báo Cáo Vi Phạm
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition ${activeTab === 'duplicates'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
              }`}
          >
            <PiCopyBold className="w-4 h-4" />
            Nghi Ngờ Trùng Lặp
            {duplicates.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-white dark:bg-gray-100 text-amber-700 font-bold rounded-full">
                {duplicates.length}
              </span>
            )}
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

      {/* Content Table / Cards */}
      <div className="bg-white dark:bg-gray-100 rounded-3xl border border-gray-200 shadow-sm p-4">
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
        ) : activeTab === 'feedbacks' ? (
          <TableComponent
            columns={feedbackColumns}
            data={feedbacks}
            loading={feedbacksLoading}
            page={feedbacksPage}
            totalPages={feedbacksTotalPages}
            onPageChange={(p) => setFeedbacksPage(p)}
          />
        ) : (
          /* TAB NGHI NGỜ TRÙNG LẶP (DUPLICATES DETECTED) */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <PiCopyBold className="text-amber-600 text-lg" />
                  Danh sách Cụm Tiện ích Nghi ngờ Trùng lặp ({duplicates.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Tự động phân tích theo khoảng cách GPS và trùng khớp số điện thoại / danh mục
                </p>
              </div>

              <button
                onClick={fetchDuplicates}
                disabled={duplicatesLoading}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                {duplicatesLoading ? 'Đang quét...' : 'Quét lại trùng lặp'}
              </button>
            </div>

            {duplicatesLoading ? (
              <div className="py-12 text-center text-xs text-gray-500 font-medium">
                Đang phân tích không gian & quét dữ liệu trùng lặp...
              </div>
            ) : duplicates.length === 0 ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <PiCheckBold className="w-10 h-10 text-emerald-500 mx-auto" />
                <p className="text-sm font-semibold text-gray-800">Không phát hiện tiện ích nào nghi ngờ trùng lặp!</p>
                <p className="text-xs text-gray-500">Toàn bộ dữ liệu bản đồ tiện ích khẩn cấp hiện tại đều duy nhất và sạch vẽ.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {duplicates.map((pair, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 shadow-xs space-y-4"
                  >
                    {/* Header Thẻ Trùng */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-xl border border-amber-200">
                        <PiWarningBold className="text-amber-600" />
                        {pair.matchReason}
                      </span>
                      <span className="text-xs font-mono text-gray-500">
                        Khoảng cách: {pair.distanceMeters} m
                      </span>
                    </div>

                    {/* So sánh Side-by-Side 2 Cột */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bản ghi chính A */}
                      <div className="bg-white dark:bg-gray-100 p-3.5 rounded-xl border border-emerald-200/80 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                            Bản ghi A (Gốc)
                          </span>
                          <span className="text-[11px] text-gray-400">
                            SĐT: {pair.primary.phone || 'Không có'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{pair.primary.categoryName}</p>
                        <p className="text-xs text-gray-600 font-mono">
                          GPS: {pair.primary.latitude.toFixed(4)}, {pair.primary.longitude.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-500">Giờ: {pair.primary.openingHours}</p>
                        {pair.primary.imageUrl && (
                          <img
                            src={pair.primary.imageUrl}
                            alt="Ảnh A"
                            className="h-20 w-full object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <button
                          onClick={() => handleMerge(pair.primary.amenityId, pair.duplicate.amenityId)}
                          disabled={actionLoading}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <PiGitMergeBold className="text-sm" />
                          Giữ A & Gộp B vào A
                        </button>
                      </div>

                      {/* Bản ghi nghi trùng B */}
                      <div className="bg-white dark:bg-gray-100 p-3.5 rounded-xl border border-rose-200/80 space-y-2 shadow-2xs">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                            Bản ghi B (Nghi trùng)
                          </span>
                          <span className="text-[11px] text-gray-400">
                            SĐT: {pair.duplicate.phone || 'Không có'}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{pair.duplicate.categoryName}</p>
                        <p className="text-xs text-gray-600 font-mono">
                          GPS: {pair.duplicate.latitude.toFixed(4)}, {pair.duplicate.longitude.toFixed(4)}
                        </p>
                        <p className="text-xs text-gray-500">Giờ: {pair.duplicate.openingHours}</p>
                        {pair.duplicate.imageUrl && (
                          <img
                            src={pair.duplicate.imageUrl}
                            alt="Ảnh B"
                            className="h-20 w-full object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        <button
                          onClick={() => handleMerge(pair.duplicate.amenityId, pair.primary.amenityId)}
                          disabled={actionLoading}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-2xs transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <PiGitMergeBold className="text-sm" />
                          Giữ B & Gộp A vào B
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Detail Point Drawer */}
      {selectedPoint && (
        <CellDetailComponent
          open
          onClose={() => setSelectedPoint(null)}
          title={selectedPoint.categoryName || 'Tiện ích khẩn cấp'}
          subtitle="Chi tiết thông tin & Phê duyệt điểm"
          actions={[
            {
              key: 'delete',
              label: 'Xóa điểm',
              icon: PiTrashBold,
              variant: 'danger',
              position: 'left',
              onClick: () => handleDeletePoint(selectedPoint.amenityId),
            },
            {
              key: 'reject',
              label: 'Từ chối',
              icon: PiXBold,
              variant: 'warning',
              hidden: selectedPoint.status === 'REJECTED',
              onClick: () => handleUpdateStatus(selectedPoint.amenityId, 'REJECTED'),
            },
            {
              key: 'approve',
              label: 'Duyệt điểm tiện ích',
              icon: PiCheckBold,
              variant: 'success',
              hidden: selectedPoint.status === 'APPROVED',
              onClick: () => handleUpdateStatus(selectedPoint.amenityId, 'APPROVED'),
            },
          ]}
        >
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
                      className="absolute bottom-3 right-3 px-3 py-1.5 bg-gray-900/80 hover:bg-gray-900 dark:bg-black/70 dark:hover:bg-black/80 text-white text-xs font-semibold rounded-xl backdrop-blur-xs transition shadow-sm"
                    >
                      Phóng to ↗
                    </a>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2">
                    <PiImageBold className="w-10 h-10 text-gray-300 dark:text-gray-600" />
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
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full font-semibold ${selectedPoint.status === 'APPROVED'
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
        </CellDetailComponent>
      )}

      {/* Add Category Modal */}
      <AddUpdateModelComponent
        open={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        title="Thêm Danh Mục Tiện Ích Mới"
        onSubmit={handleCreateCategory}
        submitLabel="Tạo danh mục"
      >
        <div className="space-y-4">
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
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Biểu tượng (Icon)</label>
            <div className="grid grid-cols-4 gap-2">
              {AMENITY_ICONS.map(({ key, label, Icon, color }) => {
                const IconComp = Icon;
                const selected = newIconName === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setNewIconName(key)}
                    title={label}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition ${selected
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-900'
                      }`}
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
                      style={{ backgroundColor: color }}
                    >
                      <IconComp className="w-4.5 h-4.5" />
                    </span>
                    <span className="text-[10px] font-semibold leading-tight text-center">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </AddUpdateModelComponent>

      {/* Edit Category Modal */}
      <AddUpdateModelComponent
        open={showEditCategoryModal}
        onClose={() => setShowEditCategoryModal(false)}
        title="Cập Nhật Danh Mục Tiện Ích"
        onSubmit={handleUpdateCategory}
        submitLabel="Lưu thay đổi"
      >
        <div className="space-y-4">
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
            <label className="text-xs font-semibold text-gray-700 block mb-1.5">Biểu tượng (Icon)</label>
            <div className="grid grid-cols-4 gap-2">
              {AMENITY_ICONS.map(({ key, label, Icon, color }) => {
                const IconComp = Icon;
                const selected = editIconName === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditIconName(key)}
                    title={label}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition ${selected
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-900'
                      }`}
                  >
                    <span
                      className="flex items-center justify-center w-8 h-8 rounded-lg text-white"
                      style={{ backgroundColor: color }}
                    >
                      <IconComp className="w-4.5 h-4.5" />
                    </span>
                    <span className="text-[10px] font-semibold leading-tight text-center">{label}</span>
                  </button>
                );
              })}
            </div>
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
        </div>
      </AddUpdateModelComponent>
    </div>
  );
}
