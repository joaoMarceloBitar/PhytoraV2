import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { criarEstilos, useTema } from '../TemaProvider';
import Texto from './Texto';

type BotaoProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'texto';
  tamanho?: 'medio' | 'compacto';
  icone?: ReactNode;
  carregando?: boolean;
  desabilitado?: boolean;
  style?: StyleProp<ViewStyle>;
};

const useEstilos = criarEstilos((t) => ({
  base: {
    minHeight: t.alvoToque + 4,
    borderRadius: t.raio.pilula,
    paddingHorizontal: t.espaco.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.espaco.sm,
  },
  compacto: { minHeight: t.alvoToque, paddingHorizontal: t.espaco.lg },
  primario: { backgroundColor: t.cores.primaria },
  secundario: { backgroundColor: 'transparent', borderWidth: 2, borderColor: t.cores.primaria },
  texto: { backgroundColor: 'transparent' },
  pressionado: { opacity: 0.85 },
  inativo: { opacity: 0.5 },
}));

export default function Botao({
  titulo,
  onPress,
  variante = 'primario',
  tamanho = 'medio',
  icone,
  carregando = false,
  desabilitado = false,
  style,
}: BotaoProps) {
  const tema = useTema();
  const estilos = useEstilos();
  const corTexto = variante === 'primario' ? tema.cores.textoSobrePrimaria : tema.cores.primaria;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: desabilitado || carregando, busy: carregando }}
      onPress={onPress}
      disabled={desabilitado || carregando}
      style={({ pressed }) => [
        estilos.base,
        tamanho === 'compacto' && estilos.compacto,
        estilos[variante],
        pressed && estilos.pressionado,
        (desabilitado || carregando) && estilos.inativo,
        style,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <>
          {icone ? <View>{icone}</View> : null}
          <Texto variante="corpoForte" corPersonalizada={corTexto}>
            {titulo}
          </Texto>
        </>
      )}
    </Pressable>
  );
}
