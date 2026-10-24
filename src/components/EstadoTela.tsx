import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import { COLORS } from '@/constants/colors';

/** Tela inteira carregando. */
export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" color={COLORS.textLight} />
    </View>
  );
}

/** Tela inteira com erro e o botão de tentar de novo. */
export function ErroComRetentativa({
  mensagem,
  onTentarDeNovo,
}: {
  mensagem: string;
  onTentarDeNovo: () => void;
}) {
  return (
    <View style={styles.centro}>
      <Text style={styles.mensagem}>{mensagem}</Text>
      <Button title="Tentar de novo" variant="ghost" onPress={onTentarDeNovo} />
    </View>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 32,
    backgroundColor: COLORS.background,
  },

  mensagem: {
    color: COLORS.textLight,
    fontSize: 16,
    textAlign: 'center',
  },
});
