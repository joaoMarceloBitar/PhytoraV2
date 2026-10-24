import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import CulturaIcone from '@/components/CulturaIcone';
import { Carregando, ErroComRetentativa } from '@/components/EstadoTela';
import { COLORS } from '@/constants/colors';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { listarTerrenos } from '@/services/terrenos';
import type { CulturaPlantadaOutput, TerrenoOutput } from '@/types/api';
import { formatarMunicipio, formatarNomeCultura } from '@/utils/formatar';
import { CULTURA_COM_DIAGNOSTICO, paramsDoDiagnostico } from '@/utils/diagnostico';

/** Primeiro passo do diagnóstico pelo Início: em qual terreno e cultura. */
export default function EscolherCulturaScreen() {
  const router = useRouter();
  const { dados, erro, carregando, tentarDeNovo } = useDadosDaTela(listarTerrenos);

  if (carregando) return <Carregando />;
  if (erro || !dados) {
    return <ErroComRetentativa mensagem={erro ?? ''} onTentarDeNovo={tentarDeNovo} />;
  }

  function escolher(terreno: TerrenoOutput, cultura: CulturaPlantadaOutput) {
    router.push({ pathname: '/diagnostico/foto', params: paramsDoDiagnostico(terreno, cultura) });
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.lista}
      data={dados}
      keyExtractor={(terreno) => terreno.id_terreno}
      ListHeaderComponent={
        <Text style={styles.intro}>
          Escolha a cultura fotografada. O diagnóstico por foto ainda só reconhece doenças da soja.
        </Text>
      }
      renderItem={({ item: terreno }) => (
        <View style={styles.terreno}>
          <Text style={styles.nomeTerreno}>{terreno.nome}</Text>
          <Text style={styles.municipio}>{formatarMunicipio(terreno.municipio)}</Text>

          {terreno.culturas_ativas.length === 0 && (
            <Text style={styles.semCultura}>Nada plantado. Adicione uma cultura no terreno.</Text>
          )}

          {terreno.culturas_ativas.map((cultura) => {
            const temDiagnostico = cultura.cultura.nome === CULTURA_COM_DIAGNOSTICO;
            return (
              <Pressable
                key={cultura.id_cultura_plantada}
                style={[styles.cultura, !temDiagnostico && styles.culturaDesabilitada]}
                disabled={!temDiagnostico}
                onPress={() => escolher(terreno, cultura)}
              >
                <View style={styles.icone}>
                  <CulturaIcone cultura={cultura.cultura.nome} tamanho={22} />
                </View>
                <View style={styles.culturaTexto}>
                  <Text style={styles.nomeCultura}>{formatarNomeCultura(cultura.cultura.nome)}</Text>
                  <Text style={styles.detalhe}>
                    {temDiagnostico ? `Safra ${cultura.safra}` : 'Diagnóstico ainda não disponível'}
                  </Text>
                </View>
                {temDiagnostico && <ChevronRight color={COLORS.textLight} size={20} />}
              </Pressable>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>
            Para salvar um diagnóstico, cadastre primeiro o terreno e a soja plantada nele.
          </Text>
          <Button title="Cadastrar terreno" onPress={() => router.replace('/terreno/novo')} />
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  lista: {
    padding: 16,
    gap: 16,
  },

  intro: {
    color: COLORS.textLight,
    fontSize: 15,
  },

  terreno: {
    gap: 8,
  },

  nomeTerreno: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },

  municipio: {
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: -6,
  },

  semCultura: {
    color: COLORS.textLight,
    fontSize: 14,
    opacity: 0.8,
  },

  cultura: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },

  culturaDesabilitada: {
    opacity: 0.55,
  },

  icone: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4edde',
  },

  culturaTexto: {
    flex: 1,
    gap: 2,
  },

  nomeCultura: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  detalhe: {
    color: COLORS.textLight,
    fontSize: 13,
  },

  vazio: {
    gap: 16,
    paddingTop: 24,
  },

  vazioTexto: {
    color: COLORS.textLight,
    fontSize: 15,
    textAlign: 'center',
  },
});
