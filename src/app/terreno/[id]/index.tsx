import { Image } from 'expo-image';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react-native';
import { type ReactNode, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Button from '@/components/Button';
import CulturaIcone from '@/components/CulturaIcone';
import { Carregando, ErroComRetentativa } from '@/components/EstadoTela';
import { API_URL } from '@/config/api';
import { COLORS } from '@/constants/colors';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { listarRegistrosDoTerreno } from '@/services/registros';
import { buscarTerreno, excluirTerreno } from '@/services/terrenos';
import type { CulturaPlantadaOutput, RegistroOutput } from '@/types/api';
import { paraTela } from '@/utils/datas';
import { CULTURA_COM_DIAGNOSTICO, paramsDoDiagnostico } from '@/utils/diagnostico';
import { errosDoFormulario } from '@/utils/erros';
import {
  formatarArea,
  formatarConfianca,
  formatarCoordenadas,
  formatarDataHora,
  formatarMunicipio,
  formatarNomeCultura,
} from '@/utils/formatar';

export default function TerrenoScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    dados: carregados,
    erro,
    carregando,
    atualizando,
    atualizar,
    tentarDeNovo,
  } = useDadosDaTela(() => Promise.all([buscarTerreno(id), listarRegistrosDoTerreno(id)]));
  const [historicoAberto, setHistoricoAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const nome = carregados?.[0].nome;
  useEffect(() => {
    if (nome) navigation.setOptions({ title: nome });
  }, [nome, navigation]);

  if (carregando) return <Carregando />;
  if (erro || !carregados) {
    return <ErroComRetentativa mensagem={erro ?? ''} onTentarDeNovo={tentarDeNovo} />;
  }
  const [dados, registros] = carregados;

  function confirmarExclusao() {
    Alert.alert(
      'Excluir terreno?',
      'Os diagnósticos feitos neste terreno continuam no mapa da região. As culturas ativas serão encerradas hoje.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ],
    );
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await excluirTerreno(id);
      router.back();
    } catch (e) {
      setExcluindo(false);
      Alert.alert('Não foi possível excluir', errosDoFormulario(e).geral ?? 'Tente de novo.');
    }
  }

  const encerradas = dados.culturas_encerradas;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={atualizando}
          onRefresh={atualizar}
          tintColor={COLORS.textLight}
          colors={[COLORS.primary]}
        />
      }
    >
      <View style={styles.bloco}>
        <Info rotulo="Município" valor={formatarMunicipio(dados.municipio)} />
        <Info
          rotulo="Área"
          valor={dados.area_hectares != null ? formatarArea(dados.area_hectares) : 'Não informada'}
        />
        <Info rotulo="Localização" valor={formatarCoordenadas(dados.localizacao)} />
      </View>

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Culturas ativas</Text>

        {dados.culturas_ativas.length === 0 && (
          <Text style={styles.textoSecundario}>Nada plantado no momento.</Text>
        )}

        {dados.culturas_ativas.map((cultura) => (
          <CartaoCultura key={cultura.id_cultura_plantada} cultura={cultura}>
            <View style={styles.acoesCultura}>
              {cultura.cultura.nome === CULTURA_COM_DIAGNOSTICO ? (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/diagnostico/foto',
                      params: paramsDoDiagnostico(dados, cultura),
                    })
                  }
                >
                  <Text style={styles.acao}>Diagnosticar</Text>
                </Pressable>
              ) : (
                <Text style={styles.acaoDesabilitada}>Diagnóstico só para soja</Text>
              )}
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/cultura/[id]/editar',
                    params: {
                      id: cultura.id_cultura_plantada,
                      nome: cultura.cultura.nome,
                      data_plantio: cultura.data_plantio,
                      safra: cultura.safra,
                    },
                  })
                }
              >
                <Text style={styles.acao}>Editar</Text>
              </Pressable>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/cultura/[id]/encerrar',
                    params: {
                      id: cultura.id_cultura_plantada,
                      nome: cultura.cultura.nome,
                      data_plantio: cultura.data_plantio,
                    },
                  })
                }
              >
                <Text style={styles.acao}>Encerrar</Text>
              </Pressable>
            </View>
          </CartaoCultura>
        ))}

        <Button
          title="Adicionar cultura"
          variant="ghost"
          icon={<Plus size={18} color={COLORS.white} />}
          onPress={() =>
            router.push({ pathname: '/terreno/[id]/nova-cultura', params: { id } })
          }
        />
      </View>

      <View style={styles.secao}>
        <Text style={styles.tituloSecao}>Diagnósticos</Text>
        {registros.length === 0 && (
          <Text style={styles.textoSecundario}>Nenhum diagnóstico salvo neste terreno.</Text>
        )}
        {registros.map((registro) => (
          <LinhaRegistro
            key={registro.id_registro}
            registro={registro}
            onPress={() =>
              router.push({ pathname: '/registro/[id]', params: { id: registro.id_registro } })
            }
          />
        ))}
      </View>

      {encerradas.length > 0 && (
        <View style={styles.secao}>
          <Pressable style={styles.cabecalhoHistorico} onPress={() => setHistoricoAberto((a) => !a)}>
            <Text style={styles.tituloSecao}>Histórico ({encerradas.length})</Text>
            {historicoAberto ? (
              <ChevronUp color={COLORS.textLight} size={20} />
            ) : (
              <ChevronDown color={COLORS.textLight} size={20} />
            )}
          </Pressable>

          {historicoAberto &&
            encerradas.map((cultura) => (
              <CartaoCultura key={cultura.id_cultura_plantada} cultura={cultura} />
            ))}
        </View>
      )}

      <View style={styles.acoesTerreno}>
        <Button
          title="Editar terreno"
          variant="ghost"
          onPress={() => router.push({ pathname: '/terreno/[id]/editar', params: { id } })}
        />
        <Button
          title="Excluir terreno"
          variant="text"
          onPress={confirmarExclusao}
          loading={excluindo}
        />
      </View>
    </ScrollView>
  );
}

function LinhaRegistro({ registro, onPress }: { registro: RegistroOutput; onPress: () => void }) {
  return (
    <Pressable style={styles.cartao} onPress={onPress}>
      <Image
        source={{ uri: `${API_URL}${registro.foto_url}` }}
        style={styles.miniatura}
        contentFit="cover"
      />
      <View style={styles.cartaoTexto}>
        <Text style={styles.nomeCultura}>{registro.doenca?.nome ?? 'Folha saudável'}</Text>
        <Text style={styles.textoSecundario}>
          {formatarDataHora(registro.data_registro)} · {formatarConfianca(registro.confianca)}
          {registro.inconclusivo ? ' · inconclusivo' : ''}
        </Text>
      </View>
    </Pressable>
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

function CartaoCultura({
  cultura,
  children,
}: {
  cultura: CulturaPlantadaOutput;
  children?: ReactNode;
}) {
  const periodo = cultura.encerrada_em
    ? `${paraTela(cultura.data_plantio)} a ${paraTela(cultura.encerrada_em)}`
    : `Plantio em ${paraTela(cultura.data_plantio)}`;

  return (
    <View style={styles.cartao}>
      <View style={styles.icone}>
        <CulturaIcone cultura={cultura.cultura.nome} tamanho={28} />
      </View>
      <View style={styles.cartaoTexto}>
        <Text style={styles.nomeCultura}>{formatarNomeCultura(cultura.cultura.nome)}</Text>
        <Text style={styles.textoSecundario}>
          Safra {cultura.safra} · {periodo}
        </Text>
        {children}
      </View>
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
    gap: 24,
  },

  bloco: {
    gap: 12,
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
    fontSize: 16,
  },

  secao: {
    gap: 12,
  },

  tituloSecao: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },

  cabecalhoHistorico: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textoSecundario: {
    color: COLORS.textLight,
    fontSize: 14,
  },

  cartao: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
  },

  icone: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f4edde',
  },

  cartaoTexto: {
    flex: 1,
    gap: 2,
  },

  nomeCultura: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  acoesCultura: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },

  acao: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  acaoDesabilitada: {
    color: COLORS.textLight,
    fontSize: 14,
    opacity: 0.7,
  },

  miniatura: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#f4edde',
  },

  acoesTerreno: {
    gap: 8,
    marginTop: 8,
  },
});
