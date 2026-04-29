"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";

interface Cliente {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  documento: string | null;
  cidade: string | null;
  ativo: boolean;
  createdAt: string;
  _count?: { pedidos: number };
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [novoOpen, setNovoOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);

  const fetchClientes = () => {
    setLoading(true);
    fetch("/api/clientes")
      .then((r) => r.json())
      .then(setClientes)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClientes(); }, []);

  const filtered = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    (c.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.documento ?? "").includes(search)
  );

  async function desativar(id: string) {
    if (!confirm("Desativar este cliente?")) return;
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    fetchClientes();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Clientes</h2>
          <p className="text-sm text-slate-400">{clientes.length} clientes cadastrados</p>
        </div>
        <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-3.5 w-3.5" />Novo Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <ClienteForm
              onSuccess={() => { setNovoOpen(false); fetchClientes(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-xs">
        <Input placeholder="Buscar por nome, email ou CPF/CNPJ..." value={search} onChange={(e) => setSearch(e.target.value)} leftIcon={<Search className="h-3.5 w-3.5" />} />
      </div>

      <Card>
        <Table loading={loading} isEmpty={filtered.length === 0}>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Cidade</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Cadastro</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>
                  <span className="font-medium text-slate-900">{cliente.nome}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    {cliente.email && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Mail className="h-3 w-3" /> {cliente.email}
                      </span>
                    )}
                    {cliente.telefone && (
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3 w-3" /> {cliente.telefone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-slate-500">{cliente.cidade ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs text-slate-500">{cliente.documento ?? "—"}</TableCell>
                <TableCell className="text-slate-500">{formatDate(cliente.createdAt)}</TableCell>
                <TableCell>
                  <Badge variant={cliente.ativo ? "success" : "outline"}>
                    {cliente.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => setEditando(cliente)}>Editar</Button>
                    {cliente.ativo && (
                      <Button size="sm" variant="ghost" onClick={() => desativar(cliente.id)}>Desativar</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent>
          {editando && (
            <ClienteForm
              cliente={editando}
              onSuccess={() => { setEditando(null); fetchClientes(); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ClienteForm({ cliente, onSuccess }: { cliente?: Cliente; onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = {
      nome: fd.get("nome"),
      email: fd.get("email") || undefined,
      telefone: fd.get("telefone") || undefined,
      documento: fd.get("documento") || undefined,
      endereco: fd.get("endereco") || undefined,
      cidade: fd.get("cidade") || undefined,
    };

    const url = cliente ? `/api/clientes/${cliente.id}` : "/api/clientes";
    const method = cliente ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      onSuccess();
    } else {
      const data = await res.json();
      setError(data.error ?? "Erro ao salvar cliente");
    }
    setLoading(false);
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{cliente ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome" name="nome" defaultValue={cliente?.nome} required />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Email" name="email" type="email" defaultValue={cliente?.email ?? ""} />
          <Input label="Telefone" name="telefone" defaultValue={cliente?.telefone ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="CPF/CNPJ" name="documento" defaultValue={cliente?.documento ?? ""} />
          <Input label="Cidade" name="cidade" defaultValue={cliente?.cidade ?? ""} />
        </div>
        <Input label="Endereço" name="endereco" />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end pt-2">
          <Button type="submit" isLoading={loading}>{cliente ? "Salvar" : "Cadastrar"}</Button>
        </div>
      </form>
    </>
  );
}
