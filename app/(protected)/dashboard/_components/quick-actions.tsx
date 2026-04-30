"use client";

import Link from "next/link";
import { Send, ScanFace, Plus, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
}

const ACTIONS: QuickAction[] = [
  {
    label: "Send",
    description: "Transfer coins",
    href: "/dashboard/wallet?action=send",
    icon: Send,
    color:
      "from-violet-500/20 to-violet-600/10 border-violet-500/20 hover:border-violet-500/40",
    glowColor: "bg-violet-500/10",
  },
  {
    label: "FacePay",
    description: "Pay with face",
    href: "/dashboard/facepay",
    icon: ScanFace,
    color:
      "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20 hover:border-indigo-500/40",
    glowColor: "bg-indigo-500/10",
  },
  {
    label: "Add Funds",
    description: "Top up wallet",
    href: "/dashboard/wallet?action=add",
    icon: Plus,
    color:
      "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 hover:border-emerald-500/40",
    glowColor: "bg-emerald-500/10",
  },
  {
    label: "History",
    description: "View all txns",
    href: "/dashboard/transactions",
    icon: ArrowLeftRight,
    color:
      "from-amber-500/20 to-amber-600/10 border-amber-500/20 hover:border-amber-500/40",
    glowColor: "bg-amber-500/10",
  },
];

interface QuickActionsProps {
  className?: string;
}

export const QuickActions = ({ className }: QuickActionsProps) => {
  return (
    <div className={cn("grid grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {ACTIONS.map(
        ({ label, description, href, icon: Icon, color, glowColor }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "group relative overflow-hidden rounded-xl p-4 border",
              "bg-linear-to-br transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-lg",
              color,
            )}
          >
            {/* Glow */}
            <div
              className={cn(
                "absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity",
                glowColor,
              )}
            />

            <div className="relative flex flex-col gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-white/70" />
              </div>
              <div>
                <p className="text-white/90 text-sm font-semibold leading-tight">
                  {label}
                </p>
                <p className="text-white/30 text-[11px] mt-0.5">
                  {description}
                </p>
              </div>
            </div>
          </Link>
        ),
      )}
    </div>
  );
};
