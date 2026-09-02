'use client';

import React, { useRef, useState, useMemo, useSyncExternalStore } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventContentArg } from '@fullcalendar/core';
import { Prazo } from '@/services/prazoService';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Flame,
  AlertTriangle,
  XCircle,
  CheckCircle2,
} from 'lucide-react';

const emptySubscribe = () => () => {};

interface ProcessCalendarProps {
  prazos: Prazo[];
  onSelectPrazo: (prazo: Prazo) => void;
  onDateClick?: (dateStr: string) => void;
  loading?: boolean;
}

export function calcularStatusPrazo(dataVencimentoStr: string, statusAtual: string) {
  if (statusAtual?.toLowerCase() === 'cumprido') {
    return {
      urgencia: 'cumprido' as const,
      label: 'Cumprido',
      dias: 0,
      badgeText: 'Cumprido',
      icon: CheckCircle2,
    };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const vencimento = new Date(dataVencimentoStr);
  vencimento.setHours(0, 0, 0, 0);

  const diffMs = vencimento.getTime() - hoje.getTime();
  const diffDias = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDias < 0) {
    const diasVencido = Math.abs(diffDias);
    return {
      urgencia: 'vencido' as const,
      label: 'Vencido',
      dias: diffDias,
      badgeText: diasVencido === 1 ? 'Vencido há 1 dia' : `Vencido há ${diasVencido} dias`,
      icon: XCircle,
    };
  }

  if (diffDias === 0) {
    return {
      urgencia: 'hoje' as const,
      label: 'Vence Hoje',
      dias: 0,
      badgeText: 'Vence Hoje',
      icon: Flame,
    };
  }

  if (diffDias <= 3) {
    return {
      urgencia: 'urgente' as const,
      label: 'Urgente',
      dias: diffDias,
      badgeText: diffDias === 1 ? 'Vence amanhã' : `Vence em ${diffDias} dias`,
      icon: AlertTriangle,
    };
  }

  return {
    urgencia: 'no_prazo' as const,
    label: 'No Prazo',
    dias: diffDias,
    badgeText: `Vence em ${diffDias} dias`,
    icon: Clock,
  };
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
      const calc = calcularStatusPrazo(prazo.data_vencimento, prazo.status);
      const dateOnly = prazo.data_vencimento.includes('T')
        ? prazo.data_vencimento.split('T')[0]
        : prazo.data_vencimento;

      const horaStr = prazo.hora ? (prazo.hora.length === 5 ? `${prazo.hora}:00` : prazo.hora) : null;
      const startDateTime = horaStr ? `${dateOnly}T${horaStr}` : dateOnly;

      return {
        id: String(prazo.id_prazo),
        title: prazo.descricao,
        start: startDateTime,
        allDay: !horaStr,
        extendedProps: {
          prazo,
          urgencia: calc.urgencia,
        },
      };
    });
  }, [prazos]);

  // Renderizador personalizado da pílula do evento
  const renderEventContent = (eventInfo: EventContentArg) => {
    const { prazo, urgencia } = eventInfo.event.extendedProps as {
      prazo: Prazo;
      urgencia: 'vencido' | 'hoje' | 'urgente' | 'cumprido' | 'no_prazo';
    };

    const isCumprido = prazo.status?.toLowerCase() === 'cumprido';
    const isUrgenteOuVencido = urgencia === 'vencido' || urgencia === 'hoje' || urgencia === 'urgente';

    // Regras estritas de estilo conforme especificado no pedido:
    // Urgentes/Vencidos: bg-red-900/50 border-red-500 text-red-200
    // Cumpridos: bg-emerald-900/50 border-emerald-500 text-emerald-200
    // Padrão: bg-blue-900/50 border-blue-500 text-blue-200
    let pillStyle = 'bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-500 dark:text-blue-200';
    let dotStyle = 'bg-blue-500 dark:bg-blue-400';

    if (isCumprido) {
      pillStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-900/50 dark:border-emerald-500 dark:text-emerald-200';
      dotStyle = 'bg-emerald-500 dark:bg-emerald-400';
    } else if (isUrgenteOuVencido) {
      pillStyle = 'bg-red-50 border-red-300 text-red-800 dark:bg-red-900/50 dark:border-red-500 dark:text-red-200';
      dotStyle = 'bg-red-500 dark:bg-red-400';
    }

    return (
      <div
        className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-medium transition-all hover:scale-[1.02] cursor-pointer shadow-2xs overflow-hidden ${pillStyle}`}
        title={`${prazo.descricao} - ${prazo.processo?.numero_processo || ''}${prazo.hora ? ` (${prazo.hora})` : ''}`}
      >
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotStyle}`} />
        {prazo.hora && (
          <span className="font-mono text-[10px] opacity-80 shrink-0 font-semibold">
            {prazo.hora}
          </span>
        )}
        <span className={`truncate flex-1 font-semibold ${isCumprido ? 'line-through opacity-75' : ''}`}>
          {eventInfo.event.title}
        </span>
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
    <div className="w-full flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
      {/* Header Interativo no estilo Google Calendar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-slate-50/50 dark:bg-slate-900/50">
        {/* Esquerda: Botão Hoje, Chevrons de Navegação e Título do Mês */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleToday}
            type="button"
            className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition active:scale-95 shadow-2xs"
          >
            Hoje
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition active:scale-95 shadow-2xs"
              title="Mês anterior"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNext}
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition active:scale-95 shadow-2xs"
              title="Próximo mês"
              aria-label="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white ml-1">
            {currentTitle || 'Agenda de Prazos'}
          </h2>
        </div>

        {/* Direita: Legenda Semântica + Alternância de Visão (Mês, Semana, Dia) */}
        <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
          {/* Legenda de Pílulas */}
          <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 pr-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Urgentes / Vencidos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Cumpridos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Padrão</span>
            </div>
          </div>

          {/* Seletor de Visão (Mês, Semana, Dia) */}
          <div className="flex items-center rounded-xl bg-slate-200 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => handleChangeView('dayGridMonth')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                currentView === 'dayGridMonth'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Mês
            </button>
            <button
              type="button"
              onClick={() => handleChangeView('timeGridWeek')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                currentView === 'timeGridWeek'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Semana
            </button>
            <button
              type="button"
              onClick={() => handleChangeView('timeGridDay')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                currentView === 'timeGridDay'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
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
