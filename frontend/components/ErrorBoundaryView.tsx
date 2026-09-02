'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ServerCrash,
  WifiOff,
  Lock,
} from 'lucide-react';

export interface ErrorBoundaryViewProps {
  /** Ação disparada ao clicar em 'Tentar Novamente' */
  onRetry?: () => void;
  /** Título principal da mensagem de erro (padrão: 'Não foi possível conectar ao tribunal') */
  title?: string;
  /** Descrição amigável complementar */
  description?: string;
  /** Código de status HTTP (ex: 401, 403, 500, 502, 504) */
  statusCode?: number | string;
  /** Mensagem técnica detalhada do erro (opcional, exibível sob demanda) */
  errorDetails?: string;
  /** Rótulo do botão de repetição (padrão: 'Tentar Novamente') */
  retryLabel?: string;
  /** Indica se a ação de retry está em andamento (loading) */
  isRetrying?: boolean;
  /** Classes CSS adicionais para o container externo */
  className?: string;
}

/**
 * Utilitário para selecionar o ícone mais adequado conforme o código de erro
 */
function getErrorIcon(statusCode?: number | string) {
  const code = Number(statusCode);
  if (code === 401 || code === 403) {
    return <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
  }
  if (code >= 500) {
    return <ServerCrash className="h-6 w-6 text-rose-600 dark:text-rose-400" aria-hidden="true" />;
  }
  return <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />;
}

/**
 * Utilitário para gerar sugestões amigáveis de acordo com a falha
 */
function getErrorMessageHelper(statusCode?: number | string): string {
  const code = Number(statusCode);
  if (code === 401 || code === 403) {
    return 'Houve uma recusa de autorização ou autenticação com a API pública do DataJud. Verifique suas credenciais de acesso ou tente novamente em instantes.';
  }
  if (code >= 500) {
    return 'Os servidores do tribunal ou do Conselho Nacional de Justiça estão temporariamente instáveis ou sobrecarregados.';
  }
  return 'A requisição aos serviços do tribunal não pôde ser completada. Pode haver instabilidade temporária na rede judiciária.';
}

/**
 * Componente ErrorBoundaryView
 *
 * Exibido quando a API do DataJud falhar (HTTP 401, 500, timeout ou erro de rede).
 * Apresenta:
 * - Ícone de aviso contextualizado
 * - Mensagem amigável com contraste WCAG
 * - Botão institucional 'Tentar Novamente' com estados hover, focus-visible e active
 * - Detalhes técnicos recolhíveis para auditoria do suporte jurídico
 */
export function ErrorBoundaryView({
  onRetry,
  title = 'Não foi possível conectar ao tribunal',
  description,
  statusCode,
  errorDetails,
  retryLabel = 'Tentar Novamente',
  isRetrying = false,
  className = '',
}: ErrorBoundaryViewProps) {
  const [showDetails, setShowDetails] = useState(false);

  const helperText = description || getErrorMessageHelper(statusCode);
  const isServerOrAuth = Number(statusCode) >= 500 || Number(statusCode) === 401 || Number(statusCode) === 403;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        {/* Ícone de Aviso com Moldura Neutra Calibrada */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/60 dark:border-amber-900/40 shadow-2xs">
          {getErrorIcon(statusCode)}
        </div>

        {/* Conteúdo Informativo */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {title}
            </h3>

            {statusCode && (
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                HTTP {statusCode}
              </span>
            )}
          </div>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
            {helperText}
          </p>

          {/* Dica operacional para o advogado */}
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
            <span className="font-semibold text-slate-700 dark:text-slate-200 shrink-0">
              Orientação:
            </span>
            <span>
              Verifique sua conexão ou aguarde alguns segundos antes de reenviar a consulta ao CNJ.
            </span>
          </div>

          {/* Bloco de Detalhes Técnicos (Opcional, Recolhível) */}
          {errorDetails && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowDetails((prev) => !prev)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 focus-visible:outline-hidden focus-visible:underline transition-colors"
                aria-expanded={showDetails}
              >
                <span>{showDetails ? 'Ocultar detalhes técnicos' : 'Exibir detalhes técnicos'}</span>
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showDetails && (
                <pre className="mt-2.5 overflow-x-auto rounded-xl bg-slate-900 p-3.5 font-mono text-[11px] text-slate-200 dark:bg-slate-950 border border-slate-800 leading-normal">
                  <code>{errorDetails}</code>
                </pre>
              )}
            </div>
          )}

          {/* Botão 'Tentar Novamente' */}
          {onRetry && (
            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={onRetry}
                disabled={isRetrying}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0047ab] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#003785] dark:bg-blue-600 dark:hover:bg-blue-500 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0047ab] focus-visible:ring-offset-2 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Tentar novamente a conexão com o tribunal"
              >
                <RotateCcw
                  className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>{isRetrying ? 'Conectando...' : retryLabel}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundaryView;
