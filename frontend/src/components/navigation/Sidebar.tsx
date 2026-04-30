import { useState, useEffect, type ComponentType, type SVGProps } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  Squares2X2Icon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentIcon,           // ADD THIS for Resources
  AcademicCapIcon,        // ADD THIS for Teacher QA
} from "@heroicons/react/24/outline";

type SidebarProps = {
  notifCount?: number;
  onLogout: () => void;
};

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  end?: boolean;
  badge?: number;
};

const Sidebar = ({ notifCount = 0, onLogout }: SidebarProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role;
  const [collapsed, setCollapsed] = useState(false);
  const [donationReminder, setDonationReminder] = useState(false);

  useEffect(() => {
    const today = new Date().getDay();
    setDonationReminder(today === 4);
  }, []);

  const navItems: NavItem[] = [
    { to: "/dashboard", label: t("dashboard"), icon: Squares2X2Icon, end: true },
    { to: "/dashboard/profile", label: t("profile"), icon: UserIcon },
    { to: "/dashboard/questions", label: t("qa_forum"), icon: ChatBubbleLeftRightIcon },
    { to: "/dashboard/donations", label: t("donation"), icon: HeartIcon, badge: donationReminder ? 1 : 0 },
    { to: "/dashboard/service", label: t("services"), icon: Squares2X2Icon },
    { to: "dashboard/resources", label: t("resources"), icon: DocumentIcon },  // ADD THIS
  ];

  if (role === "ServiceAdmin" || role === "service_admin") {
    navItems.push({ to: "/dashboard/manage-ageglot", label: t("manage_ageglot"), icon: UserIcon });
  }

  // ADD TEACHER QA BUTTON - For teacher roles
  const teacherRoles = ["teacher", "soul_teacher", "psychotherapist", "Teacher", "SoulTeacher", "Psychotherapist"];
  if (role && teacherRoles.includes(role)) {
    navItems.push({ 
      to: "/dashboard/teacher/qa", 
      label: t("private_qa_inbox"),   
      icon: AcademicCapIcon 
    });
  }

  // Super admin is handled entirely via Django admin panel — no frontend route needed.

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-blue-700 text-white flex flex-col h-screen sticky top-0 transition-all duration-300 shadow-soft`}
    >
      {/* Logo */}
      <div
        className={`p-4 border-b border-white/20 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="finot" className="h-8 w-8" />
            <span className="text-lg font-bold text-white">finot</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition text-white"
        >
          {collapsed ? (
            <ChevronRightIcon className="h-4 w-4" />
          ) : (
            <ChevronLeftIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center ${collapsed ? "justify-center" : ""} px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!collapsed && (
              <span className="ml-3 flex-1 text-sm">{item.label}</span>
            )}
            {!collapsed && (item.badge ?? 0) > 0 && (
              <span className="bg-destructive text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-medium">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/20">
        <button
          onClick={onLogout}
          className={`flex items-center ${collapsed ? "justify-center" : ""} w-full px-3 py-2.5 text-white/80 hover:bg-white/10 hover:text-white rounded-xl transition`}
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="ml-3 text-sm">{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;