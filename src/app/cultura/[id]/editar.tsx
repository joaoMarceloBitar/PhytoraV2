import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import Button from '@/components/Button';
import CamposPlantio, { usePlantio } from '@/components/CamposPlantio';
import TelaFormulario from '@/components/TelaFormulario';
import { COLORS } from '@/constants/colors';
import { editarCultura } from '@/services/culturas';
import { errosDoFormulario, type ErrosDoFormulario } from '@/utils/erros';
import { formatarNomeCultura } from '@/utils/formatar';

// A API não tem GET de uma cultura plantada: os dados atuais vêm do detalhe
// do terreno pelos parâmetros da rota.
type Parametros = { id: string; nome: string; data_plantio: string; safra: string };

export default function EditarCulturaScreen() {
  const router = useRouter();
  const { id, nome, data_plantio, safra } = useLocalSearchParams<Parametros>();
  const plantio = usePlantio({ data_plantio, safra });

  const [enviando, setEnviando] = useState(false);
  const [erros, setErros] = useState<ErrosDoFormulario>({ campos: {} });

  async function salvar() {
    const validado = plantio.validar();
    if (!validado.ok) {
      setErros({ campos: { data_plantio: validado.erro } });
      return;
    }

    setEnviando(true);
    setErros({ campos: {} });
    try {
      await editarCultura(id, validado.dados);
      router.back();
    } catch (e) {
      setErros(errosDoFormulario(e));
      setEnviando(false);
    }
  }

  return (
    <TelaFormulario
      erro={erros.geral}
      actions={<Button title="Salvar alterações" onPress={salvar} loading={enviando} />}
    >
      <Text style={styles.cultura}>{formatarNomeCultura(nome)}</Text>
      <CamposPlantio plantio={plantio} erros={erros.campos} />
    </TelaFormulario>
  );
}

const styles = StyleSheet.create({
  cultura: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '700',
  },
});
