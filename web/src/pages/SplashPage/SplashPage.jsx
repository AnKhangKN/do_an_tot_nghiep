import React from "react";
import { PiLifebuoyFill } from "react-icons/pi";

const SplashPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-md">
          <PiLifebuoyFill size={30} />
        </div>

        <h1 className="mt-5 text-xl font-bold">Rescue Admin</h1>
        <p className="mt-2 text-sm text-gray-500">Đang chuẩn bị hệ thống...</p>

        <div className="mx-auto mt-6 h-1.5 w-44 overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gray-900" />
        </div>
      </div>
    </div>
  );
};

export default SplashPage;
