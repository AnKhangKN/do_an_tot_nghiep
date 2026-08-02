import React from "react";

const SplashPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
      <div className="text-center">
        <img
          src="/images/SOS-black.png"
          alt="Rescue Admin"
          className="mx-auto h-16 w-16 rounded-2xl object-contain shadow-md"
        />

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
