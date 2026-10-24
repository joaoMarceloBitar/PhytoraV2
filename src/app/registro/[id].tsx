import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Carregando, ErroComRetentativa } from '@/components/EstadoTela';
import { API_URL } from '@/config/api';
import { COLORS } from '@/constants/colors';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { buscarRegistro } from '@/services/registros';
import {
  formatarConfianca,
  formatarCoordenadas,
  formatarDataHora,
  formatarMunicipio,
  formatarNomeCultura,
} from '@/utils/formatar';

/** Um diagnóstico salvo, visto pelo dono: foto grande e todos os detalhes. */
export default function RegistroScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { dados, erro, carregando, tentarDeNovo } = useDadosDaTela(() => buscarRegistro(id));

  if (carregando) return <Carregando />;
  if (erro || !dados) {
    return <ErroComRetentativa mensagem={erro ?? ''} onTentarDeNovo={tentarDeNovo} />;
  }

  const local =
    dados.origem_localizacao === 'gps'
      ? `GPS${dados.precisao_gps_m != null ? ` ±${Math.round(dados.precisao_gps_m)} m` : ''}`
      : 'Localização do terreno';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Image
        source={{ uri: `${API_URL}${dados.foto_url}` }}
        style={styles.foto}
        contentFit="cover"
        transition={150}
      />

      <View style={styles.cabecalho}>
        <Text style={styles.doenca}>{dados.doenca?.nome ?? 'Folha saudável'}</Text>
        {dados.inconclusivo && <Text style={styles.inconclusivo}>Inconclusivo</Text>}
      </View>
      {dados.inconclusivo && (
        <Text style={styles.aviso}>
          A confiança ficou baixa: este diagnóstico não aparece no mapa da região nem entra nos
          alertas.
        </Text>
      )}

      <View style={styles.bloco}>
        <Info rotulo="Confiança" valor={formatarConfianca(dados.confianca)} />
        <Info rotulo="Data" valor={formatarDataHora(dados.data_registro)} />
        <Info rotulo="Cultura" valor={formatarNomeCultura(dados.cultura.nome)} />
        <Info rotulo="Município" valor={formatarMunicipio(dados.municipio)} />
        <Info rotulo="Ponto" valor={`${formatarCoordenadas(dados.localizacao)} · ${local}`} />
        <Info rotulo="Foto" valor={dados.origem_foto === 'camera' ? 'Câmera' : 'Galeria'} />
      </View>

      <View style={styles.bloco}>
        <Text style={styles.rotulo}>Classes mais prováveis</Text>
        {dados.top_predicoes.map((p) => (
          <View key={p.classe} style={styles.predicao}>
            <Text style={styles.valor}>{p.classe}</Text>
            <Text style={styles.valor}>{formatarConfianca(p.confianca)}</Text>
          </View>
        ))}
        <Text style={styles.versao}>Modelo {dados.versao_modelo}</Text>
      </View>
    </ScrollView>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  conteudo: {
    padding: 16,
    gap: 16,
  },

  foto: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },

  doenca: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },

  inconclusivo: {
    color: COLORS.primary,
    backgroundColor: COLORS.warning,
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: 'hidden',
  },

  aviso: {
    color: COLORS.warning,
    fontSize: 14,
  },

  bloco: {
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  info: {
    gap: 2,
  },

  rotulo: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '600',
  },

  valor: {
    color: COLORS.white,
    fontSize: 15,
  },

  predicao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  versao: {
    color: COLORS.textLight,
    fontSize: 12,
    opacity: 0.7,
  },
});
