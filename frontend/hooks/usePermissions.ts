'use client';
import { useAuth } from '@/context/AuthContext';
import { permissionsFor } from '@/utils/permissions';
export function usePermissions() {
  const { user } = useAuth();
  return permissionsFor(user);
}
