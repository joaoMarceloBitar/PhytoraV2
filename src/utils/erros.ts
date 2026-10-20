import { ErroApi, ErroRede } from '@/services/api';

export type ErrosDoFormulario = {
  /** Mensagem geral, exibida acima do botão. */
  geral?: string;
  /** Mensagem por campo, vinda dos `detalhes` de um 400 da API. */
  campos: Record<string, string>;
};

/** Converte qualquer erro de uma chamada à API em mensagens para a tela. */
export function errosDoFormulario(erro: unknown): ErrosDoFormulario {
  if (erro instanceof ErroApi) {
    const campos: Record<string, string> = {};
    for (const detalhe of erro.detalhes ?? []) {
      campos[detalhe.campo] ??= detalhe.mensagem;
    }
    // Com erros por campo, eles já explicam; a mensagem geral seria redundante.
    return { geral: erro.detalhes?.length ? undefined : erro.message, campos };
  }

  if (erro instanceof ErroRede) {
    return { geral: erro.message, campos: {} };
  }

  return { geral: 'Algo deu errado. Tente novamente.', campos: {} };
}
