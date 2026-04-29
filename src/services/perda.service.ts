import { prisma } from "@/lib/prisma";
import type { PerdaInput } from "@/lib/validations";

export const perdaService = {
  async registrar(data: PerdaInput) {
    return prisma.$transaction(async (tx) => {
      const lote = await tx.lote.findUnique({
        where: { id: data.loteId },
        include: { produto: true },
      });

      if (!lote) throw new Error("Lote não encontrado");
      if (lote.quantidade < data.quantidade) {
        throw new Error(`Quantidade insuficiente no lote. Disponível: ${lote.quantidade}`);
      }

      const valorEstimado = data.quantidade * lote.produto.precoBase;

      const perda = await tx.perda.create({
        data: {
          produtoId: data.produtoId,
          loteId: data.loteId,
          quantidade: data.quantidade,
          motivo: data.motivo,
          observacao: data.observacao,
          registradoPor: data.registradoPor,
          valorEstimado,
        },
      });

      await tx.lote.update({
        where: { id: data.loteId },
        data: { quantidade: { decrement: data.quantidade } },
      });

      await tx.movimentacao.create({
        data: {
          produtoId: data.produtoId,
          loteId: data.loteId,
          tipo: "SAIDA_PERDA",
          quantidade: data.quantidade,
          referenciaId: perda.id,
          observacao: `Perda registrada - ${data.motivo}`,
        },
      });

      return perda;
    });
  },

  async listar(params?: { page?: number; limit?: number; produtoId?: string }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (params?.produtoId) where.produtoId = params.produtoId;

    const [perdas, total] = await Promise.all([
      prisma.perda.findMany({
        where,
        include: { produto: true, lote: true },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.perda.count({ where }),
    ]);

    return { perdas, total, page, limit };
  },

  async resumoPorMotivo() {
    return prisma.perda.groupBy({
      by: ["motivo"],
      _sum: { valorEstimado: true, quantidade: true },
      _count: true,
    });
  },
};
