import { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, Text, View } from 'react-native';

import Button from '@/components/Button';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { errosDoFormulario } from '@/utils/erros';

export default function PerfilScreen() {
  const { usuario, sair, atualizarModoAnonimo } = useAuth();
  const [saindo, setSaindo] = useState(false);
  const [salvandoModo, setSalvandoModo] = useState(false);

  async function confirmarSaida() {
    setSaindo(true);
    // Ao deslogar, o guard do layout tira o usuário das abas sozinho.
    await sair();
  }

  async function salvarModo(modoAnonimo: boolean) {
    setSalvandoModo(true);
    try {
      await atualizarModoAnonimo(modoAnonimo);
    } catch (e) {
      Alert.alert('Não foi possível salvar', errosDoFormulario(e).geral ?? 'Tente de novo.');
    } finally {
      setSalvandoModo(false);
    }
  }

  function mudarModo(modoAnonimo: boolean) {
    // Proteger mais não precisa de confirmação; expor sim.
    if (modoAnonimo) {
      salvarModo(true);
      return;
    }
    Alert.alert(
      'Mostrar o ponto exato?',
      'Todos os seus diagnósticos, inclusive os antigos, vão passar a mostrar o ponto exato para outras pessoas. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Mostrar ponto exato', style: 'destructive', onPress: () => salvarModo(false) },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.dados}>
        <Text style={styles.label}>Nome</Text>
        <Text style={styles.valor}>{usuario?.nome}</Text>
      </View>
      <View style={styles.dados}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.valor}>{usuario?.email}</Text>
      </View>

      <View style={styles.bloco}>
        <View style={styles.linhaChave}>
          <Text style={styles.tituloChave}>Mostrar só o município</Text>
          {salvandoModo ? (
            <ActivityIndicator color={COLORS.textLight} />
          ) : (
            <Switch
              value={usuario?.modo_anonimo ?? true}
              onValueChange={mudarModo}
              trackColor={{ false: COLORS.border, true: COLORS.textLight }}
              thumbColor={COLORS.white}
            />
          )}
        </View>
        <Text style={styles.explicacao}>
          {usuario?.modo_anonimo ?? true
            ? 'Outras pessoas veem só o município dos seus diagnósticos. O ponto exato é usado apenas para calcular os alertas de vizinhos.'
            : 'Outras pessoas veem o ponto exato dos seus diagnósticos, o que pode revelar onde fica sua lavoura.'}{' '}
          A mudança vale para todos os seus diagnósticos, inclusive os já feitos.
        </Text>
      </View>

      <Button title="Sair" variant="ghost" onPress={confirmarSaida} loading={saindo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 20,
  },

  dados: {
    gap: 4,
  },

  label: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '600',
  },

  valor: {
    color: COLORS.white,
    fontSize: 18,
  },

  bloco: {
    gap: 8,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  linhaChave: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  tituloChave: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },

  explicacao: {
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
});
