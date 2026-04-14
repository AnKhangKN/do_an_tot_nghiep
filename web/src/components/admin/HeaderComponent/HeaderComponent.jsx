import React from "react";
import { PiBellSimpleLight, PiMoonLight } from "react-icons/pi";
import { useSelector } from "react-redux";

const HeaderComponent = () => {
  const state = useSelector((state) => state.user);

  return (
    <div className="flex justify-between items-center p-4 border-b">
      
      <div>Home</div>

      <div className="flex items-center gap-4">

        {/* icons */}
        <div className="w-10 h-10 border rounded-xl flex justify-center items-center">
          <PiMoonLight size={22} />
        </div>

        <div className="w-10 h-10 border rounded-xl flex justify-center items-center">
          <PiBellSimpleLight size={22} />
        </div>

        {/* AVATAR DROPDOWN */}
        <div className="relative group">

          {/* trigger */}
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium">
              {state?.user?.fullName}
            </span>

            <div className="w-10 h-10 rounded-full bg-blue-400"></div>
          </div>

          {/* dropdown */}
          <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

            <div className="w-48 bg-white border rounded-md shadow-lg overflow-hidden">

              <div className="p-2 hover:bg-gray-100 cursor-pointer">
                Profile
              </div>

              <div className="p-2 hover:bg-gray-100 cursor-pointer">
                Settings
              </div>

              <div className="p-2 hover:bg-gray-100 cursor-pointer text-red-500">
                Logout
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default HeaderComponent;