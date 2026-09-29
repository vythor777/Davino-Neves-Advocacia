'use client';
import { useEffect, useState } from 'react';
import api from '@/services/api';
export function useOfficeIdentity(authenticated: boolean) {
  const [name, setName] = useState('Davino Neves Advocacia');
  useEffect(() => {
    if (!authenticated) return;
    let active = true;
    const load = () => {
      api
        .get('/configuracoes')
        .then(({ data }) => {
          if (active) setName(data.nome_escritorio);
        })
        .catch(() => {});
    };
    load();
    window.addEventListener('office-settings-changed', load);
    return () => {
      active = false;
      window.removeEventListener('office-settings-changed', load);
    };
  }, [authenticated]);
  return name;
}
