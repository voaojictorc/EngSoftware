"use client";

import { useEffect, useState } from "react";
import { Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, Textarea, Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

type MotivoParda = "VENCIMENTO" | "AVARIA" | "CONTAMINACAO" | "FURTO" | "OUTRO";

interface Perda {
  id: string;
  quantidade: number;
  motivo: MotivoParda;
  observacao: string | null;
  valorEstimado: number;
  registradoPor: string | null;
  createdAt: string;
  produto: { id: string; nome: string; unidade: string };
  lote: { id: string; numero: string };
}

const motivoConfig: Record<MotivoParda, { label: string; variant: "danger" | "warning" | "info" | "default" | "outline" }> = {
  VENCIMENTO: { label: "Vencimento", variant: "danger" },
  AVARIA: { label: "Avaria", variant: "warning" },
  CONTAMINACAO: { label: "Contaminação", variant: "danger" },
  FURTO: { label: "Furto", variant: "default" },
  OUTRO: { label: "Outro", variant: "outline" },
};

const PIE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#64748b", "#94a3b8"];

export default function PerdasPage() {
  const [perdas, setPerdas] = useState<Perda[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [novoOpen, setNovoOpen] = useState(false);
  const [resumo, setResumo] = useState<{ motivo: string; _sum: { valorEstimado: number; quantidade: number }; _count: number }[]>([]);

  const fetchPerdas = () => {
    setLoading(true);
    fetch("/api/perdas?limit=50")
      .then((r) => r.json())
      .then((data) => {
        setPerdas(data.perdas ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPerdas();
    fetch("/api/perdas/resumo")
      .then((r) => r.json())
      .then(setResumo);
  }, []);

  const pieData = resumo.map((r) => ({
    name: motivoConfig[r.motivo as MotivoParda]?.label ?? r.motivo,
    value: r._sum.valorEstimado ?? 0,
  }));

  const totalPerdas = perdas.reduce((acc, p) => acc + p.valorEstimado, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Controle de Perdas</h2>
          <p className="text-sm text-slate-400">{total} registros de perda</p>
        </div>
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="danger"><Plus className="h-3.5 w-3.5" />Registrar Perda</Button>
          </DialogTrigger>
          <DialogContent>
            <RegistrarPerdaForm onSuccess={() => { setNovoOpen(false); fetchPerdas(); }} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 lg:col-span-1">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">Total em Perdas</span>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(totalPerdas)}</p>
          <p className="text-xs text-red-400 mt-1">{perdas.length} registros exibidos</p>
        </div>

        {pieData.length > 0 && (
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Perdas por Motivo</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => formatCurrency((v as number) ?? 0)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Table */}
      <Card>
        <Table loading={loading} isEmpty={perdas.length === 0}>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Valor Estimado</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Registrado por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {perdas.map((perda) => (
              <TableRow key={perda.id}>
                <TableCell className="font-medium text-slate-900">{perda.produto.nome}</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{perda.lote.numero}</TableCell>
                <TableCell>{perda.quantidade} {perda.produto.unidade}</TableCell>
                <TableCell>
                  <Badge variant={motivoConfig[perda.motivo]?.variant ?? "default"}>
                    {motivoConfig[perda.motivo]?.label ?? perda.motivo}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-red-600">{formatCurrency(perda.valorEstimado)}</TableCell>
                <TableCell className="text-slate-500">{formatDate(perda.createdAt)}</TableCell>
                <TableCell className="text-slate-500">{perda.registradoPor ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function RegistrarPerdaForm({ onSuccess }: { onSuccess: () => void }) {
  const [produtos, setProdutos] = useState<{ id: string; nome: string; unidade: string }[]>([]);
  const [lotes, setLotes] = useState<{ id: string; numero: string; quantidade: number }[]>([]);
  const [produtoId, setProdutoId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
  }, []);

  async function carregarLotes(pid: string) {
    const res = await fetch(`/api/produtos/${pid}`);
    const data = await res.json();
    setLotes(data.lotes?.filter((l: { quantidade: number; ativo: boolean }) => l.quantidade > 0 && l.ativo) ?? []);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      produtoId: fd.get("produtoId"),
      loteId: fd.get("loteId"),
      quantidade: Number(fd.get("quantidade")),
      motivo: fd.get("motivo"),
      observacao: fd.get("observacao") || undefined,
      registradoPor: fd.get("registradoPor") || undefined,
    };

    const res = await fetch("/api/perdas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao registrar perda");
    }
    setLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Registrar Perda</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Produto"
          name="produtoId"
          required
          onChange={(e) => {
            setProdutoId(e.target.value);
            if (e.target.value) carregarLotes(e.target.value);
            else setLotes([]);
          }}
        >
          <option value="">Selecione</option>
          {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
        </Select>
        <Select label="Lote" name="loteId" required disabled={!produtoId}>
          <option value="">Selecione o lote</option>
          {lotes.map((l) => <option key={l.id} value={l.id}>{l.numero} (disponível: {l.quantidade})</option>)}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Quantidade" name="quantidade" type="number" step="0.1" min="0.1" required />
          <Select label="Motivo" name="motivo" required>
            <option value="">Motivo</option>
            <option value="VENCIMENTO">Vencimento</option>
            <option value="AVARIA">Avaria</option>
            <option value="CONTAMINACAO">Contaminação</option>
            <option value="FURTO">Furto</option>
            <option value="OUTRO">Outro</option>
          </Select>
        </div>
        <Input label="Registrado por" name="registradoPor" placeholder="Nome do responsável" />
        <Textarea label="Observação" name="observacao" rows={2} />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="danger" isLoading={loading}>Registrar Perda</Button>
        </div>
      </form>
    </>
  );
}
