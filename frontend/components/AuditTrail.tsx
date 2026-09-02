'use client';

import React from 'react';
import {
  History,
  UserCheck,
  Edit3,
  PlusCircle,
  CheckCircle2,
  FileText,
  Clock,
  ShieldCheck,
  Tag,
} from 'lucide-react';

export interface AuditLogItem {
  id: string;
  usuario: string;
  cargo?: string;
  acao: 'CRIACAO' | 'EDICAO' | 'STATUS' | 'DOCUMENTO' | 'CONSULTA' | 'EXCLUSAO';
  descricao: string;
  timestamp: string;
  detalhes?: string;
}

interface AuditTrailProps {
  logs?: AuditLogItem[];
  title?: string;
  className?: string;
}

export function AuditTrail({
  logs = [],
  title = 'Trilha de Auditoria & Atividades',
  className = '',
}: AuditTrailProps) {
  const getActionConfig = (acao: AuditLogItem['acao']) => {
    switch (acao) {
      case 'CRIACAO':
        return {
          icon: PlusCircle,
          badge: 'Criação',
          color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
        };
      case 'EDICAO':
        return {
          icon: Edit3,
          badge: 'Edição',
          color: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900',
        };
      case 'STATUS':
        return {
          icon: Tag,
          badge: 'Mudança de Status',
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
        };
      case 'DOCUMENTO':
        return {
          icon: FileText,
          badge: 'Documento Anexado',
          color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900',
        };
      case 'CONSULTA':
        return {
          icon: History,
          badge: 'Consulta DataJud',
          color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-900',
        };
      default:
        return {
          icon: CheckCircle2,
          badge: 'Ação Registrada',
          color: 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
        };
    }
  };

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {title}
          </h4>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <Clock className="h-3 w-3" /> Imutável
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Nenhuma movimentação registrada recentemente neste item.
        </div>
      ) : (
        <div className="mt-4 relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {logs.map((log) => {
            const config = getActionConfig(log.acao);
            const Icon = config.icon;

            return (
              <div key={log.id} className="relative group text-xs">
                {/* Marcador na linha de tempo */}
                <div className="absolute -left-[1.35rem] top-1 h-3 w-3 rounded-full border-2 border-white bg-sky-500 dark:border-slate-900 shadow-xs" />

                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 dark:border-slate-800/60 dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${config.color}`}>
                      <Icon className="h-2.5 w-2.5" />
                      <span>{config.badge}</span>
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="font-semibold text-slate-900 dark:text-slate-100">
                    {log.descricao}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50">
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-slate-400" />
                      <span className="font-medium text-slate-700 dark:text-slate-300">{log.usuario}</span>
                      {log.cargo && (
                        <span className="text-[10px] text-slate-400 font-mono">({log.cargo})</span>
                      )}
                    </span>

                    {log.detalhes && (
                      <span className="text-[10px] text-slate-400 italic">
                        {log.detalhes}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AuditTrail;
