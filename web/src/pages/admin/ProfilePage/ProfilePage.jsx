import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PiUserFill,
  PiCameraFill,
  PiEnvelopeSimpleFill,
  PiPhoneFill,
  PiCalendarBlankFill,
  PiShieldCheckFill,
  PiKeyFill,
  PiWarningBold,
  PiCheckCircleBold,
} from "react-icons/pi";
import {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminAvatar,
  changeAdminPassword,
} from "@/api/admin/ProfileApi";
import { setUser } from "@/store/user/userSlice";
import { formatTime } from "@/utils/format_date.util";

const getErrorMessage = (error) => {
  return error?.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
};

const ProfilePage = () => {
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.user?.user);

  const [profile, setProfile] = useState(reduxUser);
  const [profileLoading, setProfileLoading] = useState(true);

  const [fullName, setFullName] = useState(reduxUser?.fullName || "");
  const [phone, setPhone] = useState(reduxUser?.phone || "");

  const [savingInfo, setSavingInfo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getAdminProfile();
      const data = res?.data;
      setProfile(data);
      dispatch(setUser(data));
      setFullName(data?.fullName || "");
      setPhone(data?.phone || "");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setProfileLoading(false);
    }
  }, [dispatch, showToast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      showToast("Họ và tên không được để trống!", "error");
      return;
    }

    setSavingInfo(true);
    try {
      const res = await updateAdminProfile({ fullName: fullName.trim(), phone: phone.trim() || null });
      const data = res?.data;
      setProfile(data);
      dispatch(setUser(data));
      showToast("Cập nhật hồ sơ cá nhân thành công!", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setSavingInfo(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await uploadAdminAvatar(formData);
      const data = res?.data;
      setProfile(data);
      dispatch(setUser(data));
      showToast("Cập nhật ảnh đại diện thành công!", "success");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast("Vui lòng nhập mật khẩu hiện tại!", "error");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Xác nhận mật khẩu mới không khớp!", "error");
      return;
    }

    setChangingPassword(true);
    try {
      await changeAdminPassword({ currentPassword, newPassword, confirmPassword });
      showToast("Đổi mật khẩu thành công!", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      showToast(getErrorMessage(error), "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const inputClass =
    "w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:bg-white dark:focus:bg-gray-100 focus:border-gray-900 focus:outline-none transition";
  const labelClass = "block text-xs font-bold text-gray-700 mb-1.5";

  return (
    <div className="p-2 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md dark:bg-gray-200 dark:text-white">
          <PiUserFill size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hồ Sơ Cá Nhân</h1>
          <p className="text-sm text-gray-500">Quản lý thông tin tài khoản Admin của bạn</p>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-lg border ${toastMessage.type === "error"
            ? "bg-red-900 text-white border-red-800"
            : "bg-gray-900 text-white border-gray-800 dark:bg-gray-200 dark:text-white dark:border-gray-600"
            }`}
        >
          {toastMessage.type === "error" ? (
            <PiWarningBold className="text-xl text-red-400" />
          ) : (
            <PiCheckCircleBold className="text-xl text-emerald-400" />
          )}
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {profileLoading ? (
        <p className="text-sm text-gray-500 text-center py-8">Đang tải hồ sơ...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card 1: Avatar + Tổng quan */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-28 h-28 rounded-full object-cover border-4 border-gray-100 dark:border-gray-200"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full bg-linear-to-br from-gray-800 to-gray-600 text-white text-4xl font-bold flex items-center justify-center border-4 border-gray-100 dark:border-gray-200">
                      {profile?.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <label className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-md hover:bg-gray-700 cursor-pointer transition">
                    <PiCameraFill size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>

                <h2 className="mt-4 text-lg font-bold text-gray-900">{profile?.fullName}</h2>

                <span className="mt-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-900 text-white text-xs font-semibold dark:bg-gray-200 dark:text-white">
                  <PiShieldCheckFill size={13} /> ADMIN
                </span>

                <div className="mt-5 w-full space-y-3 text-left">
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <PiEnvelopeSimpleFill size={16} className="text-gray-400 shrink-0" />
                    <span className="truncate">{profile?.email || "--"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <PiPhoneFill size={16} className="text-gray-400 shrink-0" />
                    <span>{profile?.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-600">
                    <PiCalendarBlankFill size={16} className="text-gray-400 shrink-0" />
                    <span>Tham gia: {profile?.createdAt ? formatTime(profile.createdAt) : "--"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 + 3: Thông tin cá nhân + Đổi mật khẩu */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-100">
              <h2 className="text-base font-bold text-gray-900">Thông tin cá nhân</h2>
              <p className="text-xs text-gray-500 mt-0.5 mb-5">Email được dùng để đăng nhập, không thể thay đổi</p>

              <form onSubmit={handleSaveInfo} className="space-y-4">
                <div>
                  <label className={labelClass}>Họ và tên <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Số điện thoại</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingInfo}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-xs font-bold text-white shadow-md hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 active:scale-[0.99] transition duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {savingInfo ? "Đang lưu..." : "Lưu thông tin"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:bg-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <PiKeyFill size={18} className="text-gray-500" />
                <h2 className="text-base font-bold text-gray-900">Đổi mật khẩu</h2>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 mb-5">Bảo mật tài khoản của bạn bằng cách đổi mật khẩu định kỳ</p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className={labelClass}>Mật khẩu hiện tại <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Nhập mật khẩu hiện tại"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Mật khẩu mới <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Xác nhận mật khẩu mới <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-900 py-3 text-xs font-bold text-white shadow-md hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 active:scale-[0.99] transition duration-150 disabled:opacity-50 cursor-pointer"
                >
                  {changingPassword ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
