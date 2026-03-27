"use client";

import Link from "next/link";
import ButtonComponent from "@/components/ui/ButtonComponent/ButtonComponent";
import { PiArrowRight } from "react-icons/pi";

export default function LoadingPage() {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold">CỨU HỘ KHẨN CẤP</h1>

        <Link href="/dashboard">
          <ButtonComponent className="px-6">
            <span>Chạm để sử dụng</span>
            <PiArrowRight />
          </ButtonComponent>
        </Link>
      </div>
    </div>
  );
}
