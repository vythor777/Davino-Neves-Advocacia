import {
  CheckCircle2,
  XCircle,
  Flame,
  AlertTriangle,
  Clock,
  type LucideIcon,
} from 'lucide-react';

export type PrazoUrgencia = 'cumprido' | 'vencido' | 'hoje' | 'urgente' | 'no_prazo';
export type PrazoStatusCategory = 'urgente' | 'vencido' | 'cumprido' | 'aberto';

export interface PrazoCalculado {
  urgencia: PrazoUrgencia;
  statusCategory: PrazoStatusCategory;
  label: string;
  dias: number;
  badgeText: string;
  badgeClass: string;
  icon: LucideIcon;
  isVencido: boolean;
  isHoje: boolean;
  isUrgente: boolean;
  isCumprido: boolean;
  dataExibicao: string;
  dataExtenso: string;
  horaExibicao: string;
}

/**
 * Extrai os componentes (ano, mês 0-11, dia) sem sofrer deslocamento de fuso horário UTC.
 */
export function extractDateParts(dataStr: string): { year: number; month: number; day: number } {
  if (!dataStr) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }
  const dateOnly = dataStr.includes('T') ? dataStr.split('T')[0] : dataStr;
  const parts = dateOnly.split('-');
  if (parts.length >= 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed (0 = Jan, 8 = Set)
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { year, month, day };
    }
  }
  const d = new Date(dataStr);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}

/**
 * Extrai hora e minuto de uma string HH:mm ou HH:mm:ss.
 */
export function extractTimeParts(horaStr?: string | null): { hours: number; minutes: number } {
  if (!horaStr) return { hours: 23, minutes: 59 };
  const clean = horaStr.trim();
  if (!clean.includes(':')) return { hours: 23, minutes: 59 };
  const parts = clean.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  return {
    hours: isNaN(hours) ? 23 : hours,
    minutes: isNaN(minutes) ? 59 : minutes,
  };
}

/**
 * Cria um objeto Date local combinando data e hora explicitamente, sem distorção de timezone.
 */
export function parsePrazoDateTime(dataStr: string, horaStr?: string | null): Date {
  const { year, month, day } = extractDateParts(dataStr);
  const { hours, minutes } = extractTimeParts(horaStr);
  return new Date(year, month, day, hours, minutes, 0, 0);
}

/**
 * Formata para string 'YYYY-MM-DD' para uso seguro em inputs type="date".
 */
export function formatDateForInput(dataStr: string): string {
  if (!dataStr) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (dataStr.includes('T')) {
    return dataStr.split('T')[0];
  }
  const parts = dataStr.split('-');
  if (parts.length === 3) {
    return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
  }
  return dataStr;
}

/**
 * Formata data no padrão brasileiro DD/MM/AAAA sem interferência de fuso horário.
 */
export function formatPrazoDateBR(dataStr: string): string {
  if (!dataStr) return '';
  const { year, month, day } = extractDateParts(dataStr);
  const dayStr = String(day).padStart(2, '0');
  const monthStr = String(month + 1).padStart(2, '0');
  return `${dayStr}/${monthStr}/${year}`;
}

const DIAS_SEMANA = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/**
 * Formata data por extenso (ex: "Quarta-feira, 02 de setembro de 2026") sem distorção.
 */
export function formatPrazoExtenso(dataStr: string): string {
  if (!dataStr) return '';
  const { year, month, day } = extractDateParts(dataStr);
  const tempDate = new Date(year, month, day, 12, 0, 0);
  const diaSemana = DIAS_SEMANA[tempDate.getDay()];
  const mesNome = MESES[month];
  const diaStr = String(day).padStart(2, '0');
  const formatted = `${diaSemana}, ${diaStr} de ${mesNome} de ${year}`;
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Retorna a data de hoje no formato YYYY-MM-DD segundo o horário local do cliente.
 */
export function getLocalTodayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calcula a situação do prazo (vencido, hoje, urgente, no prazo, cumprido).
 * Considera tanto a data quanto o horário exato de vencimento em relação ao momento atual.
 */
export function calcularStatusPrazo(
  dataVencimentoStr: string,
  statusAtual: string,
  horaStr?: string | null,
): PrazoCalculado {
  const isCumprido = (statusAtual || '').toLowerCase() === 'cumprido';

  const dataExibicao = formatPrazoDateBR(dataVencimentoStr);
  const dataExtenso = formatPrazoExtenso(dataVencimentoStr);
  const horaExibicao = horaStr ? horaStr.trim() : '';

  if (isCumprido) {
    return {
      urgencia: 'cumprido',
      statusCategory: 'cumprido',
      label: 'Cumprido',
      dias: 0,
      badgeText: 'Cumprido',
      badgeClass:
        'bg-emerald-100 text-emerald-900 border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-900/60 dark:text-emerald-300',
      icon: CheckCircle2,
      isVencido: false,
      isHoje: false,
      isUrgente: false,
      isCumprido: true,
      dataExibicao,
      dataExtenso,
      horaExibicao,
    };
  }

  const agora = new Date();
  const hojeInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), 0, 0, 0, 0);

  const { year, month, day } = extractDateParts(dataVencimentoStr);
  const { hours, minutes } = extractTimeParts(horaStr);

  const vencimentoDataInicio = new Date(year, month, day, 0, 0, 0, 0);
  const momentoExatoVencimento = new Date(year, month, day, hours, minutes, 0, 0);

  // Diferença em dias civis (dia do vencimento vs dia de hoje)
  const diffMsDias = vencimentoDataInicio.getTime() - hojeInicio.getTime();
  const diffDias = Math.round(diffMsDias / (1000 * 60 * 60 * 24));

  const isDiaHoje = diffDias === 0;
  const isDiaPassado = diffDias < 0;

  // Um prazo só é vencido se o momento exato (Data + Hora) já passou
  const isMomentoPassado = momentoExatoVencimento.getTime() < agora.getTime();

  // 1. Caso Vencido:
  // - Se a data é anterior a hoje (isDiaPassado), está vencido há X dias.
  // - Se a data é hoje, mas o horário especificado já passou (isMomentoPassado), está vencido hoje.
  if (isDiaPassado || (isDiaHoje && isMomentoPassado)) {
    if (isDiaHoje) {
      return {
        urgencia: 'vencido',
        statusCategory: 'vencido',
        label: 'Vencido Hoje',
        dias: 0,
        badgeText: horaExibicao ? `Vencido hoje (${horaExibicao})` : 'Vencido hoje',
        badgeClass:
          'bg-rose-100 text-rose-900 border-rose-300 font-semibold dark:bg-rose-950/70 dark:border-rose-800 dark:text-rose-200',
        icon: XCircle,
        isVencido: true,
        isHoje: true,
        isUrgente: false,
        isCumprido: false,
        dataExibicao,
        dataExtenso,
        horaExibicao,
      };
    }

    const diasVencido = Math.abs(diffDias);
    return {
      urgencia: 'vencido',
      statusCategory: 'vencido',
      label: 'Vencido',
      dias: diffDias,
      badgeText: diasVencido === 1 ? 'Vencido há 1 dia' : `Vencido há ${diasVencido} dias`,
      badgeClass:
        'bg-rose-100 text-rose-900 border-rose-200 dark:bg-rose-950/60 dark:border-rose-900/60 dark:text-rose-300',
      icon: XCircle,
      isVencido: true,
      isHoje: false,
      isUrgente: false,
      isCumprido: false,
      dataExibicao,
      dataExtenso,
      horaExibicao,
    };
  }

  // 2. Caso Vence Hoje (e o horário ainda não passou!):
  if (isDiaHoje) {
    return {
      urgencia: 'hoje',
      statusCategory: 'urgente',
      label: 'Vence Hoje',
      dias: 0,
      badgeText: horaExibicao ? `⚠️ Vence Hoje às ${horaExibicao}` : '⚠️ Vence Hoje!',
      badgeClass:
        'bg-amber-100 text-amber-950 border-amber-300 font-bold dark:bg-amber-950/70 dark:border-amber-700 dark:text-amber-200 animate-pulse',
      icon: Flame,
      isVencido: false,
      isHoje: true,
      isUrgente: true,
      isCumprido: false,
      dataExibicao,
      dataExtenso,
      horaExibicao,
    };
  }

  // 3. Caso Urgente (1 a 3 dias à frente):
  if (diffDias <= 3) {
    return {
      urgencia: 'urgente',
      statusCategory: 'urgente',
      label: 'Urgente',
      dias: diffDias,
      badgeText: diffDias === 1 ? 'Vence amanhã' : `Vence em ${diffDias} dias`,
      badgeClass:
        'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:border-amber-800 dark:text-amber-300',
      icon: AlertTriangle,
      isVencido: false,
      isHoje: false,
      isUrgente: true,
      isCumprido: false,
      dataExibicao,
      dataExtenso,
      horaExibicao,
    };
  }

  // 4. Caso No Prazo (mais de 3 dias à frente):
  return {
    urgencia: 'no_prazo',
    statusCategory: 'aberto',
    label: 'No Prazo',
    dias: diffDias,
    badgeText: `Vence em ${diffDias} dias`,
    badgeClass:
      'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-950/60 dark:border-blue-800 dark:text-blue-300',
    icon: Clock,
    isVencido: false,
    isHoje: false,
    isUrgente: false,
    isCumprido: false,
    dataExibicao,
    dataExtenso,
    horaExibicao,
  };
}
