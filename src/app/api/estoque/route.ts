import { NextResponse } from "next/server";
import { estoqueService } from "@/services/estoque.service";
import { LoteSchema } from "@/lib/validations";

export async function GET() {
  try {
    const estoque = await estoqueService.listarProdutosComLotes();
    return NextResponse.json(estoque);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar estoque" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = LoteSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const lote = await estoqueService.entradaEstoque({
      ...validated.data,
      dataValidade: new Date(validated.data.dataValidade),
    });

    return NextResponse.json(lote, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao registrar entrada";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
