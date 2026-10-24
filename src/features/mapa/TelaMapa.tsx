import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { criarEstilos, Folha } from '@/design-system';
import { useDadosDaTela } from '@/hooks/use-dados-da-tela';
import { listarTerrenos } from '@/services/terrenos';
import type { Localizacao, TerrenoOutput } from '@/types/api';
import { CULTURA_COM_DIAGNOSTICO, paramsDoDiagnostico } from '@/utils/diagnostico';

import CartaoProximidade from './componentes/CartaoProximidade';
import { CabecalhoFolha, DetalheRegistro, ListaRegistros, ResumoArea, ResumoPanorama } from './componentes/ConteudoFolha';
import FiltrosDoenca from './componentes/FiltrosDoenca';
import MapaRegiao from './componentes/MapaRegiao';
import {
  CENTRO_PADRAO,
  DIAS_ALERTA,
  LIMIAR_PANORAMA,
  LIMITE_DE_PONTOS,
  RAIO_ALERTA_KM,
  ZOOM_INICIAL,
} from './constantes';
import { areaDaRegiao, separarPorPrecisao, terrenoMaisProximo } from './geografia';
import { useProximidade, useRegistrosDaArea } from './hooks';
import type { Area, Filtros, GrupoAproximado, Periodo, RegistroPublico, ResumoMunicipio } from './tipos';

type Selecao = { tipo: 'registro'; registro: RegistroPublico } | { tipo: 'grupo'; grupo: GrupoAproximado } | null;

const ALTURA_RECOLHIDA = 230;
// Zoom que mostra o raio de 15 km inteiro.
const ZOOM_DO_RAIO = (RAIO_ALERTA_KM * 2.4) / 111;
const ZOOM_DO_MUNICIPIO = 0.25;
const SEM_TERRENOS: TerrenoOutput[] = [];

const useEstilos = criarEstilos((t) => ({
  tela: { flex: 1, backgroundColor: t.cores.superficieSuave },
  topo: { position: 'absolute', left: 0, right: 0, gap: t.espaco.sm },
  cartao: { paddingHorizontal: t.espaco.lg },
}));

/**
 * Mapa público de registros. Junta os dados (fonte desacoplada, ver
 * fonte.ts), o estado da tela e os componentes, que só desenham.
 */
export default function TelaMapa() {
  const router = useRouter();
  const estilos = useEstilos();
  const insets = useSafeAreaInsets();
  const mapa = useRef<MapView>(null);

  const { dados: terrenosCarregados } = useDadosDaTela(listarTerrenos);
  const terrenos = terrenosCarregados ?? SEM_TERRENOS;

  // A região inicial é decidida uma vez: o primeiro terreno, ou o centro padrão.
  const [regiaoInicial] = useState<Region>(() => ({
    ...CENTRO_PADRAO,
    latitudeDelta: ZOOM_INICIAL,
    longitudeDelta: ZOOM_INICIAL,
  }));
  const centralizouNoTerreno = useRef(false);
  useEffect(() => {
    const primeiro = terrenos[0];
    if (centralizouNoTerreno.current || !primeiro) return;
    centralizouNoTerreno.current = true;
    mapa.current?.animateToRegion({ ...primeiro.localizacao, latitudeDelta: ZOOM_INICIAL, longitudeDelta: ZOOM_INICIAL }, 0);
  }, [terrenos]);

  const [regiao, setRegiao] = useState<Region>(regiaoInicial);
  const [area, setArea] = useState<Area | null>(() => areaDaRegiao(regiaoInicial));
  const [filtros, setFiltros] = useState<Filtros>({ dias: 30, doenca: 'todas', saudaveis: true });
  const [selecao, setSelecao] = useState<Selecao>(null);
  const [indiceFolha, setIndiceFolha] = useState(0);
  const [terrenoEmFoco, setTerrenoEmFoco] = useState<TerrenoOutput | null>(null);
  const [alturaTela, setAlturaTela] = useState(0);
  const [alturaTopo, setAlturaTopo] = useState(0);

  // Panorama por município: mapa afastado, ou pontos demais para a área.
  const [excesso, setExcesso] = useState(false);
  const panorama = regiao.latitudeDelta > LIMIAR_PANORAMA || excesso;
  const { dados, carregando, erro, demonstracao } = useRegistrosDaArea(area, filtros, panorama);
  useEffect(() => {
    if (dados?.modo === 'pontos' && dados.registros.length > LIMITE_DE_PONTOS) setExcesso(true);
  }, [dados]);

  const registros = dados?.modo === 'pontos' ? dados.registros : null;
  const resumos = dados?.modo === 'panorama' ? dados.resumos : null;
  const { exatos, grupos } = useMemo(() => separarPorPrecisao(registros ?? []), [registros]);

  const proximidades = useProximidade(terrenos);
  const principal = proximidades[0] ?? null;
  const outrosComDoenca = Math.max(0, proximidades.filter((p) => p.total > 0).length - 1);

  const distancia = useCallback(
    (r: RegistroPublico) => terrenoMaisProximo(r.localizacao, terrenos),
    [terrenos],
  );

  // O registro de doença recente mais perto de algum terreno, dentro do raio de alerta.
  const destaque = useMemo(() => {
    if (!registros) return null;
    const desde = Date.now() - DIAS_ALERTA * 86_400_000;
    let melhor: { registro: RegistroPublico; km: number; terreno: TerrenoOutput } | null = null;
    for (const r of registros) {
      if (!r.doenca || Date.parse(r.data_registro) < desde) continue;
      const perto = terrenoMaisProximo(r.localizacao, terrenos);
      if (perto && perto.km <= RAIO_ALERTA_KM && (!melhor || perto.km < melhor.km)) melhor = { registro: r, ...perto };
    }
    return melhor;
  }, [registros, terrenos]);

  // --- Ações ---------------------------------------------------------------------

  const mudarRegiao = useCallback((nova: Region) => {
    setRegiao(nova);
    setArea(areaDaRegiao(nova));
    // Aproximou de novo: volta a tentar os pontos.
    if (nova.latitudeDelta <= LIMIAR_PANORAMA / 2) setExcesso(false);
  }, []);

  const selecionarRegistro = useCallback((registro: RegistroPublico) => {
    setSelecao({ tipo: 'registro', registro });
    setIndiceFolha((i) => Math.max(1, i));
  }, []);

  const selecionarGrupo = useCallback((grupo: GrupoAproximado) => {
    setSelecao({ tipo: 'grupo', grupo });
    setIndiceFolha((i) => Math.max(1, i));
  }, []);

  const selecionarMunicipio = useCallback((resumo: ResumoMunicipio) => {
    setExcesso(false);
    mapa.current?.animateToRegion(
      { ...resumo.centro, latitudeDelta: ZOOM_DO_MUNICIPIO, longitudeDelta: ZOOM_DO_MUNICIPIO },
      400,
    );
  }, []);

  const focarTerreno = useCallback((terreno: TerrenoOutput) => {
    setTerrenoEmFoco(terreno);
    setSelecao(null);
    mapa.current?.animateToRegion({ ...terreno.localizacao, latitudeDelta: ZOOM_DO_RAIO, longitudeDelta: ZOOM_DO_RAIO }, 400);
  }, []);

  const limparSelecao = useCallback(() => {
    setSelecao(null);
    setIndiceFolha(0);
  }, []);

  const mudarDias = useCallback((dias: Periodo) => setFiltros((f) => ({ ...f, dias })), []);
  const verLista = useCallback(() => setIndiceFolha(1), []);

  const diagnosticar = useCallback(
    (terreno: TerrenoOutput) => {
      const soja = terreno.culturas_ativas.find((c) => c.cultura.nome === CULTURA_COM_DIAGNOSTICO);
      if (soja) router.push({ pathname: '/diagnostico/foto', params: paramsDoDiagnostico(terreno, soja) });
    },
    [router],
  );

  // --- Derivados da seleção --------------------------------------------------------

  const registroSelecionado = selecao?.tipo === 'registro' ? selecao.registro : null;
  const distanciaSelecionado = useMemo(
    () => (registroSelecionado ? distancia(registroSelecionado) : null),
    [registroSelecionado, distancia],
  );
  const linha = useMemo(
    (): [Localizacao, Localizacao] | null =>
      registroSelecionado && distanciaSelecionado
        ? [registroSelecionado.localizacao, distanciaSelecionado.terreno.localizacao]
        : null,
    [registroSelecionado, distanciaSelecionado],
  );
  const selecionadoId =
    selecao?.tipo === 'registro' ? selecao.registro.id_registro : selecao?.tipo === 'grupo' ? selecao.grupo.chave : null;

  const alturas = useMemo(
    () =>
      alturaTela > 0
        ? [ALTURA_RECOLHIDA, Math.round(alturaTela * 0.55), Math.round(alturaTela * 0.88)]
        : [ALTURA_RECOLHIDA],
    [alturaTela],
  );
  const indice = Math.min(indiceFolha, alturas.length - 1);
  // Objeto estável: o mapa é memorizado e só redesenha quando algo muda de fato.
  const margens = useMemo(() => ({ topo: alturaTopo, base: alturas[indice]! }), [alturaTopo, alturas, indice]);

  const titulo = erro
    ? 'Não foi possível carregar os registros'
    : !dados
      ? 'Carregando…'
      : resumos
      ? `${resumos.reduce((s, r) => s + r.total, 0)} registros na região`
      : registros
        ? `${registros.length} ${registros.length === 1 ? 'registro' : 'registros'} nesta área`
        : 'Carregando…';

  // --- Conteúdo da folha -------------------------------------------------------------

  let conteudo;
  if (registroSelecionado) {
    const temSoja = distanciaSelecionado?.terreno.culturas_ativas.some((c) => c.cultura.nome === CULTURA_COM_DIAGNOSTICO);
    conteudo = (
      <DetalheRegistro
        registro={registroSelecionado}
        distancia={distanciaSelecionado}
        proximidade={proximidades.find((p) => p.terreno.id_terreno === distanciaSelecionado?.terreno.id_terreno) ?? null}
        onVoltar={limparSelecao}
        onDiagnosticar={temSoja ? diagnosticar : null}
      />
    );
  } else if (selecao?.tipo === 'grupo') {
    const { grupo } = selecao;
    conteudo = (
      <ListaRegistros
        registros={grupo.registros}
        distancia={distancia}
        onSelecionar={selecionarRegistro}
        onVoltar={limparSelecao}
        titulo={`${grupo.registros.length} em ${grupo.municipio.nome}, com localização aproximada`}
      />
    );
  } else if (resumos) {
    conteudo = <ResumoPanorama resumos={resumos} onSelecionar={selecionarMunicipio} />;
  } else if (indice === 0) {
    conteudo = (
      <ResumoArea registros={registros ?? []} destaque={destaque} onSelecionar={selecionarRegistro} onVerLista={verLista} />
    );
  } else {
    conteudo = <ListaRegistros registros={registros ?? []} distancia={distancia} onSelecionar={selecionarRegistro} />;
  }

  return (
    <View style={estilos.tela} onLayout={(e: LayoutChangeEvent) => setAlturaTela(e.nativeEvent.layout.height)}>
      <MapaRegiao
        ref={mapa}
        regiaoInicial={regiaoInicial}
        margens={margens}
        exatos={exatos}
        grupos={grupos}
        resumos={resumos}
        terrenos={terrenos}
        terrenoEmFoco={terrenoEmFoco}
        selecionadoId={selecionadoId}
        linha={linha}
        onSelecionarRegistro={selecionarRegistro}
        onSelecionarGrupo={selecionarGrupo}
        onSelecionarMunicipio={selecionarMunicipio}
        onSelecionarTerreno={focarTerreno}
        onMudarRegiao={mudarRegiao}
        onToqueNoMapa={limparSelecao}
      />

      <View
        style={[estilos.topo, { top: insets.top + 8 }]}
        onLayout={(e: LayoutChangeEvent) => setAlturaTopo(insets.top + 8 + e.nativeEvent.layout.height)}
        pointerEvents="box-none"
      >
        <FiltrosDoenca filtros={filtros} onMudar={setFiltros} />
        {principal && !selecao ? (
          <View style={estilos.cartao}>
            <CartaoProximidade proximidade={principal} outros={outrosComDoenca} onPress={() => focarTerreno(principal.terreno)} />
          </View>
        ) : null}
      </View>

      <Folha
        alturas={alturas}
        indice={indice}
        onMudarIndice={setIndiceFolha}
        cabecalho={
          <CabecalhoFolha
            titulo={titulo}
            carregando={carregando}
            dias={filtros.dias}
            onMudarDias={mudarDias}
            demonstracao={demonstracao}
          />
        }
      >
        {conteudo}
      </Folha>
    </View>
  );
}
