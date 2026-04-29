"use client";

import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

const titles: Record<string, string> = {
  "/": "Dashboard",
  "/estoque": "Estoque",
  "/pedidos": "Pedidos",
  "/clientes": "Clientes",
  "/perdas": "Perdas",
  "/relatorios": "Relatórios",
};

export function Topbar() {
  const pathname = usePathname();
  const baseRoute = "/" + pathname.split("/")[1];
  const title = titles[baseRoute] ?? "HortiFresh";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur px-6">
      <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="relative rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
