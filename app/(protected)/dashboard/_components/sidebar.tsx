"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  ScanFace,
  ArrowLeftRight,
  X,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/actions/logout";
import { useCurrentUser } from "@/hooks/use-current-user";
import Image from "next/image";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Wallet",
    href: "/dashboard/wallet",
    icon: Wallet,
  },
  {
    label: "FacePay",
    href: "/dashboard/facepay",
    icon: ScanFace,
  },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
  },
] as const;

export const DashboardSidebar = ({ open, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const user = useCurrentUser();

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full w-64 z-40 flex flex-col",
        "bg-[#0d0d14] border-r border-white/5",
        "lg:translate-x-0", // always visible on large screens
        // Mobile: slide in/out via transform
        "transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full",
      )}
    >
      {/* logo */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Image
                src="/logo_sidebar.svg"
                alt="Logo"
                width={22}
                height={22}
              />
            </div>
          </div>
          <span className="text-white font-semibold text-[15px] tracking-tight">
            FaceTM
          </span>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-violet-500/15 text-violet-300 shadow-sm"
                  : "text-white/40 hover:text-white/80 hover:bg-white/5",
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive
                    ? "text-violet-400"
                    : "text-white/30 group-hover:text-white/60",
                )}
              />
              {label}

              {/* Active indicator bar */}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 pb-4 pt-2 border-t border-white/5 space-y-1">
        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500/40 to-indigo-600/40 border border-violet-500/30 flex items-center justify-center shrink-0">
            <span className="text-xs font-semibold text-violet-300">
              {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white/80 text-xs font-medium truncate">
              {user?.name ?? "User"}
            </p>
            <p className="text-white/30 text-[11px] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 group hover: cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-white/30 group-hover:text-red-400 transition-colors" />
          Sign out
        </button>
      </div>
    </aside>
  );
};
