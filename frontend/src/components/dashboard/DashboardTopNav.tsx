import { useState, type SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { AuthUser } from "../../types";
import { Menu, Bell, Settings } from "react-icons/fi";

type DashboardTopNavProps = {
  user: AuthUser;
  onMenuClick: () => void;
  notifCount: number;
};

const DashboardTopNav = ({ user, onMenuClick, notifCount }: DashboardTopNavProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fullName = user?.full_name || "";
  const profile = user?.profile || {};
  const profileImage = profile.profile_image || "/images/default-avatar.jpg";
  const department = profile.department || "";
  const batch = profile.batch || "";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left: Mobile Menu Button + Greeting */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted md:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-foreground">
              Welcome back, {fullName.split(" ")[0]} 👋
            </h1>
            <p className="text-xs text-muted-foreground">
              {department} {batch && `• ${batch}`}
            </p>
          </div>
        </div>

        {/* Right: Notifications + User Avatar */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Link
            to="/dashboard/notifications"
            className="relative rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </Link>

          {/* Settings */}
          <Link
            to="/dashboard/profile"
            className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground sm:block"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>

          {/* User Avatar + Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-muted"
            >
              <img
                src={profileImage}
                alt={fullName}
                className="h-8 w-8 rounded-lg border-2 border-accent/40 object-cover"
                onError={(event: SyntheticEvent<HTMLImageElement>) => {
                  event.currentTarget.src = "/images/default-avatar.jpg";
                }}
              />
              <span className="hidden text-sm font-medium text-foreground md:block">
                {fullName.split(" ")[0]}
              </span>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-border bg-card p-2 shadow-elevated">
                  <Link
                    to="/dashboard/profile"
                    className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                    onClick={() => setShowUserMenu(false)}
                  >
                    View Profile
                  </Link>
                  <Link
                    to="/profile/edit"
                    className="block rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Edit Profile
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardTopNav;
