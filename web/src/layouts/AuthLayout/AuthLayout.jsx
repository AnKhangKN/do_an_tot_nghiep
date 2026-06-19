import React from "react";
import {
  PiLifebuoyFill,
  PiLockKeyFill,
  PiMapPinFill,
  PiShieldCheckFill,
  PiWarningFill,
} from "react-icons/pi";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-gray-950 px-10 py-8 text-white lg:flex lg:flex-col">
          <div className="absolute -right-24 top-20 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-8 left-12 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-950 shadow-lg">
              <PiLifebuoyFill size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold">Rescue Admin</h1>
              <p className="text-xs text-gray-400">Hệ thống quản lý cứu hộ</p>
            </div>
          </div>

          <div className="relative mt-auto max-w-md">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-gray-200">
              <PiShieldCheckFill className="text-blue-300" size={18} />
              Trung tâm điều phối
            </div>

            <h2 className="text-4xl font-bold leading-tight">
              Quản lý vận hành cứu hộ nhanh, rõ ràng và tập trung.
            </h2>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <PiWarningFill className="mb-3 text-amber-300" size={24} />
                <p className="text-2xl font-bold">24/7</p>
                <p className="mt-1 text-xs text-gray-400">Giám sát</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <PiMapPinFill className="mb-3 text-blue-300" size={24} />
                <p className="text-2xl font-bold">Live</p>
                <p className="mt-1 text-xs text-gray-400">Bản đồ</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <PiLockKeyFill className="mb-3 text-emerald-300" size={24} />
                <p className="text-2xl font-bold">Admin</p>
                <p className="mt-1 text-xs text-gray-400">Bảo mật</p>
              </div>
            </div>
          </div>

          <p className="relative mt-10 text-xs text-gray-500">© 2026 AnKhang</p>
        </aside>

        <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
