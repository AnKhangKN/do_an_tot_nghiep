import React from "react";

const SplashPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
      <div className="text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 p-0.5 ring-1 ring-gray-200 dark:ring-gray-700 shadow-lg overflow-hidden">
          <img
            src="/images/SOS-black.png"
            alt="Rescue Admin"
            className="h-full w-full rounded-[14px] object-cover"
          />
        </div>

        <h1 className="mt-5 text-xl font-bold">Rescue Admin</h1>
        <p className="mt-2 text-sm text-gray-500">Đang chuẩn bị hệ thống...</p>

        <div className="mx-auto mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gray-900 dark:bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
