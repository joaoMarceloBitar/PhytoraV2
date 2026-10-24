import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { criarEstilos, useTema } from '../TemaProvider';
import Texto from './Texto';

type ChipProps = {
  rotulo: string;
  selecionado?: boolean;
  onPress: () => void;
  /** Bolinha de cor antes do rótulo (ex: a cor da doença). */
  corIndicador?: string;
  /** Indicador vazado, para categorias "sem doença" (folha saudável). */
  indicadorVazado?: boolean;
  /** Sombra, para chips que flutuam sobre o mapa. */
  flutuante?: boolean;
};

const useEstilos = criarEstilos((t) => ({
  chip: {
    minHeight: 36,
    borderRadius: t.raio.pilula,
    paddingHorizontal: t.espaco.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.espaco.xs + 2,
    backgroundColor: t.cores.superficie,
    borderWidth: 1,
    borderColor: t.cores.borda,
  },
  flutuante: { borderWidth: 0, ...t.sombra.baixa },
  selecionado: { backgroundColor: t.cores.primaria, borderColor: t.cores.primaria },
  indicador: { width: 12, height: 12, borderRadius: 6 },
  vazado: { borderWidth: 2, backgroundColor: 'transparent' },
}));

/** Filtro ou opção que liga e desliga. Memoizado: filas de chips não redesenham à toa. */
function Chip({ rotulo, selecionado = false, onPress, corIndicador, indicadorVazado, flutuante }: ChipProps) {
  const tema = useTema();
  const estilos = useEstilos();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado }}
      onPress={onPress}
      hitSlop={4}
      style={[estilos.chip, flutuante && estilos.flutuante, selecionado && estilos.selecionado]}
    >
      {corIndicador ? (
        <View
          style={[
            estilos.indicador,
            indicadorVazado
              ? [estilos.vazado, { borderColor: selecionado ? tema.cores.textoSobrePrimaria : corIndicador }]
              : { backgroundColor: corIndicador },
          ]}
        />
      ) : null}
      <Texto variante="rotulo" cor={selecionado ? 'sobrePrimaria' : 'texto'}>
        {rotulo}
      </Texto>
    </Pressable>
  );
}

export default memo(Chip);
