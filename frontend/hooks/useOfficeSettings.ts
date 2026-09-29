'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import api from '@/services/api';
export function useOfficeSettings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    api
      .get('/configuracoes')
      .then(({ data }) => {
        if (active) {
          setName(data.nome_escritorio);
          setEmail(data.email_contato ?? '');
        }
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível carregar as configurações. Recarregue a página.',
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  async function save() {
    setSaving(true);
    try {
      await api.patch('/configuracoes', {
        nome_escritorio: name.trim(),
        email_contato: email.trim() || null,
      });
      toast.success('Configurações salvas');
      window.dispatchEvent(new Event('office-settings-changed'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Falha ao salvar');
    } finally {
      setSaving(false);
    }
  }
  return { name, setName, email, setEmail, loading, saving, error, save };
}
