import { ChevronRight } from 'lucide-react-native';
import { memo } from 'react';
import { View } from 'react-native';

import { Cartao, criarEstilos, Selo, Texto, useTema } from '@/design-system';
import { formatarDistancia } from '@/utils/geo';

import { DIAS_ALERTA, RAIO_ALERTA_KM } from '../constantes';
import type { ProximidadeDoTerreno } from '../geografia';

type CartaoProximidadeProps = {
  proximidade: ProximidadeDoTerreno;
  /** Há outros terrenos avaliados: o toque também serve para alternar. */
  outros: number;
  onPress: () => void;
};

const useEstilos = criarEstilos((t) => ({
  linha: { flexDirection: 'row', alignItems: 'center', gap: t.espaco.sm },
  texto: { flex: 1, gap: t.espaco.xxs },
}));

/**
 * Resumo de proximidade do terreno do usuário mais afetado. Mostra só
 * distância e frequência: o nível de risco com clima chega na etapa 8.
 */
function CartaoProximidade({ proximidade, outros, onPress }: CartaoProximidadeProps) {
  const tema = useTema();
  const estilos = useEstilos();
  const principal = proximidade.porDoenca[0];
  const nome = proximidade.terreno.nome;

  return (
    <Cartao elevado onPress={onPress} accessibilityLabel={`Doenças perto de ${nome}`}>
      <View style={estilos.linha}>
        <View style={estilos.texto}>
          {principal ? (
            <>
              <Selo rotulo="Doença por perto" tom="risco.moderado" pilula />
              <Texto variante="corpoForte">
                {principal.total} {principal.total === 1 ? 'registro' : 'registros'} de {principal.nome.toLowerCase()}{' '}
                perto da {nome}
              </Texto>
              <Texto variante="rotulo" cor="secundario">
                A menos de {RAIO_ALERTA_KM} km em {DIAS_ALERTA} dias · o mais perto a {formatarDistancia(principal.maisPertoKm)}
                {outros > 0 ? ` · e mais ${outros} ${outros === 1 ? 'terreno' : 'terrenos'} com doença por perto` : ''}
              </Texto>
            </>
          ) : (
            <>
              <Selo rotulo="Sem doença por perto" tom="risco.baixo" pilula />
              <Texto variante="corpoForte">Nenhuma doença registrada perto da {nome}</Texto>
              <Texto variante="rotulo" cor="secundario">
                A menos de {RAIO_ALERTA_KM} km nos últimos {DIAS_ALERTA} dias
              </Texto>
            </>
          )}
        </View>
        <ChevronRight size={20} color={tema.cores.textoSecundario} />
      </View>
    </Cartao>
  );
}

export default memo(CartaoProximidade);
