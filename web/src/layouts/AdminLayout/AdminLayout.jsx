import HeaderComponent from "@/components/admin/HeaderComponent/HeaderComponent";
import SidebarComponent from "@/components/admin/SidebarComponent/SidebarComponent";
import React from "react";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <SidebarComponent />

      <div className="flex flex-col flex-1">
        <HeaderComponent />
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
