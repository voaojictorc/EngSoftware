"use client";

import { Bell, Search } from "lucide-react";
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 backdrop-blur px-6">
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 w-56">
          <Search className="h-3.5 w-3.5" />
          <span>Buscar...</span>
          <kbd className="ml-auto rounded bg-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">⌘K</kbd>
        </div>
      </div>
      <h1 className="absolute left-1/2 -translate-x-1/2 text-sm font-semibold text-slate-900 sm:hidden">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <button className="relative rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
