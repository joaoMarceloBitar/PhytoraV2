import { API_URL } from '@/config/api';
import type { ErroOutput, RefreshOutput } from '@/types/api';

import { lerRefreshToken, limparSessao, salvarRefreshToken } from './storage';

/** Erro devolvido pela API (tem status HTTP). */
export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    public readonly detalhes?: ErroOutput['detalhes'],
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

/** A requisição nem chegou na API (sem internet, servidor fora do ar). */
export class ErroRede extends Error {
  constructor() {
    super('Não foi possível conectar ao servidor. Verifique sua internet.');
    this.name = 'ErroRede';
  }
}

// --- Estado da sessão em memória ------------------------------------------

let accessToken: string | null = null;
let refreshEmAndamento: Promise<void> | null = null;
let aoEncerrarSessao: (() => void) | null = null;

export function definirAccessToken(token: string | null): void {
  accessToken = token;
}

/** O AuthContext se registra aqui para saber quando a API derrubou a sessão. */
export function aoSessaoEncerrada(callback: () => void): void {
  aoEncerrarSessao = callback;
}

// --- Requisições -----------------------------------------------------------

type Opcoes = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Envia o access token e renova a sessão se ele tiver expirado. */
  autenticado?: boolean;
};

async function executar(caminho: string, opcoes: Opcoes): Promise<Response> {
  const headers: Record<string, string> = {};
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opcoes.autenticado && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  try {
    return await fetch(`${API_URL}${caminho}`, {
      method: opcoes.method ?? 'GET',
      headers,
      body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
    });
  } catch {
    throw new ErroRede();
  }
}

async function lerResposta<T>(resposta: Response): Promise<T> {
  if (resposta.status === 204) return undefined as T;

  const dados = await resposta.json().catch(() => null);

  if (!resposta.ok) {
    const erro = dados as ErroOutput | null;
    throw new ErroApi(
      resposta.status,
      erro?.error ?? `Erro inesperado (HTTP ${resposta.status}).`,
      erro?.detalhes,
    );
  }

  return dados as T;
}

export async function requisicao<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  if (opcoes.autenticado && !accessToken) {
    await renovarSessao();
  }

  let resposta = await executar(caminho, opcoes);

  // Access token expirado: renova uma vez e repete a requisição.
  if (resposta.status === 401 && opcoes.autenticado) {
    await renovarSessao();
    resposta = await executar(caminho, opcoes);
  }

  return lerResposta<T>(resposta);
}

/**
 * Troca o refresh token salvo por um par novo. Se várias requisições
 * receberem 401 ao mesmo tempo, todas esperam o MESMO refresh — dois refreshes
 * com o mesmo token fariam a API achar que ele foi roubado e derrubar a sessão.
 */
export function renovarSessao(): Promise<void> {
  refreshEmAndamento ??= (async () => {
    try {
      const refreshToken = await lerRefreshToken();
      if (!refreshToken) {
        throw new ErroApi(401, 'Sessão encerrada. Faça login novamente.');
      }

      const resposta = await executar('/auth/refresh', {
        method: 'POST',
        body: { refresh_token: refreshToken },
      });
      const tokens = await lerResposta<RefreshOutput>(resposta);

      await salvarRefreshToken(tokens.refresh_token);
      accessToken = tokens.access_token;
    } catch (erro) {
      // Sem rede, a sessão local continua valendo (o app funciona offline).
      // Só um 401 de verdade significa que a sessão acabou.
      if (erro instanceof ErroApi && erro.status === 401) {
        accessToken = null;
        await limparSessao();
        aoEncerrarSessao?.();
      }
      throw erro;
    } finally {
      refreshEmAndamento = null;
    }
  })();

  return refreshEmAndamento;
}
