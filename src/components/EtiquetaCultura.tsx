import { StyleSheet, Text, View } from 'react-native';

import CulturaIcone from '@/components/CulturaIcone';

/** Etiqueta pequena com o ícone e o nome da cultura (ex: na lista de terrenos). */
export default function EtiquetaCultura({ nome }: { nome: string }) {
  return (
    <View style={styles.etiqueta}>
      <CulturaIcone cultura={nome} tamanho={14} />
      <Text style={styles.texto}>{nome}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  etiqueta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: '#f4edde',
  },

  texto: {
    color: '#2C473E',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
