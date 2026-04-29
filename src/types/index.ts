import type { Produto, Lote, Cliente, Pedido, ItemPedido, Perda, Movimentacao } from "@prisma/client";

export type { Produto, Lote, Cliente, Pedido, ItemPedido, Perda, Movimentacao };

export type ProdutoComLotes = Produto & {
  lotes: Lote[];
};

export type LoteComProduto = Lote & {
  produto: Produto;
};

export type PedidoCompleto = Pedido & {
  cliente: Cliente;
  itens: (ItemPedido & {
    produto: Produto;
    lote: Lote;
  })[];
};

export type PerdaCompleta = Perda & {
  produto: Produto;
  lote: Lote;
};

export type DashboardStats = {
  totalProdutos: number;
  totalEstoque: number;
  pedidosHoje: number;
  faturamentoMes: number;
  perdasMes: number;
  alertasValidade: number;
  estoqueBaixo: number;
};

export type EstoqueItem = Produto & {
  totalQuantidade: number;
  lotes: (Lote & { diasParaVencer: number; status: string; descontoSugerido: number })[];
};

export type RelatorioVendas = {
  mes: string;
  faturamento: number;
  pedidos: number;
};

export type RelatorioPerdas = {
  mes: string;
  valor: number;
  quantidade: number;
};

export type ProdutoMaisVendido = {
  produto: Produto;
  quantidadeTotal: number;
  faturamento: number;
};

export type ApiResponse<T> = {
  data?: T;
  error?: string;
  message?: string;
};
