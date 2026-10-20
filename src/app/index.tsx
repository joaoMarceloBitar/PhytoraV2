import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

// Ponto de entrada e de retorno: o router volta para cá quando um guard muda.
export default function Index() {
  const { status } = useAuth();

  if (status === 'carregando') return <Redirect href="/splash" />;
  if (status === 'logado') return <Redirect href="/home" />;
  return <Redirect href="/welcome" />;
}
