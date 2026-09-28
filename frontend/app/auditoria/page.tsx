'use client';
import AuthGuard from '@/components/AuthGuard';
import { PageHeader } from '@/components/ui/PageHeader';
import { RemoteAuditTrail } from '@/components/RemoteAuditTrail';
export default function AuditoriaPage() {
  return (
    <AuthGuard requireAdmin>
      <div className="app-page">
        <PageHeader
          title="Auditoria"
          description="Últimas 100 alterações registradas, com autor, cargo e data."
        />
        <RemoteAuditTrail />
      </div>
    </AuthGuard>
  );
}
