import { useRouter } from 'expo-router';

import FormularioTerreno from '@/components/FormularioTerreno';
import { criarTerreno } from '@/services/terrenos';
import type { TerrenoInput } from '@/types/api';

export default function NovoTerrenoScreen() {
  const router = useRouter();

  async function salvar(dados: TerrenoInput) {
    const terreno = await criarTerreno(dados);
    // Vai direto para o detalhe, onde se adiciona a cultura; voltar leva à lista.
    router.replace({ pathname: '/terreno/[id]', params: { id: terreno.id_terreno } });
  }

  return <FormularioTerreno textoBotao="Cadastrar terreno" onSalvar={salvar} />;
}
