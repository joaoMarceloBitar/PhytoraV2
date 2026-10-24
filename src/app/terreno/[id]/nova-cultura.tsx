import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import CamposPlantio, { usePlantio } from '@/components/CamposPlantio';
import CulturaIcone from '@/components/CulturaIcone';
import { Carregando, ErroComRetentativa } from '@/components/EstadoTela';
import TelaFormulario from '@/components/TelaFormulario';
import { COLORS } from '@/constants/colors';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { adicionarCultura, listarCulturas } from '@/services/culturas';
import { errosDoFormulario, type ErrosDoFormulario } from '@/utils/erros';
import { formatarNomeCultura } from '@/utils/formatar';

// Única cultura com modelo treinado (ver docs/v2-proposta.md).
const CULTURA_COM_DIAGNOSTICO = 'soja';

export default function NovaCulturaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const catalogo = useDadosDaTela(listarCulturas);
  const plantio = usePlantio();

  const [idCultura, setIdCultura] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosDoFormulario>({ campos: {} });

  if (catalogo.carregando) return <Carregando />;
  if (catalogo.erro || !catalogo.dados) {
    return (
      <ErroComRetentativa mensagem={catalogo.erro ?? ''} onTentarDeNovo={catalogo.tentarDeNovo} />
    );
  }

  const escolhida = catalogo.dados.find((c) => c.id_cultura === idCultura);

  async function salvar() {
    if (!idCultura) {
      setErros({ campos: { id_cultura: 'Escolha uma cultura.' } });
      return;
    }
    const validado = plantio.validar();
    if (!validado.ok) {
      setErros({ campos: { data_plantio: validado.erro } });
      return;
    }

    setEnviando(true);
    setErros({ campos: {} });
    try {
      await adicionarCultura(id, { id_cultura: idCultura, ...validado.dados });
      router.back();
    } catch (e) {
      setErros(errosDoFormulario(e));
      setEnviando(false);
    }
  }

  return (
    <TelaFormulario
      erro={erros.geral}
      actions={<Button title="Adicionar cultura" onPress={salvar} loading={enviando} />}
    >
      <View style={styles.campo}>
        <Text style={styles.label}>Cultura</Text>
        <View style={styles.opcoes}>
          {catalogo.dados.map((cultura) => {
            const selecionada = cultura.id_cultura === idCultura;
            return (
              <Pressable
                key={cultura.id_cultura}
                style={[styles.opcao, selecionada && styles.opcaoSelecionada]}
                onPress={() => setIdCultura(cultura.id_cultura)}
              >
                <CulturaIcone cultura={cultura.nome} tamanho={22} />
                <Text style={styles.opcaoTexto}>{formatarNomeCultura(cultura.nome)}</Text>
              </Pressable>
            );
          })}
        </View>
        {erros.campos.id_cultura && <Text style={styles.erro}>{erros.campos.id_cultura}</Text>}
        {escolhida && escolhida.nome !== CULTURA_COM_DIAGNOSTICO && (
          <Text style={styles.aviso}>
            O diagnóstico por foto ainda só reconhece doenças da soja. Você pode registrar{' '}
            {escolhida.nome} normalmente.
          </Text>
        )}
      </View>

      <CamposPlantio plantio={plantio} erros={erros.campos} />
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  campo: {
    gap: 8,
  },

  label: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
  },

  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#f4edde',
  },

  opcaoSelecionada: {
    borderColor: COLORS.white,
    backgroundColor: '#E3D6B8',
  },

  opcaoTexto: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },

  aviso: {
    color: COLORS.warning,
    fontSize: 13,
  },

  erro: {
    color: COLORS.error,
    fontSize: 13,
  },
});
