import React from "react";
import { PiBellSimpleLight, PiMoonLight } from "react-icons/pi";
import { useSelector } from "react-redux";

const HeaderComponent = () => {
  const state = useSelector((state) => state.user)

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <div>Home</div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 border rounded-xl flex justify-center items-center shrink-0">
          <PiMoonLight size={22} />
        </div>
        <div className="w-10 h-10 border rounded-xl flex justify-center items-center shrink-0">
          <PiBellSimpleLight size={22} />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{state?.user?.full_name}</span>
          <div className="w-10 h-10 rounded-full bg-blue-400"></div>
        </div>
      </div>
    </div>
  );
};

export default HeaderComponent;
