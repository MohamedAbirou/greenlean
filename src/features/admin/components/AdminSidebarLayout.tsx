import React from "react";
import SidebarNav from "./SidebarNav";

interface AdminSidebarLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminSidebarLayout: React.FC<AdminSidebarLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <SidebarNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminSidebarLayout;