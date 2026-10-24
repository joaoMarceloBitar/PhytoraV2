import { memo } from 'react';
import { ScrollView } from 'react-native';

import { Chip, criarEstilos, useTema } from '@/design-system';

import { DOENCAS } from '../constantes';
import type { Filtros } from '../tipos';

type FiltrosDoencaProps = {
  filtros: Filtros;
  onMudar: (filtros: Filtros) => void;
};

const useEstilos = criarEstilos((t) => ({
  linha: { gap: t.espaco.sm, paddingHorizontal: t.espaco.lg, paddingVertical: t.espaco.xs },
}));

/** Fila rolável de filtros sobre o mapa: uma doença (ou todas) e folhas saudáveis. */
function FiltrosDoenca({ filtros, onMudar }: FiltrosDoencaProps) {
  const tema = useTema();
  const estilos = useEstilos();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={estilos.linha}>
      <Chip
        rotulo="Todas as doenças"
        flutuante
        selecionado={filtros.doenca === 'todas'}
        onPress={() => onMudar({ ...filtros, doenca: 'todas' })}
      />
      {DOENCAS.map((d) => (
        <Chip
          key={d.chave}
          rotulo={d.curto}
          flutuante
          corIndicador={tema.doenca[d.chave].cor}
          selecionado={filtros.doenca === d.chave}
          onPress={() => onMudar({ ...filtros, doenca: d.chave })}
        />
      ))}
      <Chip
        rotulo="Saudáveis"
        flutuante
        corIndicador={tema.doenca.saudavel.cor}
        indicadorVazado
        selecionado={filtros.saudaveis}
        onPress={() => onMudar({ ...filtros, saudaveis: !filtros.saudaveis })}
      />
    </ScrollView>
  );
}

export default memo(FiltrosDoenca);
