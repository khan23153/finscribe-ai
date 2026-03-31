"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Menu, X } from "lucide-react";

import ThemeToggle from "../../components/ThemeToggle";
import AIChatbot from "../../components/AIChatbot"
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/dashboard/expenses", label: "Expenses", icon: "💸" },
    { href: "/dashboard/ledger", label: "Ledger", icon: "📒" },
    { href: "/dashboard/goals", label: "Goals", icon: "🎯" },
    { href: "/dashboard/emi", label: "EMI Calculator", icon: "🧮" },
    { href: "/dashboard/stocks", label: "Stocks", icon: "📈" },
    { href: "/dashboard/news", label: "Finance News", icon: "📰" },
    { href: "/dashboard/reports", label: "Reports", icon: "📊" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  const SidebarContent = () => (
    <>
      <div>
        <div className="p-6 border-b border-border flex justify-between items-center">
          <Link href="/" className="font-display font-bold text-xl flex items-center gap-2 text-white">
            FinScribe <span className="w-2 h-2 rounded-full bg-accent inline-block" /> AI
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X size={24} className="text-white" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? "bg-accent/10 text-accent border-l-2 border-accent"
                    : "text-muted hover:bg-background hover:text-foreground border-l-2 border-transparent"
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border mt-auto sticky bottom-0 bg-surface space-y-3">
        <div className="px-1">
          <ThemeToggle />
        </div>
        <div className="flex items-center justify-between bg-background rounded-xl p-3 border border-border">
          <div className="flex items-center gap-3">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
            <div className="text-sm font-medium truncate w-24 text-white">
              {user?.firstName || "User"}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar (Desktop) */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-surface border-r border-border hidden md:flex flex-col justify-between z-20 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <aside className="md:hidden fixed left-0 top-0 h-full w-64 bg-zinc-950 z-50 flex flex-col justify-between overflow-y-auto">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile Nav Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <span className="font-bold text-white">
          FinScribe • AI
        </span>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu size={24} className="text-white" />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 mt-14 md:mt-0 p-6 md:p-8 overflow-auto relative min-h-screen">
        {/* Glow Background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-glow rounded-full blur-[100px] pointer-events-none opacity-50" />

        <div className="max-w-6xl mx-auto relative z-10 pb-20">
          <AIChatbot />
          {children}
        </div>
      </main>
    </div>
  );
}
