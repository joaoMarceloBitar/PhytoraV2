import { Pressable, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/colors';

type EscolhaPrivacidadeProps = {
  /** `null` enquanto a pessoa não escolheu: nada vem marcado. */
  modoAnonimo: boolean | null;
  onEscolher: (modoAnonimo: boolean) => void;
  erro?: string;
};

/**
 * Aviso sobre a exposição dos diagnósticos no mapa e a escolha do modo da
 * conta. A escolha é obrigatória e sem opção pré-marcada: é a concordância
 * explícita da pessoa com o que outras pessoas vão ver.
 */
export default function EscolhaPrivacidade({ modoAnonimo, onEscolher, erro }: EscolhaPrivacidadeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.texto}>
        Quando você salva um diagnóstico, a doença, a foto e a data ficam visíveis para todos os
        usuários do Phytora, no mapa da região. Seu nome nunca aparece.
      </Text>

      <Opcao
        titulo="Mostrar o ponto exato"
        descricao="Outras pessoas veem o local exato onde a doença foi identificada, o que pode revelar onde fica sua lavoura."
        selecionada={modoAnonimo === false}
        onPress={() => onEscolher(false)}
      />
      <Opcao
        titulo="Mostrar só o município"
        descricao="Outras pessoas veem apenas o município. O ponto exato continua guardado e é usado só para calcular os alertas de vizinhos, sem ser mostrado."
        selecionada={modoAnonimo === true}
        onPress={() => onEscolher(true)}
      />

      <Text style={styles.nota}>
        Você pode mudar isso a qualquer momento no seu Perfil, e a mudança vale para todos os seus
        diagnósticos, inclusive os já feitos.
      </Text>

      {erro && <Text style={styles.erro}>{erro}</Text>}
    </View>
  );
}

function Opcao({
  titulo,
  descricao,
  selecionada,
  onPress,
}: {
  titulo: string;
  descricao: string;
  selecionada: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ checked: selecionada }}
    >
      <View style={[styles.marca, selecionada && styles.marcaSelecionada]}>
        {selecionada && <View style={styles.marcaPonto} />}
      </View>
      <View style={styles.opcaoTexto}>
        <Text style={styles.opcaoTitulo}>{titulo}</Text>
        <Text style={styles.opcaoDescricao}>{descricao}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },

  texto: {
    color: COLORS.textLight,
    fontSize: 15,
    lineHeight: 22,
  },

  opcao: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  opcaoSelecionada: {
    borderColor: COLORS.white,
    borderWidth: 2,
  },

  marca: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  marcaSelecionada: {
    borderColor: COLORS.white,
  },

  marcaPonto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.white,
  },

  opcaoTexto: {
    flex: 1,
    gap: 4,
  },

  opcaoTitulo: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  opcaoDescricao: {
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 20,
  },

  nota: {
    color: COLORS.textLight,
    fontSize: 13,
    opacity: 0.85,
  },

  erro: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: 'center',
  },
});
