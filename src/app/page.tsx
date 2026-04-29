"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalProdutos: number;
    totalEstoque: number;
    pedidosHoje: number;
    faturamentoMes: number;
    perdasMes: number;
    alertasValidade: number;
    estoqueBaixo: number;
  };
  graficoVendas: { mes: string; faturamento: number; pedidos: number }[];
  produtosMaisVendidos: {
    produto: { id: string; nome: string; unidade: string } | null;
    quantidadeTotal: number;
    faturamento: number;
  }[];
  graficoPerdas: { mes: string; valor: number; quantidade: number }[];
}

export default function DashboardPage() {
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
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {(stats?.alertasValidade ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>{stats?.alertasValidade}</strong> lote(s) com validade próxima nos próximos 3 dias.{" "}
            <a href="/estoque" className="underline font-medium">Ver estoque</a>
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Produtos Ativos"
          value={String(stats?.totalProdutos ?? 0)}
          icon={<Package className="h-4 w-4" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatCard
          title="Faturamento do Mês"
          value={formatCurrency(stats?.faturamentoMes ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Pedidos Hoje"
          value={String(stats?.pedidosHoje ?? 0)}
          icon={<ShoppingCart className="h-4 w-4" />}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
        />
        <StatCard
          title="Perdas do Mês"
          value={formatCurrency(stats?.perdasMes ?? 0)}
          icon={<Trash2 className="h-4 w-4" />}
          iconBg="bg-red-100"
          iconColor="text-red-500"
          valueClassName="text-red-600"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SmallCard label="Alertas de Validade" value={stats?.alertasValidade ?? 0} variant={stats?.alertasValidade ? "warning" : "success"} />
        <SmallCard label="Estoque Baixo" value={stats?.estoqueBaixo ?? 0} variant={stats?.estoqueBaixo ? "danger" : "success"} />
        <SmallCard label="Total em Estoque (kg)" value={(stats?.totalEstoque ?? 0).toLocaleString("pt-BR")} variant="default" />
        <SmallCard label="Período" value={new Date().toLocaleString("pt-BR", { month: "long", year: "numeric" })} variant="default" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Faturamento — Últimos 6 Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data?.graficoVendas ?? []}>
                <defs>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(v: unknown) => [formatCurrency((v as number) ?? 0), "Faturamento"]}
                />
                <Area type="monotone" dataKey="faturamento" stroke="#16a34a" strokeWidth={2} fill="url(#colorFat)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data?.produtosMaisVendidos ?? []).map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-700">
                      {i + 1}
                    </span>
                    <span className="truncate text-sm text-slate-700">{item.produto?.nome ?? "—"}</span>
                  </div>
                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {formatCurrency(item.faturamento)}
                  </span>
                </div>
              ))}
              {(data?.produtosMaisVendidos ?? []).length === 0 && (
                <p className="text-sm text-slate-400 text-center py-4">Sem dados ainda</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perdas por Mês</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.graficoPerdas ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v: unknown) => [formatCurrency((v as number) ?? 0), "Valor Perdido"]} />
              <Bar dataKey="valor" fill="#fca5a5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon, iconBg, iconColor, valueClassName }: {
  title: string; value: string; icon: React.ReactNode;
  iconBg: string; iconColor: string; valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg} ${iconColor}`}>{icon}</div>
        </div>
        <CardValue className={valueClassName}>{value}</CardValue>
      </CardHeader>
    </Card>
  );
}

function SmallCard({ label, value, variant }: { label: string; value: string | number; variant: "default" | "warning" | "danger" | "success" }) {
  const colorMap: Record<string, string> = { default: "text-slate-700", warning: "text-amber-600", danger: "text-red-600", success: "text-green-600" };
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-lg font-bold ${colorMap[variant]}`}>{value}</p>
    </div>
  );
}

