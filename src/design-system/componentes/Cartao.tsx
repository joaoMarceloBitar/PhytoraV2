import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { criarEstilos } from '../TemaProvider';

type CartaoProps = {
  children: ReactNode;
  /** `suave`: fundo levemente tingido, para blocos de informação dentro de uma folha. */
  variante?: 'superficie' | 'suave';
  elevado?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

const useEstilos = criarEstilos((t) => ({
  base: {
    borderRadius: t.raio.lg,
    padding: t.espaco.lg,
    gap: t.espaco.sm,
  },
  superficie: { backgroundColor: t.cores.superficie },
  suave: { backgroundColor: t.cores.superficieSuave },
  elevado: { ...t.sombra.media },
  pressionado: { opacity: 0.9 },
}));

export default function Cartao({ children, variante = 'superficie', elevado, onPress, accessibilityLabel, style }: CartaoProps) {
  const estilos = useEstilos();
  const visual = [estilos.base, estilos[variante], elevado && estilos.elevado, style];

  if (!onPress) return <View style={visual}>{children}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [visual, pressed && estilos.pressionado]}
    >
      {children}
    </Pressable>
  );
}
