import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { COLORS } from '@/constants/colors';

type TextFieldProps = TextInputProps & {
  label: string;
  /** Mensagem de erro do campo (ex: vinda dos `detalhes` da API). */
  erro?: string;
};

export default function TextField({ label, erro, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        placeholderTextColor="rgba(217, 217, 217, 0.5)"
        style={[styles.input, erro && styles.inputComErro, style]}
        {...props}
      />

      {erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },

  label: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
  },

  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.textLight,
    color: COLORS.white,
    fontSize: 16,
  },

  inputComErro: {
    borderColor: COLORS.error,
  },

  erro: {
    color: COLORS.error,
    fontSize: 13,
  },
});
