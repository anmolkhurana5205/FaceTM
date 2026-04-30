"use client";

import { Menu, Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCurrentUser } from "@/hooks/use-current-user";

interface NavbarProps {
  onMenuClick: () => void;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/wallet": "Wallet",
  "/dashboard/facepay": "FacePay",
  "/dashboard/transactions": "Transactions",
  "/dashboard": "Dashboard",
};

const getPageTitle = (pathname: string): string => {
  for (const [route, title] of Object.entries(PAGE_TITLES)) {
    if (route === pathname) return title;
  }
  return "Dashboard";
};

export const DashboardNavbar = ({ onMenuClick }: NavbarProps) => {
  const pathname = usePathname();
  const user = useCurrentUser();
  const pageTitle = getPageTitle(pathname);

  return (
    <header className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 px-4 md:px-6 h-14 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1">
        <h1 className="text-white/90 font-semibold text-[15px]">{pageTitle}</h1>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-2">
        <button className="hidden md:flex w-8 h-8 items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors">
          <Search className="w-4 h-4" />
        </button>

        <button className="relative w-8 h-8 flex items-center justify-center rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-400" />
        </button>

        <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500/40 to-indigo-600/40 border border-violet-500/30 flex items-center justify-center ml-1 cursor-pointer hover:border-violet-500/80 transition-colors">
          <span className="text-xs font-semibold text-violet-300">
            {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
          </span>
        </div>
      </div>
    </header>
  );
};
