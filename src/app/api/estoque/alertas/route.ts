import { NextResponse } from "next/server";
import { estoqueService } from "@/services/estoque.service";

export async function GET() {
  try {
    const [alertasValidade, estoqueBaixo] = await Promise.all([
      estoqueService.alertasValidade(3),
      estoqueService.estoqueBaixo(),
    ]);
    return NextResponse.json({ alertasValidade, estoqueBaixo });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar alertas" }, { status: 500 });
  }
}
