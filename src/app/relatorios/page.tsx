"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  graficoVendas: { mes: string; faturamento: number; pedidos: number }[];
  produtosMaisVendidos: {
    produto: { id: string; nome: string; unidade: string } | null;
    quantidadeTotal: number;
    faturamento: number;
  }[];
  graficoPerdas: { mes: string; valor: number; quantidade: number }[];
  stats: {
    totalProdutos: number;
    faturamentoMes: number;
    perdasMes: number;
  };
}

export default function RelatoriosPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Faturamento do Mês</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{formatCurrency(data?.stats.faturamentoMes ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-red-100 bg-red-50 px-5 py-4">
          <p className="text-xs text-red-400 uppercase tracking-wide">Perdas do Mês</p>
          <p className="mt-1 text-xl font-bold text-red-700">{formatCurrency(data?.stats.perdasMes ?? 0)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide">Produtos Ativos</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{data?.stats.totalProdutos ?? 0}</p>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Faturamento + Pedidos */}
        <Card>
          <CardHeader><CardTitle>Faturamento × Pedidos (6 meses)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data?.graficoVendas ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(v: unknown, name: unknown) => [
                    name === "faturamento" ? formatCurrency((v as number) ?? 0) : (v as number),
                    name === "faturamento" ? "Faturamento" : "Pedidos",
                  ]}
                />
                <Legend formatter={(v) => v === "faturamento" ? "Faturamento" : "Pedidos"} />
                <Bar yAxisId="left" dataKey="faturamento" fill="#86efac" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="pedidos" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Perdas */}
        <Card>
          <CardHeader><CardTitle>Evolução das Perdas (6 meses)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={data?.graficoPerdas ?? []}>
                <defs>
                  <linearGradient id="colorPerda" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v: unknown) => [formatCurrency((v as number) ?? 0), "Valor Perdido"]} />
                <Area type="monotone" dataKey="valor" stroke="#ef4444" strokeWidth={2} fill="url(#colorPerda)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Produtos mais vendidos */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top Produtos por Faturamento</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.produtosMaisVendidos ?? []).map((item, i) => {
                const maxFat = Math.max(...(data?.produtosMaisVendidos ?? []).map((p) => p.faturamento), 1);
                const pct = (item.faturamento / maxFat) * 100;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">{i + 1}</span>
                        <span className="font-medium text-slate-800">{item.produto?.nome ?? "—"}</span>
                        <span className="text-xs text-slate-400">{item.quantidadeTotal.toLocaleString("pt-BR")} {item.produto?.unidade}</span>
                      </div>
                      <span className="font-semibold text-slate-700">{formatCurrency(item.faturamento)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {(data?.produtosMaisVendidos ?? []).length === 0 && (
                <p className="text-sm text-slate-400 py-6 text-center">Nenhuma venda registrada ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
