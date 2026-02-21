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
