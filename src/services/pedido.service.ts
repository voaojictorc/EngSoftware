import { prisma } from "@/lib/prisma";
import { calcularDesconto } from "@/lib/utils";
import type { PedidoInput } from "@/lib/validations";

export const pedidoService = {
  async criar(data: PedidoInput) {
    return prisma.$transaction(async (tx) => {
      let totalBruto = 0;
      let totalDesconto = 0;

      // Validate all stock before creating order
      for (const item of data.itens) {
        const lote = await tx.lote.findUnique({ where: { id: item.loteId } });
        if (!lote || lote.quantidade < item.quantidade) {
          throw new Error(`Estoque insuficiente no lote para o item`);
        }
        if (!lote.ativo) {
          throw new Error(`Lote inativo`);
        }
        const sub = item.precoUnitario * item.quantidade;
        const desc = sub * item.desconto;
        totalBruto += sub;
        totalDesconto += desc;
      }

      const totalLiquido = totalBruto - totalDesconto;

      const pedido = await tx.pedido.create({
        data: {
          clienteId: data.clienteId,
          observacao: data.observacao,
          totalBruto,
          totalDesconto,
          totalLiquido,
          itens: {
            create: data.itens.map((item) => ({
              produtoId: item.produtoId,
              loteId: item.loteId,
              quantidade: item.quantidade,
              precoUnitario: item.precoUnitario,
              desconto: item.desconto,
              subtotal: item.precoUnitario * item.quantidade * (1 - item.desconto),
            })),
          },
        },
        include: {
          itens: { include: { produto: true, lote: true } },
          cliente: true,
        },
      });

      // Decrease stock using FIFO (lotes already selected by caller)
      for (const item of data.itens) {
        await tx.lote.update({
          where: { id: item.loteId },
          data: { quantidade: { decrement: item.quantidade } },
        });

        await tx.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            loteId: item.loteId,
            tipo: "SAIDA_VENDA",
            quantidade: item.quantidade,
            referenciaId: pedido.id,
            observacao: `Pedido #${pedido.id.slice(-6).toUpperCase()}`,
          },
        });
      }

      return pedido;
    });
  },

  async listar(params?: { status?: string; clienteId?: string; page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params?.status) where.status = params.status;
    if (params?.clienteId) where.clienteId = params.clienteId;

    const [pedidos, total] = await Promise.all([
      prisma.pedido.findMany({
        where,
        include: {
          cliente: true,
          itens: { include: { produto: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.pedido.count({ where }),
    ]);

    return { pedidos, total, page, limit };
  },

  async buscarPorId(id: string) {
    return prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        itens: { include: { produto: true, lote: true } },
      },
    });
  },

  async atualizarStatus(id: string, status: string) {
    const data: Record<string, unknown> = { status };
    if (status === "ENTREGUE") data.entregueEm = new Date();

    return prisma.pedido.update({ where: { id }, data });
  },

  async cancelar(id: string) {
    return prisma.$transaction(async (tx) => {
      const pedido = await tx.pedido.findUnique({
        where: { id },
        include: { itens: true },
      });

      if (!pedido) throw new Error("Pedido não encontrado");
      if (pedido.status === "ENTREGUE") throw new Error("Não é possível cancelar pedido entregue");

      // Restore stock
      for (const item of pedido.itens) {
        await tx.lote.update({
          where: { id: item.loteId },
          data: { quantidade: { increment: item.quantidade } },
        });

        await tx.movimentacao.create({
          data: {
            produtoId: item.produtoId,
            loteId: item.loteId,
            tipo: "AJUSTE",
            quantidade: item.quantidade,
            referenciaId: pedido.id,
            observacao: `Cancelamento pedido #${pedido.id.slice(-6).toUpperCase()}`,
          },
        });
      }

      return tx.pedido.update({ where: { id }, data: { status: "CANCELADO" } });
    });
  },

  async getSugestoesPreco(produtoId: string) {
    const lotes = await prisma.lote.findMany({
      where: { produtoId, ativo: true, quantidade: { gt: 0 } },
      include: { produto: true },
      orderBy: { dataEntrada: "asc" },
    });

    return lotes.map((l) => ({
      lote: l,
      descontoSugerido: calcularDesconto(l.dataValidade),
      precoSugerido: l.produto.precoBase * (1 - calcularDesconto(l.dataValidade)),
    }));
  },
};
