import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

import type { UsuarioOutput } from '@/types/api';

// Tudo aqui fica no SecureStore (cifrado pelo Android Keystore) e é apagado
// quando o app é desinstalado. O access token NÃO é guardado: vive só em
// memória, e um novo é obtido pelo refresh token quando o app abre.
const CHAVES = {
  refreshToken: 'phytora.refresh_token',
  usuario: 'phytora.usuario',
  deviceId: 'phytora.device_id',
} as const;

export async function lerRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(CHAVES.refreshToken);
}

export async function salvarRefreshToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(CHAVES.refreshToken, token);
}

/** Cópia local do perfil — permite abrir o app logado mesmo sem internet. */
export async function lerUsuario(): Promise<UsuarioOutput | null> {
  const json = await SecureStore.getItemAsync(CHAVES.usuario);
  if (!json) return null;
  try {
    return JSON.parse(json) as UsuarioOutput;
  } catch {
    return null;
  }
}

export async function salvarUsuario(usuario: UsuarioOutput): Promise<void> {
  await SecureStore.setItemAsync(CHAVES.usuario, JSON.stringify(usuario));
}

/** Apaga a sessão local. O device_id fica: ele identifica o aparelho, não a conta. */
export async function limparSessao(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(CHAVES.refreshToken),
    SecureStore.deleteItemAsync(CHAVES.usuario),
  ]);
}

/**
 * Identificador do aparelho, gerado na primeira abertura. A API usa para
 * manter uma sessão por dispositivo (login de novo substitui a anterior).
 */
export async function obterDeviceId(): Promise<string> {
  const existente = await SecureStore.getItemAsync(CHAVES.deviceId);
  if (existente) return existente;

  const novo = Crypto.randomUUID();
  await SecureStore.setItemAsync(CHAVES.deviceId, novo);
  return novo;
}
