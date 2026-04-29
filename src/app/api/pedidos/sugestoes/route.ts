import { NextResponse } from "next/server";
import { pedidoService } from "@/services/pedido.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const produtoId = searchParams.get("produtoId");
    if (!produtoId) {
      return NextResponse.json({ error: "produtoId obrigatório" }, { status: 400 });
    }
    const sugestoes = await pedidoService.getSugestoesPreco(produtoId);
    return NextResponse.json(sugestoes);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar sugestões" }, { status: 500 });
  }
}
