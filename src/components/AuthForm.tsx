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

type AuthFormProps = {
  title: string;
  subtitle: string;
  /** Erro geral do formulário (credenciais, rede...). */
  erro?: string;
  children: ReactNode;
  /** Botões, exibidos abaixo do erro geral. */
  actions: ReactNode;
};

/** Moldura comum das telas de login e cadastro. */
export default function AuthForm({ title, subtitle, erro, children, actions }: AuthFormProps) {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

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
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
    gap: 32,
  },

  header: {
    gap: 8,
  },

  title: {
    color: COLORS.textLight,
    fontSize: 32,
    fontWeight: '800',
  },

  subtitle: {
    color: COLORS.textLight,
    fontSize: 16,
    opacity: 0.8,
  },

  fields: {
    gap: 16,
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
