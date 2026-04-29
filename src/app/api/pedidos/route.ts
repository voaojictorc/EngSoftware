import { NextResponse } from "next/server";
import { pedidoService } from "@/services/pedido.service";
import { PedidoSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? undefined;
    const clienteId = searchParams.get("clienteId") ?? undefined;
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");

    const result = await pedidoService.listar({ status, clienteId, page, limit });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erro ao listar pedidos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = PedidoSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const pedido = await pedidoService.criar(validated.data);
    return NextResponse.json(pedido, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao criar pedido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
