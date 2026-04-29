import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProdutoSchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const produto = await prisma.produto.findUnique({
      where: { id },
      include: { lotes: { orderBy: { dataEntrada: "asc" } } },
    });
    if (!produto) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    return NextResponse.json(produto);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar produto" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = ProdutoSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }
    const produto = await prisma.produto.update({
      where: { id },
      data: validated.data,
    });
    return NextResponse.json(produto);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar produto" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });
    return NextResponse.json({ message: "Produto desativado" });
  } catch {
    return NextResponse.json({ error: "Erro ao desativar produto" }, { status: 500 });
  }
}
