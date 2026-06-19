import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PiArrowLeft,
  PiEnvelopeSimpleFill,
  PiLockKeyFill,
  PiShieldCheckFill,
} from "react-icons/pi";
import AuthLayout from "@/layouts/AuthLayout/AuthLayout";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md">
              <PiLockKeyFill size={28} />
            </div>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
              <PiShieldCheckFill className="text-blue-500" size={16} />
              Khôi phục truy cập
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Quên mật khẩu
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Nhập email quản trị của bạn. Hệ thống sẽ ghi nhận yêu cầu và hướng
              dẫn bước tiếp theo.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
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
                    setIsSubmitted(false);
                  }}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/10"
                  required
                />
              </div>
            </div>

            {isSubmitted && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                Yêu cầu đã được ghi nhận. Vui lòng kiểm tra email hoặc liên hệ
                quản trị hệ thống để được cấp lại quyền truy cập.
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800"
            >
              Gửi yêu cầu
            </button>
          </form>

          <Link
            to="/login"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
          >
            <PiArrowLeft size={18} />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
