import { NextResponse } from "next/server";
import { dashboardService } from "@/services/dashboard.service";

export async function GET() {
  try {
    const [stats, graficoVendas, produtosMaisVendidos, graficoPerdas] = await Promise.all([
      dashboardService.getStats(),
      dashboardService.getGraficoVendas(),
      dashboardService.getProdutosMaisVendidos(),
      dashboardService.getGraficoPerdas(),
    ]);

    return NextResponse.json({ stats, graficoVendas, produtosMaisVendidos, graficoPerdas });
  } catch {
    return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 });
  }
}
