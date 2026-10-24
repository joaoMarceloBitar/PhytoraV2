import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { COLORS } from '@/constants/colors';

type TelaFormularioProps = {
  /** Erro geral do formulário (conflito, rede...). */
  erro?: string;
  children: ReactNode;
  /** Botões, exibidos abaixo do erro geral. */
  actions: ReactNode;
};

/**
 * Moldura das telas de formulário que abrem sob o cabeçalho da pilha
 * (terreno, cultura). O título fica no cabeçalho.
 */
export default function TelaFormulario({ erro, children, actions }: TelaFormularioProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.fields}>{children}</View>

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <View style={styles.actions}>{actions}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
  },

  fields: {
    gap: 20,
  },

  erro: {
    color: COLORS.error,
    fontSize: 14,
    textAlign: 'center',
  },

  actions: {
    gap: 8,
  },
});
