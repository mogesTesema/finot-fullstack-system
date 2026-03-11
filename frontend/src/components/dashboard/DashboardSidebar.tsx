import { NavLink } from "react-router-dom";
import { AuthUser } from "../../types";
import { FiGrid, FiUser, FiCalendar, FiCheckCircle, FiUsers, FiBriefcase, FiHeart, FiMessageCircle, FiBell, FiLogOut, FiChevronLeft, FiChevronRight, FiSettings } from "react-icons/fi";

type NavItem = {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
  badge?: number;
};

type DashboardSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  notifCount: number;
  user: AuthUser;
  className?: string;
};

const DashboardSidebar = ({
  collapsed,
  onToggle,
  onLogout,
  notifCount,
  user,
  className = "",
}: DashboardSidebarProps) => {
  const role = user?.role;

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Overview", icon: FiGrid, end: true },
    { to: "/dashboard/profile", label: "Profile", icon: FiUser },
    { to: "/dashboard/events", label: "Events", icon: FiCalendar },
    { to: "/dashboard/attendance", label: "Attendance", icon: FiCheckCircle },
    { to: "/dashboard/family", label: "Family", icon: FiUsers },
    { to: "/dashboard/service", label: "Service Groups", icon: FiBriefcase },
    { to: "/dashboard/donations", label: "Donations", icon: FiHeart },
    { to: "/dashboard/questions", label: "Q&A", icon: FiMessageCircle },
    { to: "/dashboard/notifications", label: "Notifications", icon: FiBell, badge: notifCount },
  ];

  // Add admin routes
  if (role === "service_admin") {
    navItems.push({ to: "/group-admin", label: "Group Admin", icon: FiSettings });
  }
  if (role === "super_admin") {
    navItems.push({ to: "/admin", label: "Admin Panel", icon: FiSettings });
  }

  return (
    <aside
      className={`${className} ${
        collapsed ? "w-20" : "w-64"
      } flex flex-col border-r border-border bg-card shadow-soft transition-all duration-300`}
    >
      {/* Logo Header */}
      <div
        className={`flex items-center border-b border-border p-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="finot" className="h-8 w-8" />
            <span className="text-lg font-bold text-primary">Finot</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <FiChevronRight className="h-5 w-5" />
          ) : (
            <FiChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {(item.badge ?? 0) > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-white">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && (item.badge ?? 0) > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-t border-border p-3">
        <button
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
           <FiLogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
