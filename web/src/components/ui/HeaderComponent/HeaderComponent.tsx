"use client";

import Link from "next/link";
import { PiBellLight } from "react-icons/pi";

export default function HeaderComponent() {
  return (
    <div className="flex justify-between items-center bg-white p-4 shadow-sm">
      <div>Home</div>
      <div className="flex items-center gap-6">
        <Link
          href="/notifications"
          className="rounded-xl hover:bg-gray-100 transition border border-gray-800"
        >
          <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200">
            <PiBellLight size={20} />
          </div>
        </Link>

        <div className="w-10 h-10 bg-gray-600 rounded-full">
        </div>
      </div>
    </div>
  );
}
