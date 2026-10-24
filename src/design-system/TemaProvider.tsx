import { createContext, ReactNode, useContext } from 'react';
import { StyleSheet } from 'react-native';

import { temaPadrao, type Tema } from './tema';

const TemaContext = createContext<Tema>(temaPadrao);

/**
 * Entrega o tema a todos os componentes. Trocar o visual do app (ou ter um
 * modo escuro) é passar outro `tema` aqui.
 */
export function TemaProvider({ tema = temaPadrao, children }: { tema?: Tema; children: ReactNode }) {
  return <TemaContext.Provider value={tema}>{children}</TemaContext.Provider>;
}

export function useTema(): Tema {
  return useContext(TemaContext);
}

/**
 * Cria um hook de estilos a partir do tema. Os estilos são montados uma vez
 * por tema (e não a cada render), o que mantém o custo igual ao de um
 * `StyleSheet.create` comum.
 *
 *   const useEstilos = criarEstilos((t) => ({ caixa: { padding: t.espaco.lg } }));
 *   function Tela() { const s = useEstilos(); ... }
 */
export function criarEstilos<T extends StyleSheet.NamedStyles<T>>(fabrica: (tema: Tema) => T) {
  const cache = new WeakMap<Tema, T>();
  return function useEstilos(): T {
    const tema = useTema();
    let estilos = cache.get(tema);
    if (!estilos) {
      estilos = StyleSheet.create(fabrica(tema));
      cache.set(tema, estilos);
    }
    return estilos;
  };
}
