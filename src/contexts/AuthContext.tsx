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
  cadastrar: (nome: string, email: string, senha: string, modoAnonimo: boolean) => Promise<void>;
  atualizarModoAnonimo: (modoAnonimo: boolean) => Promise<void>;
  sair: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('carregando');
  const [usuario, setUsuario] = useState<UsuarioOutput | null>(null);

  useEffect(() => {
    aoSessaoEncerrada(() => {
      setUsuario(null);
      setStatus('deslogado');
    });

    restaurarSessao().catch(() => setStatus('deslogado'));
  }, []);

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
    authService
      .buscarPerfil()
      .then(setUsuario)
      .catch(() => {});
  }

  async function entrar(email: string, senha: string) {
    setUsuario(await authService.login(email, senha));
    setStatus('logado');
  }

  async function cadastrar(nome: string, email: string, senha: string, modoAnonimo: boolean) {
    setUsuario(await authService.registrar(nome, email, senha, modoAnonimo));
    setStatus('logado');
  }

  async function atualizarModoAnonimo(modoAnonimo: boolean) {
    setUsuario(await authService.atualizarModoAnonimo(modoAnonimo));
  }

  async function sair() {
    await authService.logout();
    setUsuario(null);
    setStatus('deslogado');
  }

  return (
    <AuthContext.Provider value={{ status, usuario, entrar, cadastrar, atualizarModoAnonimo, sair }}>
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
