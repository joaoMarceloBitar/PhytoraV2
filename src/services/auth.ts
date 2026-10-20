import type { AuthOutput, UsuarioOutput } from '@/types/api';

import { definirAccessToken, requisicao } from './api';
import {
  lerRefreshToken,
  limparSessao,
  obterDeviceId,
  salvarRefreshToken,
  salvarUsuario,
} from './storage';

async function guardarSessao(resultado: AuthOutput): Promise<UsuarioOutput> {
  definirAccessToken(resultado.access_token);
  await salvarRefreshToken(resultado.refresh_token);
  await salvarUsuario(resultado.usuario);
  return resultado.usuario;
}

export async function registrar(
  nome: string,
  email: string,
  senha: string,
): Promise<UsuarioOutput> {
  const resultado = await requisicao<AuthOutput>('/auth/registrar', {
    method: 'POST',
    body: { nome, email, senha, device_id: await obterDeviceId() },
  });
  return guardarSessao(resultado);
}

export async function login(email: string, senha: string): Promise<UsuarioOutput> {
  const resultado = await requisicao<AuthOutput>('/auth/login', {
    method: 'POST',
    body: { email, senha, device_id: await obterDeviceId() },
  });
  return guardarSessao(resultado);
}

/**
 * Encerra a sessão no servidor e apaga a local. Se o servidor não responder
 * (sem rede), desloga do mesmo jeito: a sessão órfã expira sozinha lá.
 */
export async function logout(): Promise<void> {
  const refreshToken = await lerRefreshToken();
  definirAccessToken(null);
  await limparSessao();

  if (refreshToken) {
    await requisicao('/auth/logout', {
      method: 'POST',
      body: { refresh_token: refreshToken },
    }).catch(() => {});
  }
}

export async function buscarPerfil(): Promise<UsuarioOutput> {
  const usuario = await requisicao<UsuarioOutput>('/auth/me', { autenticado: true });
  await salvarUsuario(usuario);
  return usuario;
}
