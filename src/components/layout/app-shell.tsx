"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const AUTH_ROUTES = ["/login", "/register"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (AUTH_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Sidebar />
      <div className="pl-60 flex flex-col min-h-screen">
        <Topbar />
        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </>
  );
}
