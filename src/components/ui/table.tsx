import * as React from "react";
import { cn } from "@/lib/utils";

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  loading?: boolean;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export function Table({ className, children, loading, isEmpty, emptyMessage, ...props }: TableProps) {
  return (
    <div className="relative w-full overflow-auto">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-10 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            Carregando...
          </div>
        </div>
      )}
      <table className={cn("w-full caption-bottom text-sm", className)} {...props}>
        {children}
      </table>
      {isEmpty && !loading && (
        <div className="py-12 text-center text-sm text-slate-400">
          {emptyMessage ?? "Nenhum registro encontrado"}
        </div>
      )}
    </div>
  );
}

export function TableHeader({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={cn("", className)} {...props} />;
}

export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "border-b border-slate-100 transition-colors hover:bg-slate-50/60",
        className
      )}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "h-10 px-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide",
        className
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("px-4 py-3 text-sm text-slate-700 align-middle", className)}
      {...props}
    />
  );
}
