import { memo, useState, type Ref } from 'react';
import { StyleSheet } from 'react-native';
import MapView, { Circle, Polyline, type MapStyleElement, type Region } from 'react-native-maps';

import { useTema } from '@/design-system';
import type { Localizacao, TerrenoOutput } from '@/types/api';

import { RAIO_ALERTA_KM } from '../constantes';
import type { GrupoAproximado, RegistroPublico, ResumoMunicipio } from '../tipos';
import { MarcadorGrupo, MarcadorMunicipio, MarcadorRegistro, MarcadorTerreno } from './Marcadores';

// Esconde comércio e transporte: menos ruído em volta dos registros e menos
// coisa para o Google Maps desenhar.
const ESTILO_DO_MAPA: MapStyleElement[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

type MapaRegiaoProps = {
  ref?: Ref<MapView>;
  regiaoInicial: Region;
  /** Espaço ocupado pela folha e pelos filtros, para o mapa não esconder nada atrás deles. */
  margens: { topo: number; base: number };
  exatos: RegistroPublico[];
  grupos: GrupoAproximado[];
  /** Preenchido só no panorama (mapa afastado); aí os pontos não aparecem. */
  resumos: ResumoMunicipio[] | null;
  terrenos: TerrenoOutput[];
  /** Terreno com o raio de 15 km desenhado. */
  terrenoEmFoco: TerrenoOutput | null;
  selecionadoId: string | null;
  /** Linha entre o registro selecionado e o terreno do usuário mais perto. */
  linha: [Localizacao, Localizacao] | null;
  onSelecionarRegistro: (registro: RegistroPublico) => void;
  onSelecionarGrupo: (grupo: GrupoAproximado) => void;
  onSelecionarMunicipio: (resumo: ResumoMunicipio) => void;
  onSelecionarTerreno: (terreno: TerrenoOutput) => void;
  onMudarRegiao: (regiao: Region) => void;
  onToqueNoMapa: () => void;
};

/** Só desenha: os dados e a seleção vêm de fora (TelaMapa). */
function MapaRegiao({
  ref,
  regiaoInicial,
  margens,
  exatos,
  grupos,
  resumos,
  terrenos,
  terrenoEmFoco,
  selecionadoId,
  linha,
  onSelecionarRegistro,
  onSelecionarGrupo,
  onSelecionarMunicipio,
  onSelecionarTerreno,
  onMudarRegiao,
  onToqueNoMapa,
}: MapaRegiaoProps) {
  const tema = useTema();
  const maior = resumos ? Math.max(1, ...resumos.map((r) => r.total)) : 1;
  // No Android, aplicar `mapPadding` antes de o Google Maps inicializar
  // derruba o app (setMapPadding numa referência nula). Só depois do onMapReady.
  const [pronto, setPronto] = useState(false);

  return (
    <MapView
      ref={ref}
      style={StyleSheet.absoluteFill}
      initialRegion={regiaoInicial}
      onRegionChangeComplete={onMudarRegiao}
      onPress={onToqueNoMapa}
      onMapReady={() => setPronto(true)}
      customMapStyle={ESTILO_DO_MAPA}
      mapPadding={pronto ? { top: margens.topo, bottom: margens.base, left: 0, right: 0 } : undefined}
      showsUserLocation
      showsMyLocationButton={false}
      toolbarEnabled={false}
      moveOnMarkerPress={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      {terrenoEmFoco ? (
        <Circle
          center={terrenoEmFoco.localizacao}
          radius={RAIO_ALERTA_KM * 1000}
          strokeColor={tema.mapa.raio}
          strokeWidth={2}
          fillColor={tema.mapa.raioFundo}
          lineDashPattern={[14, 10]}
        />
      ) : null}

      {linha ? (
        <Polyline coordinates={linha} strokeColor={tema.mapa.linha} strokeWidth={3} lineDashPattern={[8, 8]} />
      ) : null}

      {resumos
        ? resumos.map((resumo) => (
            <MarcadorMunicipio key={resumo.municipio.codigo_ibge} resumo={resumo} maior={maior} onPress={onSelecionarMunicipio} />
          ))
        : null}

      {!resumos
        ? grupos.map((grupo) => (
            <MarcadorGrupo
              key={grupo.chave}
              grupo={grupo}
              selecionado={selecionadoId === grupo.chave}
              onPress={onSelecionarGrupo}
            />
          ))
        : null}

      {!resumos
        ? exatos.map((registro) => (
            <MarcadorRegistro
              key={registro.id_registro}
              registro={registro}
              selecionado={selecionadoId === registro.id_registro}
              onPress={onSelecionarRegistro}
            />
          ))
        : null}

      {terrenos.map((terreno) => (
        <MarcadorTerreno key={terreno.id_terreno} terreno={terreno} onPress={onSelecionarTerreno} />
      ))}
    </MapView>
  );
}

export default memo(MapaRegiao);
