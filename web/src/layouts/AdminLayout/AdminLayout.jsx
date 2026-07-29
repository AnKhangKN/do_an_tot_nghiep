import HeaderComponent from "@/components/admin/HeaderComponent/HeaderComponent";
import SidebarComponent from "@/components/admin/SidebarComponent/SidebarComponent";
import AdminEmergencyChatComponent from "@/components/admin/ChatComponent/AdminEmergencyChatComponent";
import React from "react";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen relative">
      <SidebarComponent />

      <div className="flex flex-col flex-1">
        <HeaderComponent />
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>

      {/* Bong bóng chat Hỗ trợ Khẩn cấp dành cho Admin */}
      <AdminEmergencyChatComponent />
    </div>
  );
};

export default AdminLayout;
