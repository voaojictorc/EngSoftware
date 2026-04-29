import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

export function getDaysUntilExpiry(dataValidade: Date | string): number {
  const d = typeof dataValidade === "string" ? parseISO(dataValidade) : dataValidade;
  return differenceInDays(d, new Date());
}

export type ValidadeStatus = "ok" | "alerta" | "critico" | "vencido";

export function getValidadeStatus(dataValidade: Date | string): ValidadeStatus {
  const days = getDaysUntilExpiry(dataValidade);
  if (days < 0) return "vencido";
  if (days <= 1) return "critico";
  if (days <= 3) return "alerta";
  return "ok";
}

export function calcularDesconto(dataValidade: Date | string): number {
  const days = getDaysUntilExpiry(dataValidade);
  if (days <= 1) return 0.4;  // 40% de desconto
  if (days <= 2) return 0.25; // 25% de desconto
  if (days <= 3) return 0.1;  // 10% de desconto
  return 0;
}

export function formatQuantidade(value: number, unidade: string): string {
  return `${value.toLocaleString("pt-BR")} ${unidade}`;
}

export function formatPorcentagem(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}
