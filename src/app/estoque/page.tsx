"use client";

import { useEffect, useState } from "react";
import { Plus, Search, AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency, formatDate, formatQuantidade } from "@/lib/utils";

interface Lote {
  id: string;
  numero: string;
  quantidade: number;
  quantidadeInicial: number;
  dataEntrada: string;
  dataValidade: string;
  custoUnitario: number;
  diasParaVencer: number;
  status: string;
  descontoSugerido: number;
}

interface EstoqueItem {
  id: string;
  nome: string;
  unidade: string;
  precoBase: number;
  estoqueMinimo: number;
  totalQuantidade: number;
  lotes: Lote[];
}

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "danger" | "default" }> = {
  ok: { label: "OK", variant: "success" },
  alerta: { label: "Alerta", variant: "warning" },
  critico: { label: "Crítico", variant: "danger" },
  vencido: { label: "Vencido", variant: "danger" },
};

export default function EstoquePage() {
  const [estoque, setEstoque] = useState<EstoqueItem[]>([]);
  const [produtos, setProdutos] = useState<{ id: string; nome: string; unidade: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [novoLoteOpen, setNovoLoteOpen] = useState(false);
  const [novoProdutoOpen, setNovoProdutoOpen] = useState(false);

  const fetchEstoque = () => {
    setLoading(true);
    fetch("/api/estoque")
      .then((r) => r.json())
      .then(setEstoque)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEstoque();
    fetch("/api/produtos")
      .then((r) => r.json())
      .then(setProdutos);
  }, []);

  const filtered = estoque.filter((item) => {
    const matchesSearch = item.nome.toLowerCase().includes(search.toLowerCase());
    if (!filtroStatus) return matchesSearch;
    const hasStatus = item.lotes.some((l) => l.status === filtroStatus);
    return matchesSearch && hasStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Controle de Estoque</h2>
          <p className="text-sm text-slate-400">{estoque.length} produtos cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={novoProdutoOpen} onOpenChange={setNovoProdutoOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3.5 w-3.5" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <NovoProdutoForm
                onSuccess={() => {
                  setNovoProdutoOpen(false);
                  fetchEstoque();
                  fetch("/api/produtos").then((r) => r.json()).then(setProdutos);
                }}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={novoLoteOpen} onOpenChange={setNovoLoteOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-3.5 w-3.5" />
                Entrada de Lote
              </Button>
            </DialogTrigger>
            <DialogContent>
              <NovoLoteForm
                produtos={produtos}
                onSuccess={() => {
                  setNovoLoteOpen(false);
                  fetchEstoque();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Buscar produto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-3.5 w-3.5" />}
          />
        </div>
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="ok">OK</option>
          <option value="alerta">Alerta</option>
          <option value="critico">Crítico</option>
          <option value="vencido">Vencido</option>
        </select>
      </div>

      {/* Table */}
      <Card>
        <Table loading={loading} isEmpty={filtered.length === 0} emptyMessage="Nenhum produto encontrado">
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Estoque Total</TableHead>
              <TableHead>Lotes Ativos</TableHead>
              <TableHead>Preço Base</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => {
              const worstStatus = item.lotes.reduce((worst, l) => {
                const order = ["ok", "alerta", "critico", "vencido"];
                return order.indexOf(l.status) > order.indexOf(worst) ? l.status : worst;
              }, "ok");
              const isBaixo = item.totalQuantidade <= item.estoqueMinimo;
              const isExpanded = expandedId === item.id;

              return (
                <>
                  <TableRow key={item.id} className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                    <TableCell>
                      <span className="font-medium text-slate-900">{item.nome}</span>
                      <span className="ml-1.5 text-xs text-slate-400">{item.unidade}</span>
                    </TableCell>
                    <TableCell>
                      <span className={isBaixo ? "text-red-600 font-medium" : ""}>
                        {formatQuantidade(item.totalQuantidade, item.unidade)}
                      </span>
                      {isBaixo && (
                        <span className="ml-1.5 text-xs text-red-500 inline-flex items-center gap-0.5">
                          <AlertTriangle className="h-3 w-3" /> Baixo
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{item.lotes.length}</TableCell>
                    <TableCell>{formatCurrency(item.precoBase)}</TableCell>
                    <TableCell>
                      {item.lotes.length === 0 ? (
                        <Badge variant="outline">Sem estoque</Badge>
                      ) : (
                        <Badge variant={statusConfig[worstStatus]?.variant ?? "default"}>
                          {statusConfig[worstStatus]?.label ?? worstStatus}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-400">{isExpanded ? "▲" : "▼"}</span>
                    </TableCell>
                  </TableRow>
                  {isExpanded && item.lotes.length > 0 && (
                    <TableRow key={`${item.id}-lotes`}>
                      <TableCell colSpan={6} className="bg-slate-50 py-0 px-0">
                        <div className="px-8 py-4">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Lotes</p>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-slate-400">
                                <th className="text-left pb-2 pr-4">Nº Lote</th>
                                <th className="text-left pb-2 pr-4">Qtd Atual</th>
                                <th className="text-left pb-2 pr-4">Entrada</th>
                                <th className="text-left pb-2 pr-4">Validade</th>
                                <th className="text-left pb-2 pr-4">Dias p/ Vencer</th>
                                <th className="text-left pb-2 pr-4">Desconto Sugerido</th>
                                <th className="text-left pb-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.lotes.map((lote) => (
                                <tr key={lote.id} className="border-t border-slate-100">
                                  <td className="py-2 pr-4 font-mono text-xs text-slate-600">{lote.numero}</td>
                                  <td className="py-2 pr-4">{formatQuantidade(lote.quantidade, item.unidade)}</td>
                                  <td className="py-2 pr-4 text-slate-500">{formatDate(lote.dataEntrada)}</td>
                                  <td className="py-2 pr-4 text-slate-500">{formatDate(lote.dataValidade)}</td>
                                  <td className="py-2 pr-4">
                                    <span className={lote.diasParaVencer <= 1 ? "text-red-600 font-bold" : lote.diasParaVencer <= 3 ? "text-amber-600 font-medium" : "text-slate-600"}>
                                      {lote.diasParaVencer < 0 ? "Vencido" : `${lote.diasParaVencer}d`}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-4">
                                    {lote.descontoSugerido > 0 ? (
                                      <span className="text-green-600 font-medium">{(lote.descontoSugerido * 100).toFixed(0)}% off</span>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="py-2">
                                    <Badge variant={statusConfig[lote.status]?.variant ?? "default"}>
                                      {statusConfig[lote.status]?.label ?? lote.status}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function NovoProdutoForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      nome: fd.get("nome"),
      unidade: fd.get("unidade"),
      precoBase: Number(fd.get("precoBase")),
      estoqueMinimo: Number(fd.get("estoqueMinimo")),
      descricao: fd.get("descricao"),
    };

    const res = await fetch("/api/produtos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error?.fieldErrors ? JSON.stringify(data.error.fieldErrors) : "Erro ao criar produto");
    }
    setLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Novo Produto</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome do Produto" name="nome" placeholder="Ex: Alface Crespa" required />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Unidade" name="unidade">
            <option value="kg">kg</option>
            <option value="un">unidade</option>
            <option value="cx">caixa</option>
            <option value="pct">pacote</option>
            <option value="mç">maço</option>
          </Select>
          <Input label="Preço Base (R$)" name="precoBase" type="number" step="0.01" min="0" required />
        </div>
        <Input label="Estoque Mínimo" name="estoqueMinimo" type="number" step="0.1" min="0" defaultValue="0" />
        <Input label="Descrição (opcional)" name="descricao" />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" isLoading={loading}>Cadastrar Produto</Button>
        </div>
      </form>
    </>
  );
}

function NovoLoteForm({ produtos, onSuccess }: { produtos: { id: string; nome: string; unidade: string }[]; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      produtoId: fd.get("produtoId"),
      numero: fd.get("numero"),
      quantidade: Number(fd.get("quantidade")),
      dataValidade: fd.get("dataValidade"),
      custoUnitario: Number(fd.get("custoUnitario")),
    };

    const res = await fetch("/api/estoque", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao registrar lote");
    }
    setLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Entrada de Estoque</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select label="Produto" name="produtoId" required>
          <option value="">Selecione um produto</option>
          {produtos.map((p) => (
            <option key={p.id} value={p.id}>{p.nome} ({p.unidade})</option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nº do Lote" name="numero" placeholder="LOT-001" required />
          <Input label="Quantidade" name="quantidade" type="number" step="0.1" min="0.1" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Validade" name="dataValidade" type="date" required />
          <Input label="Custo Unitário (R$)" name="custoUnitario" type="number" step="0.01" min="0" required />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" isLoading={loading}>Registrar Entrada</Button>
        </div>
      </form>
    </>
  );
}
