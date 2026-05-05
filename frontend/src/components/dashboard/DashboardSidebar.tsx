import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { AuthUser } from "../../types";
import { FiGrid, FiUser, FiCalendar, FiCheckCircle, FiUsers, FiBriefcase, FiHeart, FiMessageCircle, FiBell, FiLogOut, FiChevronLeft, FiChevronRight, FiSettings, FiFile } from "react-icons/fi";
import { ChatBubbleLeftRightIcon, RectangleGroupIcon, ShieldCheckIcon  } from "@heroicons/react/24/outline";

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
  onNavClick?: () => void;
};

const DashboardSidebar = ({
  collapsed,
  onToggle,
  onLogout,
  notifCount,
  user,
  className = "",
  onNavClick,
}: DashboardSidebarProps) => {
  const { t } = useTranslation();
  const role = user?.role;

  const navItems: NavItem[] = [
    { to: "/dashboard", label: t("tab_overview"), icon: FiGrid, end: true },
    { to: "/dashboard/profile", label: t("profile"), icon: FiUser },
    { to: "/dashboard/events", label: t("tab_events"), icon: FiCalendar },
    { to: "/dashboard/attendance", label: t("tab_attendance"), icon: FiCheckCircle },
    { to: "/dashboard/family", label: t("tab_family"), icon: FiUsers },
    { to: "/dashboard/questions", label: t("qa"), icon: FiMessageCircle },
    { to: "/dashboard/service", label: t("tab_groups"), icon: FiBriefcase },
    { to: "/dashboard/donations", label: t("donation"), icon: FiHeart },
    { to: "/dashboard/resources", label: t("resources"), icon: FiFile },    
  ];

  // Add admin routes
  if (role === "ServiceAdmin" || role === "service_admin") {
    navItems.push({ to: "/dashboard/manage-ageglot", label: t("manage_ageglot"), icon: FiSettings });
  }
  if (role === "QACounselor" || role === "QA_counselor") {
    navItems.push({to: "/dashboard/counselor/queue", label: t("counselor_queue"), icon: ChatBubbleLeftRightIcon});
  }
  if (role === "CourseCoordinator" || role === "Course_coordinator") {
    navItems.push({ to: "/dashboard/courses/coordinator", label: t("course_coordinator"), icon: RectangleGroupIcon });
  }
  if (role === "QAModerator" || role === "qa_moderator" || role === "QA_moderator"){
    navItems.push({to: "/dashboard/counselor/approve", label: t("moderator_queue"), icon: ShieldCheckIcon});
  }
  if (role === "EventAdmin" || role === "Event_manager") {
    navItems.push({to:"/dashboard/event-management", label: t("event_management"), icon: FiCalendar});
  }

  // Super admin is handled entirely via Django admin panel — no frontend route needed.

  return (
    <aside
      className={`${className} ${
        collapsed ? "w-20" : "w-64"
      } flex flex-col border-r border-white/10 bg-primary shadow-soft transition-all duration-300`}
    >
      {/* Logo Header */}
      <div
        className={`flex items-center border-b border-white/10 p-4 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="finot" className="h-8 w-8" />
            <span className="text-base font-semibold text-white">Finot</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
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
            onClick={onNavClick}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-normal transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                isActive
                  ? "bg-white/20 text-white shadow-soft"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
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
      <div className="border-t border-white/10 p-3">
        <button
          onClick={onLogout}
          className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-normal text-white/70 transition hover:bg-destructive/20 hover:text-white ${
            collapsed ? "justify-center" : ""
          }`}
          title={collapsed ? "Logout" : undefined}
        >
           <FiLogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
