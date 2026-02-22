import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Retorna a data/hora atual no fuso horário de Brasília (UTC-3).
 * Evita problemas onde new Date() retorna UTC e pode mostrar o dia errado
 * para usuários no Brasil (ex: 23h em Brasília = dia seguinte em UTC).
 */
export function getBrasiliaDate(): Date {
  const now = new Date();
  // Calcula o offset de Brasília: UTC-3 = -180 minutos
  const brasiliaOffset = -180;
  const localOffset = now.getTimezoneOffset();
  const diff = brasiliaOffset - localOffset;
  return new Date(now.getTime() + diff * 60 * 1000);
}

/**
 * Retorna início do dia em Brasília como ISO string com offset -03:00
 */
export function getBrasiliaStartOfDay(date?: Date): string {
  const d = date || getBrasiliaDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00-03:00`;
}

/**
 * Retorna fim do dia em Brasília como ISO string com offset -03:00
 */
export function getBrasiliaEndOfDay(date?: Date): string {
  const d = date || getBrasiliaDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T23:59:59-03:00`;
}

/**
 * Retorna a data atual em Brasília como string "YYYY-MM-DD".
 * Substitui o padrão new Date().toISOString().split("T")[0]
 * que após 21h no Brasil retorna o dia seguinte (UTC).
 */
export function getBrasiliaDateString(date?: Date): string {
  const d = date || getBrasiliaDate();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Parseia uma string de data pura (YYYY-MM-DD) forçando interpretação
 * no fuso local (sem shift para UTC). Resolve o bug onde
 * new Date("2026-02-20") era interpretado como UTC meia-noite,
 * resultando em 19/02 no horário de Brasília.
 * Para strings com hora (timestamps), retorna new Date() normalmente.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  // Se já tem "T" (timestamp completo), parseia normalmente
  if (dateStr.includes("T")) return new Date(dateStr);
  // Data pura: força interpretação local
  return new Date(dateStr + "T00:00:00");
}
