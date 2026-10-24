import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '@/components/Button';
import CampoData from '@/components/CampoData';
import TelaFormulario from '@/components/TelaFormulario';
import { COLORS } from '@/constants/colors';
import { encerrarCultura } from '@/services/culturas';
import { hojeIso, paraIso, paraTela } from '@/utils/datas';
import { errosDoFormulario, type ErrosDoFormulario } from '@/utils/erros';

type Parametros = { id: string; nome: string; data_plantio: string };

export default function EncerrarCulturaScreen() {
  const router = useRouter();
  const { id, nome, data_plantio } = useLocalSearchParams<Parametros>();

  // Hoje por padrão; dá para pôr uma data anterior (colheita registrada depois).
  const [dataTexto, setDataTexto] = useState(paraTela(hojeIso()));
  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosDoFormulario>({ campos: {} });

  async function encerrar() {
    const iso = paraIso(dataTexto);
    if (!iso) {
      setErros({ campos: { encerrada_em: 'Data inválida. Use o formato DD/MM/AAAA.' } });
      return;
    }

    setEnviando(true);
    setErros({ campos: {} });
    try {
      await encerrarCultura(id, iso);
      router.back();
    } catch (e) {
      setErros(errosDoFormulario(e));
      setEnviando(false);
    }
  }

  return (
    <TelaFormulario
      erro={erros.geral}
      actions={<Button title="Encerrar cultura" onPress={encerrar} loading={enviando} />}
    >
      <Text style={styles.texto}>
        Encerrar {nome} plantada em {paraTela(data_plantio)}. Ela vai para o histórico do terreno
        e não pode ser reaberta.
      </Text>
      <CampoData
        label="Data de encerramento"
        value={dataTexto}
        onChangeText={setDataTexto}
        erro={erros.campos.encerrada_em}
      />
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  texto: {
    color: COLORS.textLight,
    fontSize: 16,
  },
});
