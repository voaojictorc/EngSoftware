import { prisma } from "@/lib/prisma";
import type { DashboardStats } from "@/types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioDia = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const em3Dias = new Date(now);
    em3Dias.setDate(em3Dias.getDate() + 3);

    const [
      totalProdutos,
      pedidosHoje,
      faturamentoMes,
      perdasMes,
      alertasValidade,
    ] = await Promise.all([
      prisma.produto.count({ where: { ativo: true } }),
      prisma.pedido.count({
        where: { createdAt: { gte: inicioDia }, status: { not: "CANCELADO" } },
      }),
      prisma.pedido.aggregate({
        where: { createdAt: { gte: inicioMes }, status: { in: ["CONFIRMADO", "ENTREGUE"] } },
        _sum: { totalLiquido: true },
      }),
      prisma.perda.aggregate({
        where: { createdAt: { gte: inicioMes } },
        _sum: { valorEstimado: true },
      }),
      prisma.lote.count({
        where: { ativo: true, quantidade: { gt: 0 }, dataValidade: { lte: em3Dias } },
      }),
    ]);

    const lotes = await prisma.lote.findMany({
      where: { ativo: true, quantidade: { gt: 0 } },
      include: { produto: true },
    });

    const totalEstoque = lotes.reduce((acc, l) => acc + l.quantidade, 0);

    // Group by product to check low stock
    const porProduto = new Map<string, { total: number; minimo: number }>();
    for (const lote of lotes) {
      const existing = porProduto.get(lote.produtoId);
      if (existing) {
        existing.total += lote.quantidade;
      } else {
        porProduto.set(lote.produtoId, {
          total: lote.quantidade,
          minimo: lote.produto.estoqueMinimo,
        });
      }
    }
    const estoqueBaixo = [...porProduto.values()].filter((p) => p.total <= p.minimo).length;

    return {
      totalProdutos,
      totalEstoque,
      pedidosHoje,
      faturamentoMes: faturamentoMes._sum.totalLiquido ?? 0,
      perdasMes: perdasMes._sum.valorEstimado ?? 0,
      alertasValidade,
      estoqueBaixo,
    };
  },

  async getGraficoVendas() {
    const meses: { mes: string; faturamento: number; pedidos: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const [agg, count] = await Promise.all([
        prisma.pedido.aggregate({
          where: {
            createdAt: { gte: d, lte: fim },
            status: { in: ["CONFIRMADO", "ENTREGUE"] },
          },
          _sum: { totalLiquido: true },
        }),
        prisma.pedido.count({
          where: {
            createdAt: { gte: d, lte: fim },
            status: { not: "CANCELADO" },
          },
        }),
      ]);

      const label = d.toLocaleString("pt-BR", { month: "short" });
      meses.push({
        mes: label.charAt(0).toUpperCase() + label.slice(1),
        faturamento: agg._sum.totalLiquido ?? 0,
        pedidos: count,
      });
    }

    return meses;
  },

  async getProdutosMaisVendidos(limite = 5) {
    const itens = await prisma.itemPedido.groupBy({
      by: ["produtoId"],
      _sum: { quantidade: true, subtotal: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: limite,
    });

    const produtos = await Promise.all(
      itens.map(async (i) => {
        const produto = await prisma.produto.findUnique({ where: { id: i.produtoId } });
        return {
          produto,
          quantidadeTotal: i._sum.quantidade ?? 0,
          faturamento: i._sum.subtotal ?? 0,
        };
      })
    );

    return produtos;
  },

  async getGraficoPerdas() {
    const meses: { mes: string; valor: number; quantidade: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const fim = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const agg = await prisma.perda.aggregate({
        where: { createdAt: { gte: d, lte: fim } },
        _sum: { valorEstimado: true, quantidade: true },
      });

      const label = d.toLocaleString("pt-BR", { month: "short" });
      meses.push({
        mes: label.charAt(0).toUpperCase() + label.slice(1),
        valor: agg._sum.valorEstimado ?? 0,
        quantidade: agg._sum.quantidade ?? 0,
      });
    }

    return meses;
  },
};
