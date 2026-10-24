import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { criarEstilos } from '../TemaProvider';

type FolhaProps = {
  /** Alturas visíveis em px, da menor para a maior (até 3, como o sheet nativo). */
  alturas: number[];
  indice: number;
  onMudarIndice: (indice: number) => void;
  /** Parte fixa do topo (alça + título), que também serve para arrastar. */
  cabecalho?: ReactNode;
  children: ReactNode;
};

const MOLA = { damping: 22, stiffness: 220, mass: 0.8 };

// Quanto da velocidade do dedo entra na escolha da parada: um gesto rápido
// para cima abre mais, mesmo que o dedo tenha andado pouco.
const PESO_DA_VELOCIDADE = 0.12;

const ALTURA_DA_ALCA = 20;

const useEstilos = criarEstilos((t) => ({
  folha: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: t.cores.superficie,
    borderTopLeftRadius: t.raio.xl,
    borderTopRightRadius: t.raio.xl,
    ...t.sombra.alta,
  },
  alcaArea: {
    height: ALTURA_DA_ALCA,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alca: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: t.cores.borda,
  },
}));

/**
 * Folha que sobe da parte de baixo da tela, com até 3 alturas. Arrasta-se
 * pela alça e pelo cabeçalho; o conteúdo rola por conta própria. A animação e
 * o gesto rodam na thread de interface (Reanimated), sem passar pelo JS a
 * cada quadro.
 */
export default function Folha({ alturas, indice, onMudarIndice, cabecalho, children }: FolhaProps) {
  const estilos = useEstilos();
  const alturaMaxima = alturas[alturas.length - 1]!;
  // Deslocamento vertical de cada parada: 0 = totalmente aberta.
  const paradas = alturas.map((a) => alturaMaxima - a);

  const deslocamento = useSharedValue(paradas[indice]!);
  const inicio = useSharedValue(0);

  useEffect(() => {
    deslocamento.value = withSpring(paradas[indice]!, MOLA);
    // `paradas` muda junto com `alturas`; comparar o conteúdo evita reanimar à toa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indice, alturas.join(',')]);

  const arrastar = Gesture.Pan()
    .onStart(() => {
      inicio.value = deslocamento.value;
    })
    .onUpdate((e) => {
      const maximo = paradas[0]!;
      deslocamento.value = Math.min(maximo, Math.max(0, inicio.value + e.translationY));
    })
    .onEnd((e) => {
      const alvo = deslocamento.value + e.velocityY * PESO_DA_VELOCIDADE;
      let maisPerto = 0;
      for (let i = 1; i < paradas.length; i++) {
        if (Math.abs(paradas[i]! - alvo) < Math.abs(paradas[maisPerto]! - alvo)) maisPerto = i;
      }
      deslocamento.value = withSpring(paradas[maisPerto]!, MOLA);
      scheduleOnRN(onMudarIndice, maisPerto);
    });

  const estiloAnimado = useAnimatedStyle(() => ({
    transform: [{ translateY: deslocamento.value }],
  }));

  return (
    <Animated.View style={[estilos.folha, { height: alturaMaxima }, estiloAnimado]}>
      <GestureDetector gesture={arrastar}>
        <View accessibilityRole="adjustable" accessibilityLabel="Arraste para abrir ou fechar">
          <View style={estilos.alcaArea}>
            <View style={estilos.alca} />
          </View>
          {cabecalho}
        </View>
      </GestureDetector>
      {/* O conteúdo ocupa só a parte visível, para a lista rolar até o fim. */}
      <View style={{ height: Math.max(0, alturas[indice]! - ALTURA_DA_ALCA) }}>{children}</View>
    </Animated.View>
  );
}
