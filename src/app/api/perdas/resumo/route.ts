import { NextResponse } from "next/server";
import { perdaService } from "@/services/perda.service";

export async function GET() {
  try {
    const resumo = await perdaService.resumoPorMotivo();
    return NextResponse.json(resumo);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar resumo" }, { status: 500 });
  }
}
