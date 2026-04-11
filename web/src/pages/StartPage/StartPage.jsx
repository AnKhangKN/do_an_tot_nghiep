import ButtonComponent from "@/components/shared/ButtonComponent/ButtonComponent";
import React from "react";
import { Link } from "react-router-dom";

const StartPage = () => {
  return (
    <div className="w-full h-screen border flex items-center justify-center">
      <div className="">
        <div>APP Cứu hộ</div>

        <Link to="/admin/dashboard">
          <ButtonComponent />
        </Link>
      </div>
    </div>
  );
};

export default StartPage;
