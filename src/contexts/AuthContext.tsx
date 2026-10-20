import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { aoSessaoEncerrada } from '@/services/api';
import * as authService from '@/services/auth';
import { lerRefreshToken, lerUsuario } from '@/services/storage';
import type { UsuarioOutput } from '@/types/api';

type Status = 'carregando' | 'logado' | 'deslogado';

type AuthContextValor = {
  status: Status;
  usuario: UsuarioOutput | null;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('carregando');
  const [usuario, setUsuario] = useState<UsuarioOutput | null>(null);

  useEffect(() => {
    // Se a API recusar o refresh (sessão expirada, revogada), volta para o login.
    aoSessaoEncerrada(() => {
      setUsuario(null);
      setStatus('deslogado');
    });

    restaurarSessao().catch(() => setStatus('deslogado'));
  }, []);

  /**
   * Abre o app já logado se houver sessão salva no aparelho. Entra na hora com
   * o perfil em cache — sem esperar a rede, e funcionando offline — e confirma
   * com a API em segundo plano. Só um 401 de verdade derruba a sessão.
   */
  async function restaurarSessao() {
    const [refreshToken, usuarioSalvo] = await Promise.all([
      lerRefreshToken(),
      lerUsuario(),
    ]);

    if (!refreshToken || !usuarioSalvo) {
      setStatus('deslogado');
      return;
    }

    setUsuario(usuarioSalvo);
    setStatus('logado');

    // /auth/me força o refresh (não há access token em memória ainda) e
    // atualiza o nome em cache. Erro de rede é ignorado: segue offline.
    authService
      .buscarPerfil()
      .then(setUsuario)
      .catch(() => {});
  }

  async function entrar(email: string, senha: string) {
    setUsuario(await authService.login(email, senha));
    setStatus('logado');
  }

  async function cadastrar(nome: string, email: string, senha: string) {
    setUsuario(await authService.registrar(nome, email, senha));
    setStatus('logado');
  }

  async function sair() {
    await authService.logout();
    setUsuario(null);
    setStatus('deslogado');
  }

  return (
    <AuthContext.Provider value={{ status, usuario, entrar, cadastrar, sair }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return contexto;
}
