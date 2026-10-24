import { useLocalSearchParams, useRouter } from 'expo-router';

import { Carregando, ErroComRetentativa } from '@/components/EstadoTela';
import FormularioTerreno from '@/components/FormularioTerreno';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { atualizarTerreno, buscarTerreno } from '@/services/terrenos';
import type { TerrenoInput } from '@/types/api';

export default function EditarTerrenoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dados, erro, carregando, tentarDeNovo } = useDadosDaTela(() => buscarTerreno(id));

  if (carregando) return <Carregando />;
  if (erro || !dados) {
    return <ErroComRetentativa mensagem={erro ?? ''} onTentarDeNovo={tentarDeNovo} />;
  }

  async function salvar(novos: TerrenoInput) {
    await atualizarTerreno(id, novos);
    router.back();
  }

  return <FormularioTerreno terreno={dados} textoBotao="Salvar alterações" onSalvar={salvar} />;
}
