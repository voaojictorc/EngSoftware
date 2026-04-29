import { prisma } from "@/lib/prisma";
import { calcularDesconto, getDaysUntilExpiry, getValidadeStatus } from "@/lib/utils";
import type { EstoqueItem } from "@/types";

export const estoqueService = {
  async listarProdutosComLotes() {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      include: {
        lotes: {
          where: { ativo: true, quantidade: { gt: 0 } },
          orderBy: { dataEntrada: "asc" },
        },
      },
      orderBy: { nome: "asc" },
    });

    return produtos.map((p) => ({
      ...p,
      totalQuantidade: p.lotes.reduce((acc: number, l: { quantidade: number }) => acc + l.quantidade, 0),
      lotes: p.lotes.map((l) => ({
        ...l,
        diasParaVencer: getDaysUntilExpiry(l.dataValidade),
        status: getValidadeStatus(l.dataValidade),
        descontoSugerido: calcularDesconto(l.dataValidade),
      })),
    })) as unknown as EstoqueItem[];
  },

  async alertasValidade(dias = 3) {
    const limite = new Date();
    limite.setDate(limite.getDate() + dias);

    return prisma.lote.findMany({
      where: {
        ativo: true,
        quantidade: { gt: 0 },
        dataValidade: { lte: limite },
      },
      include: { produto: true },
      orderBy: { dataValidade: "asc" },
    });
  },

  async estoqueBaixo() {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      include: {
        lotes: {
          where: { ativo: true, quantidade: { gt: 0 } },
        },
      },
    });

    return produtos.filter((p) => {
      const total = p.lotes.reduce((acc, l) => acc + l.quantidade, 0);
      return total <= p.estoqueMinimo;
    });
  },

  async entradaEstoque(data: {
    produtoId: string;
    numero: string;
    quantidade: number;
    dataValidade: Date;
    custoUnitario: number;
  }) {
    return prisma.$transaction(async (tx) => {
      const lote = await tx.lote.create({
        data: {
          ...data,
          quantidadeInicial: data.quantidade,
        },
      });

      await tx.movimentacao.create({
        data: {
          produtoId: data.produtoId,
          loteId: lote.id,
          tipo: "ENTRADA",
          quantidade: data.quantidade,
          observacao: `Entrada - Lote ${data.numero}`,
        },
      });

      return lote;
    });
  },

  async getLoteFifo(produtoId: string, quantidadeNecessaria: number) {
    const lotes = await prisma.lote.findMany({
      where: {
        produtoId,
        ativo: true,
        quantidade: { gt: 0 },
      },
      orderBy: { dataEntrada: "asc" },
    });

    const totalDisponivel = lotes.reduce((acc, l) => acc + l.quantidade, 0);
    if (totalDisponivel < quantidadeNecessaria) {
      throw new Error(`Estoque insuficiente. Disponível: ${totalDisponivel}`);
    }

    const resultado: { loteId: string; quantidade: number }[] = [];
    let restante = quantidadeNecessaria;

    for (const lote of lotes) {
      if (restante <= 0) break;
      const usar = Math.min(lote.quantidade, restante);
      resultado.push({ loteId: lote.id, quantidade: usar });
      restante -= usar;
    }

    return resultado;
  },
};
