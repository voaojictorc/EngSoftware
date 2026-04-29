import { z } from "zod";

export const ProdutoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  descricao: z.string().optional(),
  unidade: z.string().default("kg"),
  precoBase: z.coerce.number().positive("Preço deve ser positivo"),
  estoqueMinimo: z.coerce.number().min(0).default(0),
  imagemUrl: z.string().url().optional().or(z.literal("")),
});

export const LoteSchema = z.object({
  produtoId: z.string().min(1, "Produto obrigatório"),
  numero: z.string().min(1, "Número do lote obrigatório"),
  quantidade: z.coerce.number().positive("Quantidade deve ser positiva"),
  dataValidade: z.string().min(1, "Data de validade obrigatória"),
  custoUnitario: z.coerce.number().positive("Custo deve ser positivo"),
});

export const ClienteSchema = z.object({
  nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional(),
  documento: z.string().optional(),
  endereco: z.string().optional(),
  cidade: z.string().optional(),
});

export const ItemPedidoSchema = z.object({
  produtoId: z.string().min(1, "Produto obrigatório"),
  loteId: z.string().min(1, "Lote obrigatório"),
  quantidade: z.coerce.number().positive("Quantidade deve ser positiva"),
  precoUnitario: z.coerce.number().positive("Preço deve ser positivo"),
  desconto: z.coerce.number().min(0).max(1).default(0),
});

export const PedidoSchema = z.object({
  clienteId: z.string().min(1, "Cliente obrigatório"),
  observacao: z.string().optional(),
  itens: z.array(ItemPedidoSchema).min(1, "Pedido deve ter ao menos um item"),
});

export const PerdaSchema = z.object({
  produtoId: z.string().min(1, "Produto obrigatório"),
  loteId: z.string().min(1, "Lote obrigatório"),
  quantidade: z.coerce.number().positive("Quantidade deve ser positiva"),
  motivo: z.enum(["VENCIMENTO", "AVARIA", "CONTAMINACAO", "FURTO", "OUTRO"]),
  observacao: z.string().optional(),
  registradoPor: z.string().optional(),
});

export type ProdutoInput = z.infer<typeof ProdutoSchema>;
export type LoteInput = z.infer<typeof LoteSchema>;
export type ClienteInput = z.infer<typeof ClienteSchema>;
export type PedidoInput = z.infer<typeof PedidoSchema>;
export type PerdaInput = z.infer<typeof PerdaSchema>;
