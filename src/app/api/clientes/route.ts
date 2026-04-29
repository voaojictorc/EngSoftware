import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ClienteSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? undefined;

    const clientes = await prisma.cliente.findMany({
      where: {
        ativo: true,
        ...(q && { nome: { contains: q, mode: "insensitive" } }),
      },
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(clientes);
  } catch {
    return NextResponse.json({ error: "Erro ao buscar clientes" }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const cliente = await prisma.cliente.create({ data: cleanData });
    return NextResponse.json(cliente, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}
