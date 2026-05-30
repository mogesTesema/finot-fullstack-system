import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardTopNav from "../components/dashboard/DashboardTopNav";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    // Fetch notifications count
    // TODO: Implement notification fetching
    setNotifCount(0);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Desktop */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        onLogout={handleLogout}
        notifCount={notifCount}
        user={user}
        className="hidden md:flex"
      />

      {/* Sidebar - Mobile Drawer */}
      {mobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden transition-opacity"
            onClick={toggleMobileSidebar}
          />
          {/* Mobile Sidebar - 75% width max */}
          <div className="fixed inset-y-0 left-0 z-50 w-[75vw] max-w-[280px] md:hidden">
            <DashboardSidebar
              collapsed={false}
              onToggle={toggleMobileSidebar}
              onLogout={handleLogout}
              notifCount={notifCount}
              user={user}
              onNavClick={toggleMobileSidebar}
            />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Navigation */}
        <DashboardTopNav
          user={user}
          onMenuClick={toggleMobileSidebar}
          notifCount={notifCount}
        />

        {/* Page Content - Scrollable */}
        <main id="dashboard-main-scroll" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
