import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';

import { Botao, Cartao, criarEstilos, Segmentado, Selo, Texto, useTema } from '@/design-system';
import type { TerrenoOutput } from '@/types/api';
import { formatarConfianca, formatarDataHora, formatarTempoRelativo } from '@/utils/formatar';
import { formatarDistancia } from '@/utils/geo';

import { DIAS_ALERTA, DOENCAS, NOME_SAUDAVEL, PERIODOS, RAIO_ALERTA_KM } from '../constantes';
import type { ProximidadeDoTerreno } from '../geografia';
import type { Periodo, RegistroPublico, ResumoMunicipio } from '../tipos';
import FotoRegistro from './FotoRegistro';

const useEstilos = criarEstilos((t) => ({
  cabecalho: { paddingHorizontal: t.espaco.xl, paddingBottom: t.espaco.md, gap: t.espaco.md },
  linhaTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: t.espaco.sm },
  conteudo: { paddingHorizontal: t.espaco.xl, paddingBottom: t.espaco.xl, gap: t.espaco.md },
  contagens: { flexDirection: 'row', flexWrap: 'wrap', gap: t.espaco.md },
  contagem: { flexDirection: 'row', alignItems: 'center', gap: t.espaco.xs + 2 },
  bolinha: { width: 10, height: 10, borderRadius: 5 },
  vazada: { borderWidth: 2, backgroundColor: 'transparent' },
  linhaRegistro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.espaco.md,
    paddingHorizontal: t.espaco.xl,
    paddingVertical: t.espaco.sm + 2,
    minHeight: 72,
  },
  textoRegistro: { flex: 1, gap: t.espaco.xxs },
  secao: { paddingHorizontal: t.espaco.xl, paddingTop: t.espaco.md, paddingBottom: t.espaco.xs },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: t.espaco.xs, minHeight: t.alvoToque, alignSelf: 'flex-start' },
  detalheTopo: { flexDirection: 'row', gap: t.espaco.md },
  detalheInfo: { flex: 1, gap: t.espaco.xs },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: t.espaco.xs + 2 },
  linhaMunicipio: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.espaco.xl,
    minHeight: t.alvoToque + 4,
    borderBottomWidth: 1,
    borderBottomColor: t.cores.borda,
  },
  vazio: { paddingHorizontal: t.espaco.xl, paddingVertical: t.espaco.lg },
}));

const nomeDoRegistro = (r: RegistroPublico) => r.doenca?.nome ?? NOME_SAUDAVEL;

// --- Cabeçalho fixo (arrasta a folha) -----------------------------------------

type CabecalhoProps = {
  titulo: string;
  /** Nova área carregando: os dados antigos continuam na tela. */
  carregando: boolean;
  dias: Periodo;
  onMudarDias: (dias: Periodo) => void;
  demonstracao: boolean;
};

export const CabecalhoFolha = memo(function CabecalhoFolha({ titulo, carregando, dias, onMudarDias, demonstracao }: CabecalhoProps) {
  const estilos = useEstilos();
  const tema = useTema();
  return (
    <View style={estilos.cabecalho}>
      <View style={estilos.linhaTitulo}>
        <Texto variante="subtitulo" style={{ flexShrink: 1 }}>
          {titulo}
        </Texto>
        {carregando ? <ActivityIndicator size="small" color={tema.cores.textoSecundario} /> : null}
        {demonstracao ? <Selo rotulo="Dados de demonstração" tom="aviso" /> : null}
      </View>
      <Segmentado opcoes={PERIODOS} valor={dias} onMudar={onMudarDias} accessibilityLabel="Período" />
    </View>
  );
});

// --- Folha recolhida: o resumo da área ------------------------------------------

type DestaqueProps = { registro: RegistroPublico; km: number; terreno: TerrenoOutput };

type ResumoAreaProps = {
  registros: RegistroPublico[];
  destaque: DestaqueProps | null;
  onSelecionar: (registro: RegistroPublico) => void;
  onVerLista: () => void;
};

export const ResumoArea = memo(function ResumoArea({ registros, destaque, onSelecionar, onVerLista }: ResumoAreaProps) {
  const tema = useTema();
  const estilos = useEstilos();
  const contagem = (chave: string | null) =>
    registros.filter((r) => (r.doenca?.chave ?? null) === chave).length;
  const saudaveis = contagem(null);

  return (
    <View style={estilos.conteudo}>
      <View style={estilos.contagens}>
        {DOENCAS.map((d) => {
          const total = contagem(d.chave);
          if (total === 0) return null;
          return (
            <View key={d.chave} style={estilos.contagem}>
              <View style={[estilos.bolinha, { backgroundColor: tema.doenca[d.chave].cor }]} />
              <Texto variante="rotulo">
                {d.curto} {total}
              </Texto>
            </View>
          );
        })}
        {saudaveis > 0 ? (
          <View style={estilos.contagem}>
            <View style={[estilos.bolinha, estilos.vazada, { borderColor: tema.doenca.saudavel.cor }]} />
            <Texto variante="rotulo">Saudáveis {saudaveis}</Texto>
          </View>
        ) : null}
      </View>

      {destaque ? (
        <Cartao
          variante="suave"
          onPress={() => onSelecionar(destaque.registro)}
          accessibilityLabel="Ver o registro mais perto do seu terreno"
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: tema.doenca[destaque.registro.doenca!.chave].suave }}
        >
          <Texto variante="corpo" style={{ flex: 1 }}>
            <Texto variante="corpoForte">
              {destaque.registro.doenca!.nome} a {formatarDistancia(destaque.km)}
            </Texto>{' '}
            da {destaque.terreno.nome} · {formatarTempoRelativo(destaque.registro.data_registro)}
          </Texto>
          <ChevronRight size={18} color={tema.cores.textoSecundario} />
        </Cartao>
      ) : null}

      <Botao titulo="Ver todos na lista" variante="texto" tamanho="compacto" onPress={onVerLista} />
    </View>
  );
});

// --- Lista de registros ---------------------------------------------------------

type Distancia = { km: number; terreno: TerrenoOutput } | null;

type ListaRegistrosProps = {
  registros: RegistroPublico[];
  /** Distância de cada registro até o terreno do usuário mais perto. */
  distancia: (r: RegistroPublico) => Distancia;
  onSelecionar: (registro: RegistroPublico) => void;
  titulo?: string;
  onVoltar?: () => void;
};

type ItemLista = { tipo: 'secao'; rotulo: string } | { tipo: 'registro'; registro: RegistroPublico };

const LinhaRegistro = memo(function LinhaRegistro({
  registro,
  distancia,
  onSelecionar,
}: {
  registro: RegistroPublico;
  distancia: Distancia;
  onSelecionar: (r: RegistroPublico) => void;
}) {
  const estilos = useEstilos();
  const local = distancia
    ? `a ${formatarDistancia(distancia.km)} da ${distancia.terreno.nome}`
    : (registro.municipio?.nome ?? 'Município não identificado');
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onSelecionar(registro)}
      style={({ pressed }) => [estilos.linhaRegistro, pressed && { opacity: 0.7 }]}
    >
      <FotoRegistro registro={registro} tamanho={52} />
      <View style={estilos.textoRegistro}>
        <Texto variante="corpoForte" numberOfLines={1}>
          {nomeDoRegistro(registro)}
        </Texto>
        <Texto variante="rotulo" numberOfLines={1}>
          {local} · {formatarTempoRelativo(registro.data_registro)}
        </Texto>
        <Texto variante="legenda" cor="secundario" numberOfLines={1}>
          {registro.municipio?.nome ?? '—'} · {registro.precisao === 'exato' ? 'ponto exato' : 'só o município'} ·{' '}
          {formatarConfianca(registro.confianca)}
        </Texto>
      </View>
    </Pressable>
  );
});

export const ListaRegistros = memo(function ListaRegistros({
  registros,
  distancia,
  onSelecionar,
  titulo,
  onVoltar,
}: ListaRegistrosProps) {
  const estilos = useEstilos();
  const tema = useTema();

  // Recentes (janela da regra de alerta) primeiro; dentro de cada grupo, o mais perto primeiro.
  const limite = Date.now() - DIAS_ALERTA * 86_400_000;
  const ordenar = (a: RegistroPublico, b: RegistroPublico) =>
    (distancia(a)?.km ?? Infinity) - (distancia(b)?.km ?? Infinity);
  const recentes = registros.filter((r) => Date.parse(r.data_registro) >= limite).sort(ordenar);
  const antigos = registros.filter((r) => Date.parse(r.data_registro) < limite).sort(ordenar);
  const itens: ItemLista[] = [
    ...(recentes.length ? [{ tipo: 'secao' as const, rotulo: `Últimos ${DIAS_ALERTA} dias` }] : []),
    ...recentes.map((registro) => ({ tipo: 'registro' as const, registro })),
    ...(antigos.length ? [{ tipo: 'secao' as const, rotulo: 'Mais antigos' }] : []),
    ...antigos.map((registro) => ({ tipo: 'registro' as const, registro })),
  ];

  const renderizar = useCallback(
    ({ item }: { item: ItemLista }) =>
      item.tipo === 'secao' ? (
        <Texto variante="sobretitulo" cor="secundario" style={estilos.secao}>
          {item.rotulo}
        </Texto>
      ) : (
        <LinhaRegistro registro={item.registro} distancia={distancia(item.registro)} onSelecionar={onSelecionar} />
      ),
    [distancia, onSelecionar, estilos.secao],
  );

  return (
    <FlatList
      data={itens}
      keyExtractor={(item) => (item.tipo === 'secao' ? `secao:${item.rotulo}` : item.registro.id_registro)}
      renderItem={renderizar}
      initialNumToRender={8}
      maxToRenderPerBatch={8}
      windowSize={5}
      removeClippedSubviews
      ListHeaderComponent={
        onVoltar ? (
          <View style={estilos.conteudo}>
            <Pressable accessibilityRole="button" onPress={onVoltar} style={estilos.voltar}>
              <ChevronLeft size={20} color={tema.cores.primaria} />
              <Texto variante="corpoForte" cor="primaria">
                Voltar
              </Texto>
            </Pressable>
            {titulo ? <Texto variante="destaque">{titulo}</Texto> : null}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <Texto variante="corpo" cor="secundario" style={estilos.vazio}>
          Nenhum registro nesta área no período. Afaste o mapa ou aumente o período.
        </Texto>
      }
    />
  );
});

// --- Registro selecionado -------------------------------------------------------

type DetalheRegistroProps = {
  registro: RegistroPublico;
  distancia: Distancia;
  /** Proximidade do terreno mais perto, para dizer quantos casos da mesma doença há em volta. */
  proximidade: ProximidadeDoTerreno | null;
  onVoltar: () => void;
  onDiagnosticar: ((terreno: TerrenoOutput) => void) | null;
};

export const DetalheRegistro = memo(function DetalheRegistro({
  registro,
  distancia,
  proximidade,
  onVoltar,
  onDiagnosticar,
}: DetalheRegistroProps) {
  const estilos = useEstilos();
  const tema = useTema();
  const mesmaDoenca = registro.doenca
    ? proximidade?.porDoenca.find((d) => d.chave === registro.doenca!.chave)
    : undefined;

  return (
    <ScrollView contentContainerStyle={estilos.conteudo}>
      <Pressable accessibilityRole="button" onPress={onVoltar} style={estilos.voltar}>
        <ChevronLeft size={20} color={tema.cores.primaria} />
        <Texto variante="corpoForte" cor="primaria">
          Voltar
        </Texto>
      </Pressable>

      <View style={estilos.detalheTopo}>
        <FotoRegistro registro={registro} tamanho={104} />
        <View style={estilos.detalheInfo}>
          <Texto variante="titulo">{nomeDoRegistro(registro)}</Texto>
          <Texto variante="rotulo" cor="secundario">
            {formatarDataHora(registro.data_registro)} · {registro.cultura}
          </Texto>
          <View style={estilos.selos}>
            <Selo
              rotulo={registro.precisao === 'exato' ? 'Ponto exato' : 'Só o município'}
              tom={registro.precisao === 'exato' ? 'sucesso' : 'aviso'}
            />
            <Selo rotulo={`Confiança ${formatarConfianca(registro.confianca)}`} />
          </View>
        </View>
      </View>

      <Cartao variante="suave">
        {distancia ? (
          <Texto variante="corpo">
            <Texto variante="corpoForte">A {formatarDistancia(distancia.km)} da {distancia.terreno.nome}</Texto>, seu terreno
            mais perto
          </Texto>
        ) : null}
        <Texto variante="rotulo" cor="secundario">
          {registro.municipio ? `${registro.municipio.nome}/${registro.municipio.uf}` : 'Município não identificado'} ·
          quem registrou não é identificado
        </Texto>
        {registro.precisao === 'municipio' ? (
          <Texto variante="rotulo" cor="secundario">
            Quem registrou usa o modo anônimo: o ponto no mapa é o centro do município, não o local da folha.
          </Texto>
        ) : null}
      </Cartao>

      {mesmaDoenca && distancia ? (
        <Cartao variante="suave" style={{ backgroundColor: tema.tom.aviso.fundo }}>
          <Selo rotulo="Doença por perto" tom="risco.moderado" pilula />
          <Texto variante="corpo">
            {mesmaDoenca.total} {mesmaDoenca.total === 1 ? 'registro' : 'registros'} de {mesmaDoenca.nome.toLowerCase()} a
            menos de {RAIO_ALERTA_KM} km da {distancia.terreno.nome} nos últimos {DIAS_ALERTA} dias.
          </Texto>
        </Cartao>
      ) : null}

      {onDiagnosticar && distancia ? (
        <Botao titulo={`Diagnosticar a ${distancia.terreno.nome}`} onPress={() => onDiagnosticar(distancia.terreno)} />
      ) : null}
    </ScrollView>
  );
});

// --- Panorama: municípios com mais registros ------------------------------------

type ResumoPanoramaProps = {
  resumos: ResumoMunicipio[];
  onSelecionar: (resumo: ResumoMunicipio) => void;
};

export const ResumoPanorama = memo(function ResumoPanorama({ resumos, onSelecionar }: ResumoPanoramaProps) {
  const estilos = useEstilos();
  return (
    <FlatList
      data={resumos}
      keyExtractor={(r) => r.municipio.codigo_ibge}
      ListHeaderComponent={
        <Texto variante="rotulo" cor="secundario" style={estilos.vazio}>
          Aproxime o mapa para ver cada registro, ou toque num município.
        </Texto>
      }
      renderItem={({ item }) => (
        <Pressable accessibilityRole="button" onPress={() => onSelecionar(item)} style={estilos.linhaMunicipio}>
          <Texto variante="corpo">
            {item.municipio.nome}/{item.municipio.uf}
          </Texto>
          <Texto variante="corpoForte">{item.total}</Texto>
        </Pressable>
      )}
    />
  );
});
