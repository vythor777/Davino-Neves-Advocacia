'use client';

import React, { useRef, useState, useMemo, useSyncExternalStore } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg, DayCellContentArg } from '@fullcalendar/core';
import { Prazo } from '@/services/prazoService';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import {
  calcularStatusPrazo,
  formatDateForInput,
  type PrazoStatusCategory,
} from '@/utils/dateUtils';

export { calcularStatusPrazo };
export type { PrazoStatusCategory };

const emptySubscribe = () => () => {};

interface ProcessCalendarProps {
  prazos: Prazo[];
  onSelectPrazo: (prazo: Prazo) => void;
  onDateClick?: (dateStr: string) => void;
  loading?: boolean;
}

export function ProcessCalendar({
  prazos,
  onSelectPrazo,
  onDateClick,
  loading = false,
}: ProcessCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [currentView, setCurrentView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('dayGridMonth');
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Navegação do calendário
  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
  };

  const handleChangeView = (view: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setCurrentView(view);
    calendarRef.current?.getApi().changeView(view);
  };

  // Mapeamento dos prazos para o formato do FullCalendar
  const events = useMemo(() => {
    return prazos.map((prazo) => {
      const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status, prazo.hora);
      const dateOnly = formatDateForInput(prazo.data_vencimento);

      const horaStr = prazo.hora ? (prazo.hora.length === 5 ? `${prazo.hora}:00` : prazo.hora) : null;
      const startDateTime = horaStr ? `${dateOnly}T${horaStr}` : dateOnly;

      return {
        id: String(prazo.id_prazo),
        title: prazo.descricao,
        start: startDateTime,
        allDay: !horaStr,
        extendedProps: {
          prazo,
          statusCategory: calc.statusCategory,
          urgencia: calc.urgencia,
        },
      };
    });
  }, [prazos]);

  // Renderizador personalizado da pílula do evento rigorosamente alinhado com as 4 cores dos status
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { prazo, statusCategory } = eventInfo.event.extendedProps as {
      prazo: Prazo;
      statusCategory: PrazoStatusCategory;
      urgencia: 'vencido' | 'hoje' | 'urgente' | 'cumprido' | 'no_prazo';
    };

    const isCumprido = statusCategory === 'cumprido';

    // 4 cores rigorosamente alinhadas com os 4 status dos cards superiores:
    // 🟡 Urgentes / Hoje (Laranja/Amarelo - amber)
    // 🔴 Vencidos (Vermelho/Rosa - rose)
    // 🟢 Cumpridos (Verde - emerald)
    // 🟡 Em Aberto / Padrão (Dourado / Gold)
    let pillStyle =
      'bg-[#c5a059]/15 border-[#c5a059]/40 text-slate-900 dark:text-[#dfcaa0] dark:bg-[#c5a059]/20 dark:border-[#c5a059]/50 hover:bg-[#c5a059]/25';
    let dotStyle = 'bg-[#c5a059] dark:bg-[#d4b36f]';

    if (statusCategory === 'urgente') {
      pillStyle =
        'bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-500/70 dark:text-amber-200 hover:bg-amber-100/80 dark:hover:bg-amber-900/60';
      dotStyle = 'bg-amber-500 dark:bg-amber-400';
    } else if (statusCategory === 'vencido') {
      pillStyle =
        'bg-rose-50 border-rose-300 text-rose-900 dark:bg-rose-950/60 dark:border-rose-500/70 dark:text-rose-200 hover:bg-rose-100/80 dark:hover:bg-rose-900/60';
      dotStyle = 'bg-rose-500 dark:bg-rose-400';
    } else if (statusCategory === 'cumprido') {
      pillStyle =
        'bg-emerald-50 border-emerald-300 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-500/40 dark:text-emerald-100 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/60';
      dotStyle = 'bg-emerald-500 dark:bg-emerald-400';
    }

    const tooltipText = `${prazo.descricao}${prazo.processo ? ` • Processo: ${prazo.processo.numero_processo}` : ''}${prazo.hora ? ` • Hora: ${prazo.hora}` : ''}${isCumprido ? ' • Status: Cumprido' : ''}`;

    return (
      <div
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium transition-all hover:scale-[1.01] cursor-pointer shadow-2xs overflow-hidden ${pillStyle}`}
        title={tooltipText}
      >
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotStyle}`} />
        {prazo.hora && (
          <span className="font-mono text-[10px] opacity-85 shrink-0 font-semibold">
            {prazo.hora}
          </span>
        )}
        <span
          className={`truncate flex-1 font-semibold ${
            isCumprido
              ? 'line-through text-emerald-900 dark:text-emerald-100 opacity-95'
              : ''
          }`}
        >
          {eventInfo.event.title}
        </span>
      </div>
    );
  };

  // Renderizador personalizado das células de cada dia (estilo Google Agenda + ação rápida de criação)
  const renderDayCellContent = (arg: DayCellContentArg) => {
    const y = arg.date.getFullYear();
    const m = String(arg.date.getMonth() + 1).padStart(2, '0');
    const d = String(arg.date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const dayNumber = arg.date.getDate();

    return (
      <div className="flex items-center justify-between w-full select-none">
        <span
          className={
            arg.isToday
              ? 'w-7 h-7 rounded-full bg-[#c5a059] text-slate-950 flex items-center justify-center text-xs font-bold shadow-xs'
              : `text-xs font-semibold px-1 py-0.5 ${
                  arg.isOther
                    ? 'text-slate-400 dark:text-slate-600'
                    : 'text-slate-700 dark:text-slate-300'
                }`
          }
        >
          {dayNumber}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDateClick?.(dateStr);
          }}
          className="fc-day-add-btn h-6 w-6 rounded-md flex items-center justify-center text-slate-400 hover:text-[#c5a059] hover:bg-[#c5a059]/10 dark:hover:bg-[#c5a059]/20 dark:hover:text-[#d4b36f] transition cursor-pointer"
          title={`Cadastrar novo prazo para o dia ${dayNumber}`}
          aria-label={`Novo prazo em ${dateStr}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  if (!isClient) {
    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 animate-pulse">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6 w-1/3"></div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col legal-glass-card overflow-hidden">
      {/* Header Interativo no estilo Google Calendar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/60 dark:border-white/[0.06] flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-slate-50/40 dark:bg-white/[0.02]">
        {/* Esquerda: Botão Hoje, Chevrons de Navegação e Título do Mês */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToday}
            type="button"
            className="rounded-xl border border-slate-200/80 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] transition active:scale-95 shadow-2xs cursor-pointer"
          >
            Hoje
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] transition active:scale-95 shadow-2xs cursor-pointer"
              title="Mês anterior"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 text-slate-700 hover:bg-slate-100 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-slate-200 dark:hover:bg-white/[0.06] transition active:scale-95 shadow-2xs cursor-pointer"
              title="Próximo mês"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 dark:text-[#f8fafc] ml-1">
            {currentTitle || 'Agenda de Prazos'}
          </h2>
        </div>

        {/* Direita: Legenda Semântica com os 4 Status + Alternância de Visão (Mês, Semana, Dia) */}
        <div className="flex flex-wrap items-center gap-4 self-end lg:self-auto">
          {/* Legenda de Status com as 4 cores rigorosamente alinhadas */}
          <div className="hidden sm:flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200/60 dark:border-white/[0.06] pr-4">
            <div className="flex items-center gap-2" title="Vence hoje ou nos próximos 3 dias">
              <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
              <span>Urgentes / Hoje</span>
            </div>
            <div className="flex items-center gap-2" title="Prazo com data de vencimento expirada">
              <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
              <span>Vencidos</span>
            </div>
            <div className="flex items-center gap-2" title="Prazo já cumprido">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
              <span>Cumpridos</span>
            </div>
            <div className="flex items-center gap-2" title="Prazo regular em aberto">
              <span className="h-2 w-2 rounded-full bg-[#c5a059] shrink-0" />
              <span>Em Aberto / Padrão</span>
            </div>
          </div>

          {/* Seletor de Visão (Mês, Semana, Dia) */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-white/[0.04] p-1 border border-slate-200/60 dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => handleChangeView('dayGridMonth')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                currentView === 'dayGridMonth'
                  ? 'bg-[#c5a059] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => handleChangeView('timeGridWeek')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                currentView === 'timeGridWeek'
                  ? 'bg-[#c5a059] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => handleChangeView('timeGridDay')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                currentView === 'timeGridDay'
                  ? 'bg-[#c5a059] text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Dia
            </button>
          </div>
        </div>
      </div>

      {/* Grid Principal do FullCalendar */}
      <div className="p-3 sm:p-5 w-full overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="h-7 w-7 rounded-full border-2 border-amber-600 border-t-transparent animate-spin"></div>
          </div>
        )}

        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={false}
          dayMaxEvents={3}
          moreLinkContent={(args) => `+${args.num} mais`}
          events={events}
          eventContent={renderEventContent}
          dayCellContent={renderDayCellContent}
          eventClick={(info) => {
            const prazo = info.event.extendedProps.prazo as Prazo;
            if (prazo) {
              onSelectPrazo(prazo);
            }
          }}
          dateClick={(info) => {
            onDateClick?.(info.dateStr);
          }}
          datesSet={(arg) => {
            const date = arg.view.calendar.getDate();
            const formatted = date.toLocaleDateString('pt-BR', {
              month: 'long',
              year: 'numeric',
            });
            setCurrentTitle(formatted.charAt(0).toUpperCase() + formatted.slice(1));
          }}
          height="auto"
          contentHeight={620}
          locale="pt-br"
          buttonText={{
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
          }}
          dayHeaderFormat={{ weekday: 'short' }}
        />
      </div>
    </div>
  );
}

export default ProcessCalendar;
