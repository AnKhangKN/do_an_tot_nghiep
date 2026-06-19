import React, { useState } from "react";
import * as AuthApi from "@/api/shared/AuthApi";
import * as UserApi from "@/api/shared/UserApi";
import { store } from "@/store";
import { setCredentials } from "@/store/accessToken/accessTokenSlice";
import { Link, useNavigate } from "react-router-dom";
import { setUser } from "@/store/user/userSlice";
import {
  PiEye,
  PiEyeSlash,
  PiLifebuoyFill,
  PiLockKeyFill,
} from "react-icons/pi";
import AuthLayout from "@/layouts/AuthLayout/AuthLayout";

const LoginPage = () => {
  const navigate = useNavigate();

  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const { email, password, platform = "WEB" } = data;

      const accessToken = await AuthApi.login(email, password, platform);

      store.dispatch(setCredentials(accessToken?.data));
      const user = await UserApi.getUserInfo(accessToken?.data);

      store.dispatch(setUser(user?.data));
      navigate("/admin/dashboard");
    } catch (error) {
      console.log(error);
      setErrorMessage("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md">
            <PiLifebuoyFill size={24} />
          </div>

          <div>
            <h1 className="text-lg font-bold text-gray-900">Rescue Admin</h1>
            <p className="text-xs text-gray-500">Hệ thống quản lý cứu hộ</p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md">
              <PiLockKeyFill size={28} />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              Đăng nhập quản trị
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Truy cập bảng điều khiển Rescue Admin.
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
              <input
                id="email"
                type="email"
                name="email"
                value={data.email}
                onChange={handleChange}
                placeholder="admin@example.com"
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/10"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>

                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="relative mt-2">
                <input
                  id="password"
                  type={isPasswordVisible ? "text" : "password"}
                  name="password"
                  value={data.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3 pl-4 pr-12 text-sm text-gray-900 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-4 focus:ring-gray-900/10"
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setIsPasswordVisible((currentValue) => !currentValue)
                  }
                  className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label={
                    isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  {isPasswordVisible ? (
                    <PiEyeSlash size={20} />
                  ) : (
                    <PiEye size={20} />
                  )}
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
              className="flex w-full items-center justify-center rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Chỉ dành cho tài khoản quản trị được cấp quyền.
        </p>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
