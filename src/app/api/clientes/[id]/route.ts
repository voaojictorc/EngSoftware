import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClienteSchema } from "@/lib/validations";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: params.id },
      include: {
        pedidos: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
    if (!cliente) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validated = ClienteSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ error: validated.error.flatten() }, { status: 400 });
    }
    const cleanData = {
      ...validated.data,
      email: validated.data.email || undefined,
      documento: validated.data.documento || undefined,
    };
    const cliente = await prisma.cliente.update({ where: { id: params.id }, data: cleanData });
    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.cliente.update({ where: { id: params.id }, data: { ativo: false } });
    return NextResponse.json({ message: "Cliente desativado" });
  } catch {
    return NextResponse.json({ error: "Erro ao desativar cliente" }, { status: 500 });
  }
}
