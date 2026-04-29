"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle, Trash2,
  ArrowUpRight, ChevronRight, Boxes, Activity,
} from "lucide-react";
import Link from "next/link";
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

const GREETING = (() => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
})();

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()).catch(() => null),
    ]).then(([dash, me]) => {
      setData(dash);
      if (me?.nome) setUserName(me.nome.split(" ")[0]);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 rounded-xl bg-slate-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 h-72 rounded-2xl bg-slate-200" />
          <div className="h-72 rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  const stats = data?.stats;
  const maxFat = Math.max(...(data?.graficoVendas ?? []).map((d) => d.faturamento), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {GREETING}, {userName}! ??
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        <Link
          href="/pedidos"
          className="inline-flex items-center gap-2 self-start rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 active:scale-[0.98] sm:self-auto"
        >
          <ShoppingCart className="h-4 w-4" />
          Novo Pedido
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Alert banner */}
      {((stats?.alertasValidade ?? 0) > 0 || (stats?.estoqueBaixo ?? 0) > 0) && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-100">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="flex-1 text-sm">
            <p className="font-semibold text-amber-900">Atenção necessária</p>
            <p className="mt-0.5 text-amber-700">
              {(stats?.alertasValidade ?? 0) > 0 && (
                <span><strong>{stats?.alertasValidade}</strong> lote(s) vencem em até 3 dias. </span>
              )}
              {(stats?.estoqueBaixo ?? 0) > 0 && (
                <span><strong>{stats?.estoqueBaixo}</strong> produto(s) com estoque abaixo do mínimo.</span>
              )}
            </p>
          </div>
          <Link href="/estoque" className="shrink-0 text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900">
            Ver estoque ?
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GradientCard
          title="Faturamento do Mês"
          value={formatCurrency(stats?.faturamentoMes ?? 0)}
          subtitle="Receita acumulada"
          icon={<TrendingUp className="h-5 w-5 text-white" />}
          gradient="from-green-500 to-emerald-600"
          href="/relatorios"
        />
        <GradientCard
          title="Pedidos Hoje"
          value={String(stats?.pedidosHoje ?? 0)}
          subtitle="Pedidos realizados"
          icon={<ShoppingCart className="h-5 w-5 text-white" />}
          gradient="from-blue-500 to-blue-600"
          href="/pedidos"
        />
        <GradientCard
          title="Produtos Ativos"
          value={String(stats?.totalProdutos ?? 0)}
          subtitle={(stats?.totalEstoque ?? 0).toLocaleString("pt-BR") + " un. em estoque"}
          icon={<Package className="h-5 w-5 text-white" />}
          gradient="from-violet-500 to-violet-600"
          href="/estoque"
        />
        <GradientCard
          title="Perdas do Mês"
          value={formatCurrency(stats?.perdasMes ?? 0)}
          subtitle="Valor desperdiçado"
          icon={<Trash2 className="h-5 w-5 text-white" />}
          gradient="from-rose-400 to-rose-600"
          href="/perdas"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Faturamento — Últimos 6 Meses</h3>
              <p className="text-xs text-slate-400 mt-0.5">Evolução da receita mensal</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              <Activity className="h-3 w-3" />
              Ao vivo
            </div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={data?.graficoVendas ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradFat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                width={48}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: unknown) => [formatCurrency((v as number) ?? 0), "Faturamento"]}
              />
              <Area
                type="monotone"
                dataKey="faturamento"
                stroke="#16a34a"
                strokeWidth={2.5}
                fill="url(#gradFat)"
                dot={false}
                activeDot={{ r: 5, fill: "#16a34a", stroke: "#fff", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Mais Vendidos</h3>
              <p className="text-xs text-slate-400 mt-0.5">Top produtos do mês</p>
            </div>
            <Boxes className="h-4 w-4 text-slate-300" />
          </div>

          <div className="space-y-4">
            {(data?.produtosMaisVendidos ?? []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <Package className="h-5 w-5 text-slate-400" />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-500">Sem vendas ainda</p>
                <p className="text-xs text-slate-400">Registre pedidos para ver aqui</p>
              </div>
            ) : (
              (data?.produtosMaisVendidos ?? []).map((item, i) => {
                const pct = Math.round((item.faturamento / maxFat) * 100);
                const rankColors = ["bg-amber-400", "bg-slate-400", "bg-orange-400"];
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={"flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white " + (rankColors[i] ?? "bg-slate-200")}>
                          {i + 1}
                        </span>
                        <span className="truncate text-sm font-medium text-slate-700">
                          {item.produto?.nome ?? "—"}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs font-semibold text-slate-600">
                        {formatCurrency(item.faturamento)}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100">
                      <div
                        className="h-1.5 rounded-full bg-green-500 transition-all duration-700"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {(data?.produtosMaisVendidos ?? []).length > 0 && (
            <Link href="/relatorios" className="mt-5 flex items-center justify-center gap-1 text-xs font-medium text-green-600 hover:text-green-700">
              Ver relatório completo <ArrowUpRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      {/* Perdas chart + quick stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-900">Perdas por Mês</h3>
            <p className="text-xs text-slate-400 mt-0.5">Evolução do desperdício em R$</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data?.graficoPerdas ?? []} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$${v}`}
                width={48}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                formatter={(v: unknown) => [formatCurrency((v as number) ?? 0), "Valor Perdido"]}
              />
              <Bar dataKey="valor" fill="#fda4af" radius={[6, 6, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-5">Visão Geral</h3>
          <div className="space-y-3">
            <QuickStat
              label="Total em Estoque"
              value={(stats?.totalEstoque ?? 0).toLocaleString("pt-BR") + " un."}
              color="green"
            />
            <QuickStat
              label="Alertas de Validade"
              value={String(stats?.alertasValidade ?? 0) + " lote(s)"}
              color={(stats?.alertasValidade ?? 0) > 0 ? "amber" : "green"}
            />
            <QuickStat
              label="Estoque Abaixo do Mínimo"
              value={String(stats?.estoqueBaixo ?? 0) + " produto(s)"}
              color={(stats?.estoqueBaixo ?? 0) > 0 ? "rose" : "green"}
            />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/estoque"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-3 text-center transition hover:border-green-300 hover:bg-green-50"
            >
              <Package className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Estoque</span>
            </Link>
            <Link
              href="/perdas"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-3 text-center transition hover:border-rose-200 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Perdas</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function GradientCard({
  title, value, subtitle, icon, gradient, href,
}: {
  title: string; value: string; subtitle?: string; icon: React.ReactNode;
  gradient: string; href: string;
}) {
  return (
    <Link href={href} className={"group relative overflow-hidden rounded-2xl bg-gradient-to-br " + gradient + " p-5 text-white shadow-sm transition hover:shadow-md hover:brightness-105 active:scale-[0.98]"}>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            {icon}
          </div>
          <ArrowUpRight className="h-4 w-4 text-white/50 transition group-hover:text-white/90" />
        </div>
        <p className="mt-4 text-2xl font-bold leading-none">{value}</p>
        <p className="mt-1.5 text-xs font-semibold text-white/80">{title}</p>
        {subtitle && <p className="mt-0.5 text-[11px] text-white/60">{subtitle}</p>}
      </div>
    </Link>
  );
}

function QuickStat({ label, value, color }: { label: string; value: string; color: "green" | "amber" | "rose" }) {
  const dot = { green: "bg-green-500", amber: "bg-amber-400", rose: "bg-rose-400" }[color];
  const text = { green: "text-green-700", amber: "text-amber-700", rose: "text-rose-600" }[color];
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <span className={"h-2 w-2 rounded-full " + dot} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <span className={"text-sm font-bold " + text}>{value}</span>
    </div>
  );
}
