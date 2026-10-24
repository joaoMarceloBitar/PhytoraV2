import * as Location from 'expo-location';
import { useCallback, useRef, useState } from 'react';
import { Linking } from 'react-native';

import type { Localizacao } from '@/types/api';

// O GPS pode levar alguns segundos para o primeiro sinal, e o expo-location
// não tem opção de timeout: sem este limite a tela ficaria esperando para sempre.
const LIMITE_MS = 15_000;

export type PosicaoGps = Localizacao & {
  /** Raio de incerteza em metros, quando o aparelho informa. */
  precisao: number | null;
};

export type EstadoLocalizacao =
  | { tipo: 'inicial' }
  | { tipo: 'obtendo' }
  | { tipo: 'pronta'; posicao: PosicaoGps }
  /** `podePedirDeNovo` falso: o Android não mostra mais o pedido, só as configurações resolvem. */
  | { tipo: 'negada'; podePedirDeNovo: boolean }
  | { tipo: 'desligada' }
  | { tipo: 'erro'; mensagem: string };

/**
 * Pede a permissão e lê a posição atual do aparelho, com a precisão.
 * Cada chamada de `obter` substitui a anterior.
 */
export function useLocalizacao() {
  const [estado, setEstado] = useState<EstadoLocalizacao>({ tipo: 'inicial' });
  // Uma leitura que estourou o limite pode chegar depois; só a última vale.
  const leituraAtual = useRef(0);

  const obter = useCallback(async () => {
    const leitura = ++leituraAtual.current;
    const atualizar = (novo: EstadoLocalizacao) => {
      if (leitura === leituraAtual.current) setEstado(novo);
    };

    atualizar({ tipo: 'obtendo' });

    try {
      const permissao = await Location.requestForegroundPermissionsAsync();
      if (!permissao.granted) {
        atualizar({ tipo: 'negada', podePedirDeNovo: permissao.canAskAgain });
        return;
      }

      if (!(await Location.hasServicesEnabledAsync())) {
        atualizar({ tipo: 'desligada' });
        return;
      }

      const limite = new Promise<never>((_, rejeitar) =>
        setTimeout(() => rejeitar(new Error('limite')), LIMITE_MS),
      );
      const { coords } = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
        limite,
      ]);

      atualizar({
        tipo: 'pronta',
        posicao: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          precisao: coords.accuracy,
        },
      });
    } catch (erro) {
      atualizar({
        tipo: 'erro',
        mensagem:
          (erro as Error).message === 'limite'
            ? 'O GPS não respondeu em 15 segundos. Vá para um lugar aberto e tente de novo.'
            : 'Não foi possível obter a localização. Tente de novo.',
      });
    }
  }, []);

  /** Volta ao estado inicial, descartando uma leitura em andamento. */
  const descartar = useCallback(() => {
    leituraAtual.current++;
    setEstado({ tipo: 'inicial' });
  }, []);

  return { estado, obter, descartar, abrirConfiguracoes: () => Linking.openSettings() };
}
