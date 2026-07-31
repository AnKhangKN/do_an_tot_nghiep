import React from "react";
import { Link } from "react-router-dom";
import {
  PiArrowRight,
  PiLifebuoyFill,
  PiMapPinFill,
  PiShieldCheckFill,
  PiWarningFill,
} from "react-icons/pi";

const StartPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_0.9fr]">
          <section>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md dark:bg-gray-200 dark:text-white">
                <PiLifebuoyFill size={24} />
              </div>

              <div>
                <h1 className="text-lg font-bold">Rescue Admin</h1>
                <p className="text-xs text-gray-500">Hệ thống quản lý cứu hộ</p>
              </div>
            </div>

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white dark:bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 shadow-sm">
              <PiShieldCheckFill className="text-blue-500" size={18} />
              Trung tâm điều phối cứu hộ
            </div>

            <h2 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              Quản lý sự cố, đội cứu hộ và bản đồ vận hành trong một nơi.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-gray-500">
              Giao diện quản trị dành cho việc theo dõi tình huống, điều phối
              nhân sự và kiểm soát khu vực nguy hiểm.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800 dark:bg-gray-200 dark:text-white dark:hover:bg-gray-300"
              >
                Đăng nhập quản trị
                <PiArrowRight size={18} />
              </Link>

              <Link
                to="/admin/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white dark:bg-gray-100 px-5 py-3 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
              >
                Vào Dashboard
              </Link>
            </div>
          </section>

          <section className="rounded-3xl border border-gray-200 bg-white dark:bg-gray-100 p-5 shadow-sm">
            <div className="rounded-2xl bg-gray-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 dark:text-gray-700">Tình trạng hệ thống</p>
                  <p className="mt-1 text-2xl font-bold">Sẵn sàng</p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <PiShieldCheckFill size={24} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <PiWarningFill className="mb-3 text-amber-500" size={24} />
                <p className="text-2xl font-bold">24/7</p>
                <p className="mt-1 text-xs text-gray-500">Giám sát</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <PiMapPinFill className="mb-3 text-blue-500" size={24} />
                <p className="text-2xl font-bold">Live</p>
                <p className="mt-1 text-xs text-gray-500">Bản đồ</p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <PiLifebuoyFill className="mb-3 text-emerald-500" size={24} />
                <p className="text-2xl font-bold">Admin</p>
                <p className="mt-1 text-xs text-gray-500">Điều phối</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default StartPage;
