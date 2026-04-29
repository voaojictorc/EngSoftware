import { NextResponse } from "next/server";
import { pedidoService } from "@/services/pedido.service";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const pedido = await pedidoService.buscarPorId(params.id);
    if (!pedido) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    return NextResponse.json(pedido);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar pedido" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();

    if (body.acao === "cancelar") {
      const pedido = await pedidoService.cancelar(params.id);
      return NextResponse.json(pedido);
    }

    if (body.status) {
      const pedido = await pedidoService.atualizarStatus(params.id, body.status);
      return NextResponse.json(pedido);
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao atualizar pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
