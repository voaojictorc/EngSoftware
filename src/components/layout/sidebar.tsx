"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  AlertTriangle,
  BarChart2,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Estoque", href: "/estoque", icon: Package },
  { name: "Pedidos", href: "/pedidos", icon: ShoppingCart },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Perdas", href: "/perdas", icon: AlertTriangle },
  { name: "Relatórios", href: "/relatorios", icon: BarChart2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-900">HortiFresh</span>
          <p className="text-[11px] text-slate-400 leading-none mt-0.5">Distribuidora</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-green-600" : "text-slate-400 group-hover:text-slate-600"
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <ChevronRight className="ml-auto h-3 w-3 text-green-500" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-slate-700">Admin</p>
            <p className="truncate text-[11px] text-slate-400">admin@hortifresh.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
