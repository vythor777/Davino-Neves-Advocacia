'use client';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/Skeleton';
import { useOfficeSettings } from '@/hooks/useOfficeSettings';
export default function ConfiguracoesPage() {
  return (
    <AuthGuard requireAdmin>
      <Settings />
    </AuthGuard>
  );
}
function Settings() {
  const state = useOfficeSettings();
  return (
    <div className="app-page">
      <PageHeader
        title="Configurações"
        description="Identificação do escritório e administração de acessos."
      />
      {state.loading ? (
        <Skeleton className="h-48 w-full" />
      ) : state.error ? (
        <p role="alert">{state.error}</p>
      ) : (
        <form
          className="legal-card max-w-2xl space-y-5 p-6"
          onSubmit={(e) => {
            e.preventDefault();
            void state.save();
          }}
        >
          <label className="block text-sm font-medium">
            Nome do escritório
            <input
              className="mt-2 block w-full rounded-lg border p-3 dark:bg-slate-900"
              required
              maxLength={100}
              value={state.name}
              onChange={(e) => state.setName(e.target.value)}
            />
          </label>
          <label className="block text-sm font-medium">
            E-mail de contato
            <input
              className="mt-2 block w-full rounded-lg border p-3 dark:bg-slate-900"
              type="email"
              maxLength={100}
              value={state.email}
              onChange={(e) => state.setEmail(e.target.value)}
            />
          </label>
          <button
            className="ui-button ui-button-primary"
            disabled={state.saving}
          >
            {state.saving ? 'Salvando…' : 'Salvar configurações'}
          </button>
        </form>
      )}
      <section className="legal-card max-w-2xl space-y-3 p-6">
        <h2 className="font-semibold">Cargos e permissões</h2>
        <p className="text-sm text-slate-500">
          Administrador gerencia o escritório. Advogado trabalha nos processos
          próprios e vinculados. Estagiário consulta processos liberados, envia
          documentos e atualiza contatos dos clientes.
        </p>
        <p className="text-sm text-slate-500">
          Atribua cargos na equipe e libere processos em Processos → Detalhes →
          Gerenciar acessos.
        </p>
        <Link className="ui-button ui-button-secondary" href="/usuarios">
          Gerenciar equipe
        </Link>
      </section>
    </div>
  );
}
