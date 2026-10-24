import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { errosDoFormulario } from '@/utils/erros';

/**
 * Busca os dados da tela sempre que ela ganha foco, para refletir o que foi
 * alterado nas telas abertas por cima (ex: voltar do cadastro para a lista).
 *
 * `carregando`: primeira carga, sem nada para mostrar ainda.
 * `atualizando`: "puxar para atualizar", com os dados antigos na tela.
 */
export function useDadosDaTela<T>(buscar: () => Promise<T>) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  // A função muda a cada render; o efeito de foco usa sempre a mais recente.
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  const carregar = useCallback(async () => {
    try {
      setDados(await buscarRef.current());
      setErro(null);
    } catch (e) {
      setErro(errosDoFormulario(e).geral ?? 'Não foi possível carregar.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const atualizar = useCallback(async () => {
    setAtualizando(true);
    await carregar();
    setAtualizando(false);
  }, [carregar]);

  const tentarDeNovo = useCallback(() => {
    setErro(null);
    carregar();
  }, [carregar]);

  return {
    dados,
    // Erro com dados antigos na tela não esconde a tela: só aparece sem dados.
    erro: dados === null ? erro : null,
    carregando: dados === null && erro === null,
    atualizando,
    atualizar,
    tentarDeNovo,
  };
}
