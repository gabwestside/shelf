export const TIMEZONE_FORTALEZA = "America/Fortaleza";

/**
 * Retorna a data atual no fuso America/Fortaleza no formato YYYY-MM-DD.
 */
export function getTodayInFortaleza(): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE_FORTALEZA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Formata uma data YYYY-MM-DD ou Date em formato amigável pt-BR (ex: 15 de out. de 2026).
 */
export function formatDatePtBR(dateStrOrDate: string | Date): string {
  if (!dateStrOrDate) return "";
  const date = typeof dateStrOrDate === "string" ? new Date(`${dateStrOrDate}T00:00:00`) : dateStrOrDate;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE_FORTALEZA,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/**
 * Gera um array de strings YYYY-MM-DD para os últimos N dias no fuso de Fortaleza.
 */
export function getLastNDaysInFortaleza(n: number): string[] {
  const dates: string[] = [];
  const todayStr = getTodayInFortaleza();
  const [year, month, day] = todayStr.split("-").map(Number);
  
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  
  return dates;
}

/**
 * Verifica se duas datas YYYY-MM-DD são dias consecutivos.
 */
export function isConsecutiveDay(prevDateStr: string, nextDateStr: string): boolean {
  const [y1, m1, d1] = prevDateStr.split("-").map(Number);
  const [y2, m2, d2] = nextDateStr.split("-").map(Number);
  const prev = Date.UTC(y1, m1 - 1, d1);
  const next = Date.UTC(y2, m2 - 1, d2);
  const diffDays = Math.round((next - prev) / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}
