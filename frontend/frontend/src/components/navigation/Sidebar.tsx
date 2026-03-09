import { useState, useEffect, type ComponentType, type SVGProps } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  UserIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ListBulletIcon,
  ArrowLeftOnRectangleIcon,
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
  const { user } = useAuth();
  const role = user?.role;
  const [donationReminder, setDonationReminder] = useState(false);

  useEffect(() => {
    // Simulate donation reminder on Thursday (day 4)
    const today = new Date().getDay();
    setDonationReminder(today === 4);
  }, []);

  const navItems: NavItem[] = [
    { to: "/dashboard", label: "Dashboard", icon: UserIcon, end: true },
    { to: "/profile", label: "Student Profile", icon: UserIcon },
    {
      to: "/dashboard/qa",
      label: "Q&A Forum",
      icon: ChatBubbleLeftRightIcon,
      badge: notifCount,
    },
    {
      to: "/donate/inside",
      label: "Donation",
      icon: HeartIcon,
      badge: donationReminder ? 1 : 0,
    },
    { to: "/services", label: "Services", icon: ListBulletIcon },
  ];

  if (role === "service_admin") {
    navItems.push({ to: "/group-admin", label: "Group Admin", icon: UserIcon });
  }
  if (role === "super_admin") {
    navItems.push({ to: "/admin", label: "Admin Panel", icon: UserIcon });
  }

  return (
    <aside className="w-64 bg-[#142850] text-white shadow-lg flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-gray-700">
        <img src="/images/logo.png" alt="finot" className="h-10 mx-auto" />
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-yellow-400 text-[#1B3067]"
                  : "hover:bg-[#1B3067] text-gray-300"
              }`
            }
          >
            <item.icon className="h-5 w-5 mr-3" />
            <span className="flex-1">{item.label}</span>
            {(item.badge ?? 0) > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-3 text-gray-300 hover:bg-[#1B3067] rounded-lg transition"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;