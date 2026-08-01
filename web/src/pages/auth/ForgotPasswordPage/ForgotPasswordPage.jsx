import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PiArrowLeft,
  PiEnvelopeSimpleFill,
  PiLockKeyFill,
  PiShieldCheckFill,
  PiKeyFill,
  PiEye,
  PiEyeSlash,
} from "react-icons/pi";
import AuthLayout from "@/layouts/AuthLayout/AuthLayout";
import * as AuthApi from "@/api/shared/AuthApi";

const STEP_EMAIL = 1;
const STEP_OTP = 2;
const STEP_RESET = 3;
const STEP_DONE = 4;

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmVisible, setIsConfirmVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await AuthApi.forgotPassword(email);
      setStep(STEP_OTP);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!/^\d{6}$/.test(otpCode)) {
      setErrorMessage("Mã OTP phải đúng 6 chữ số!");
      return;
    }
    setStep(STEP_RESET);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await AuthApi.resetPassword(email, otpCode, newPassword, confirmPassword);
      setStep(STEP_DONE);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8 flex items-center justify-center gap-2">
      {[STEP_EMAIL, STEP_OTP, STEP_RESET].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
              step >= s
                ? "bg-gray-900 text-white dark:bg-gray-200 dark:text-white"
                : "bg-gray-100 text-gray-400 dark:bg-gray-300 dark:text-gray-500"
            }`}
          >
            {s}
          </div>
          {s < STEP_RESET && (
            <div
              className={`h-0.5 w-10 transition-colors ${
                step > s ? "bg-gray-900 dark:bg-gray-200" : "bg-gray-200 dark:bg-gray-500"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderEmailStep = () => (
    <form className="space-y-5" onSubmit={handleSendOtp}>
      <div>
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <div className="relative mt-2">
          <PiEnvelopeSimpleFill
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage("");
            }}
            placeholder="admin@example.com"
            autoComplete="email"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white dark:focus:bg-gray-100 focus:ring-4 focus:ring-gray-900/10"
            required
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting ? "Đang gửi..." : "Gửi mã OTP"}
      </button>
    </form>
  );

  const renderOtpStep = () => (
    <form className="space-y-5" onSubmit={handleVerifyOtp}>
      <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-700">
        Mã OTP 6 số đã được gửi đến <strong>{email}</strong>. Vui lòng kiểm tra email của bạn.
      </div>

      <div>
        <label htmlFor="otpCode" className="text-sm font-medium text-gray-700">
          Mã OTP
        </label>
        <input
          id="otpCode"
          type="text"
          value={otpCode}
          onChange={(e) => {
            setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setErrorMessage("");
          }}
          placeholder="Nhập 6 chữ số"
          autoComplete="one-time-code"
          className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-bold tracking-[8px] text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white dark:focus:bg-gray-100 focus:ring-4 focus:ring-gray-900/10"
          inputMode="numeric"
          maxLength={6}
          required
        />
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        className="flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300"
      >
        Xác thực OTP
      </button>

      <button
        type="button"
        onClick={() => setStep(STEP_EMAIL)}
        className="w-full text-center text-sm text-gray-500 hover:text-gray-900"
      >
        Quay lại nhập email
      </button>
    </form>
  );

  const renderResetStep = () => (
    <form className="space-y-5" onSubmit={handleResetPassword}>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
        Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.
      </div>

      <div>
        <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
          Mật khẩu mới
        </label>
        <div className="relative mt-2">
          <PiKeyFill
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="newPassword"
            type={isPasswordVisible ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrorMessage("");
            }}
            placeholder="Ít nhất 6 ký tự"
            autoComplete="new-password"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white dark:focus:bg-gray-100 focus:ring-4 focus:ring-gray-900/10"
            required
          />
          <button
            type="button"
            onClick={() => setIsPasswordVisible((v) => !v)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            {isPasswordVisible ? <PiEyeSlash size={20} /> : <PiEye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
          Xác nhận mật khẩu
        </label>
        <div className="relative mt-2">
          <PiKeyFill
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            id="confirmPassword"
            type={isConfirmVisible ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage("");
            }}
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-12 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white dark:focus:bg-gray-100 focus:ring-4 focus:ring-gray-900/10"
            required
          />
          <button
            type="button"
            onClick={() => setIsConfirmVisible((v) => !v)}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            {isConfirmVisible ? <PiEyeSlash size={20} /> : <PiEye size={20} />}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
      </button>
    </form>
  );

  const renderDoneStep = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 text-center text-sm leading-6 text-emerald-700">
        <PiShieldCheckFill className="mx-auto mb-2" size={32} />
        <p className="font-semibold">Đặt lại mật khẩu thành công!</p>
        <p className="mt-1">Vui lòng đăng nhập lại bằng mật khẩu mới.</p>
      </div>

      <button
        onClick={() => navigate("/admin/login")}
        className="flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300"
      >
        Đăng nhập ngay
      </button>
    </div>
  );

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white dark:bg-gray-200 dark:text-white shadow-md">
              <PiLockKeyFill size={28} />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
              <PiShieldCheckFill className="text-blue-500" size={16} />
              Khôi phục truy cập
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              {step === STEP_EMAIL && "Quên mật khẩu"}
              {step === STEP_OTP && "Xác thực OTP"}
              {step === STEP_RESET && "Mật khẩu mới"}
              {step === STEP_DONE && "Hoàn tất"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {step === STEP_EMAIL && "Nhập email quản trị để nhận mã OTP đặt lại mật khẩu."}
              {step === STEP_OTP && "Nhập mã OTP 6 số đã được gửi đến email của bạn."}
              {step === STEP_RESET && "Nhập mật khẩu mới cho tài khoản của bạn."}
              {step === STEP_DONE && "Mật khẩu của bạn đã được cập nhật thành công."}
            </p>
          </div>

          {renderStepIndicator()}

          {step === STEP_EMAIL && renderEmailStep()}
          {step === STEP_OTP && renderOtpStep()}
          {step === STEP_RESET && renderResetStep()}
          {step === STEP_DONE && renderDoneStep()}

          {step !== STEP_DONE && (
            <Link
              to="/admin/login"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white dark:bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
            >
              <PiArrowLeft size={18} />
              Quay lại đăng nhập
            </Link>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;