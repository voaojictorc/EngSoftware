import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProdutoSchema } from "@/lib/validations";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      where: { ativo: true },
      include: {
        lotes: {
          where: { ativo: true, quantidade: { gt: 0 } },
        },
      },
      orderBy: { nome: "asc" },
    });
    return NextResponse.json(produtos);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = ProdutoSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }

    const produto = await prisma.produto.create({ data: validated.data });
    return NextResponse.json(produto, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar produto" }, { status: 500 });
  }
}
