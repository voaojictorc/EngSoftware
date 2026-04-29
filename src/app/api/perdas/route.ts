import { NextResponse } from "next/server";
import { perdaService } from "@/services/perda.service";
import { PerdaSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") ?? "1");
    const limit = Number(searchParams.get("limit") ?? "20");
    const produtoId = searchParams.get("produtoId") ?? undefined;

    const result = await perdaService.listar({ page, limit, produtoId });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erro ao listar perdas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = PerdaSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const perda = await perdaService.registrar(validated.data);
    return NextResponse.json(perda, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao registrar perda";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
