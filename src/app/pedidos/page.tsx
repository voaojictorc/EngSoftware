"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency, formatDate } from "@/lib/utils";

type StatusPedido = "PENDENTE" | "CONFIRMADO" | "ENTREGUE" | "CANCELADO";

interface Pedido {
  id: string;
  status: StatusPedido;
  totalLiquido: number;
  createdAt: string;
  cliente: { id: string; nome: string };
  itens: { id: string; produto: { nome: string }; quantidade: number; subtotal: number }[];
}

const statusConfig: Record<StatusPedido, { label: string; variant: "success" | "warning" | "info" | "default" | "danger" | "outline" }> = {
  PENDENTE: { label: "Pendente", variant: "warning" },
  CONFIRMADO: { label: "Confirmado", variant: "info" },
  ENTREGUE: { label: "Entregue", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "danger" },
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [novoPedidoOpen, setNovoPedidoOpen] = useState(false);
  const [detalheId, setDetalheId] = useState<string | null>(null);

  const fetchPedidos = (status?: string) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (status) params.set("status", status);
    fetch(`/api/pedidos?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setPedidos(data.pedidos ?? []);
        setTotal(data.total ?? 0);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPedidos(filtroStatus); }, [filtroStatus]);

  const filtered = pedidos.filter((p) =>
    p.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  async function atualizarStatus(id: string, status: StatusPedido) {
    await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchPedidos(filtroStatus);
  }

  async function cancelarPedido(id: string) {
    if (!confirm("Confirmar cancelamento? O estoque será restaurado.")) return;
    await fetch(`/api/pedidos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "cancelar" }),
    });
    fetchPedidos(filtroStatus);
  }

  const pedidoDetalhe = pedidos.find((p) => p.id === detalheId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Pedidos</h2>
          <p className="text-sm text-slate-400">{total} pedidos no total</p>
        </div>
        <Dialog open={novoPedidoOpen} onOpenChange={setNovoPedidoOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-3.5 w-3.5" />Novo Pedido</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <NovoPedidoForm onSuccess={() => { setNovoPedidoOpen(false); fetchPedidos(filtroStatus); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 max-w-xs">
          <Input placeholder="Buscar por cliente ou ID..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-3.5 w-3.5" />} />
        </div>
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <Card>
        <Table loading={loading} isEmpty={filtered.length === 0}>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((pedido) => (
              <TableRow key={pedido.id}>
                <TableCell>
                  <button
                    className="font-mono text-xs text-green-600 hover:underline"
                    onClick={() => setDetalheId(pedido.id)}
                  >
                    #{pedido.id.slice(-6).toUpperCase()}
                  </button>
                </TableCell>
                <TableCell className="font-medium text-slate-900">{pedido.cliente.nome}</TableCell>
                <TableCell>{pedido.itens.length} item(ns)</TableCell>
                <TableCell className="font-medium">{formatCurrency(pedido.totalLiquido)}</TableCell>
                <TableCell className="text-slate-500">{formatDate(pedido.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={statusConfig[pedido.status]?.variant ?? "default"}>
                    {statusConfig[pedido.status]?.label ?? pedido.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {pedido.status === "PENDENTE" && (
                      <Button size="sm" variant="outline" onClick={() => atualizarStatus(pedido.id, "CONFIRMADO")}>Confirmar</Button>
                    )}
                    {pedido.status === "CONFIRMADO" && (
                      <Button size="sm" variant="outline" onClick={() => atualizarStatus(pedido.id, "ENTREGUE")}>Entregar</Button>
                    )}
                    {(pedido.status === "PENDENTE" || pedido.status === "CONFIRMADO") && (
                      <Button size="sm" variant="danger" onClick={() => cancelarPedido(pedido.id)}>Cancelar</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Detail modal */}
      <Dialog open={!!detalheId} onOpenChange={(o) => !o && setDetalheId(null)}>
        <DialogContent className="max-w-lg">
          {pedidoDetalhe && (
            <>
              <DialogHeader>
                <DialogTitle>Pedido #{pedidoDetalhe.id.slice(-6).toUpperCase()}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cliente</span>
                  <span className="font-medium">{pedidoDetalhe.cliente.nome}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Status</span>
                  <Badge variant={statusConfig[pedidoDetalhe.status]?.variant ?? "default"}>{statusConfig[pedidoDetalhe.status]?.label}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Data</span>
                  <span>{formatDate(pedidoDetalhe.createdAt)}</span>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Itens</p>
                  {pedidoDetalhe.itens.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-1">
                      <span>{item.produto.nome} × {item.quantidade}</span>
                      <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(pedidoDetalhe.totalLiquido)}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface Cliente { id: string; nome: string; }
interface Produto { id: string; nome: string; unidade: string; precoBase: number; }
interface LoteOpt { id: string; numero: string; quantidade: number; dataValidade: string; descontoSugerido?: number; }

function NovoPedidoForm({ onSuccess }: { onSuccess: () => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<{ produtoId: string; loteId: string; quantidade: number; precoUnitario: number; desconto: number }[]>([]);
  const [lotesPorProduto, setLotesPorProduto] = useState<Record<string, LoteOpt[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/clientes").then((r) => r.json()).then(setClientes);
    fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
  }, []);

  async function carregarLotes(produtoId: string) {
    if (lotesPorProduto[produtoId]) return;
    const res = await fetch(`/api/pedidos/sugestoes?produtoId=${produtoId}`);
    if (res.ok) {
      const data = await res.json();
      setLotesPorProduto((prev) => ({ ...prev, [produtoId]: data.map((d: { lote: LoteOpt; descontoSugerido: number }) => ({ ...d.lote, descontoSugerido: d.descontoSugerido })) }));
    }
  }

  function adicionarItem() {
    setItens((prev) => [...prev, { produtoId: "", loteId: "", quantidade: 1, precoUnitario: 0, desconto: 0 }]);
  }

  function removerItem(i: number) {
    setItens((prev) => prev.filter((_, idx) => idx !== i));
  }

  function atualizarItem(i: number, field: string, value: string | number) {
    setItens((prev) => {
      const updated = [...prev];
      updated[i] = { ...updated[i], [field]: value };

      if (field === "produtoId") {
        const produto = produtos.find((p) => p.id === value);
        updated[i].precoUnitario = produto?.precoBase ?? 0;
        updated[i].loteId = "";
        updated[i].desconto = 0;
        if (value) carregarLotes(value as string);
      }

      if (field === "loteId") {
        const lotes = lotesPorProduto[updated[i].produtoId] ?? [];
        const lote = lotes.find((l) => l.id === value);
        if (lote?.descontoSugerido) updated[i].desconto = lote.descontoSugerido;
      }

      return updated;
    });
  }

  const total = itens.reduce((acc, item) => acc + item.precoUnitario * item.quantidade * (1 - item.desconto), 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (itens.length === 0) { setError("Adicione ao menos um item"); return; }
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      clienteId: fd.get("clienteId"),
      observacao: fd.get("observacao"),
      itens,
    };

    const res = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar pedido");
    }
    setLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo Pedido</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Cliente" name="clienteId" required>
          <option value="">Selecione um cliente</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </Select>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Itens do Pedido</label>
            <Button type="button" size="sm" variant="outline" onClick={adicionarItem}>
              <Plus className="h-3.5 w-3.5" /> Adicionar
            </Button>
          </div>
          {itens.length === 0 && <p className="text-sm text-slate-400 py-2">Nenhum item adicionado</p>}
          <div className="space-y-3">
            {itens.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-end p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="col-span-4">
                  <Select
                    label="Produto"
                    value={item.produtoId}
                    onChange={(e) => atualizarItem(i, "produtoId", e.target.value)}
                    required
                  >
                    <option value="">Produto</option>
                    {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </Select>
                </div>
                <div className="col-span-3">
                  <Select
                    label="Lote"
                    value={item.loteId}
                    onChange={(e) => atualizarItem(i, "loteId", e.target.value)}
                    required
                    disabled={!item.produtoId}
                  >
                    <option value="">Lote</option>
                    {(lotesPorProduto[item.produtoId] ?? []).map((l) => (
                      <option key={l.id} value={l.id}>{l.numero} ({l.quantidade})</option>
                    ))}
                  </Select>
                </div>
                <div className="col-span-2">
                  <Input
                    label="Qtd"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={item.quantidade}
                    onChange={(e) => atualizarItem(i, "quantidade", Number(e.target.value))}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="Preço"
                    type="number"
                    step="0.01"
                    value={item.precoUnitario}
                    onChange={(e) => atualizarItem(i, "precoUnitario", Number(e.target.value))}
                    required
                  />
                </div>
                <div className="col-span-1 flex items-end pb-0.5">
                  <button type="button" onClick={() => removerItem(i)} className="text-red-400 hover:text-red-600 p-1">✕</button>
                </div>
                {item.desconto > 0 && (
                  <div className="col-span-12 text-xs text-green-600 font-medium">
                    Desconto sugerido: {(item.desconto * 100).toFixed(0)}% por validade próxima
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {itens.length > 0 && (
          <div className="flex justify-between text-sm font-semibold border-t border-slate-100 pt-3">
            <span>Total Estimado</span>
            <span>{formatCurrency(total)}</span>
          </div>
        )}

        <Textarea label="Observação (opcional)" name="observacao" rows={2} />

        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" isLoading={loading}>Criar Pedido</Button>
        </div>
      </form>
    </>
  );
}
