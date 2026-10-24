import { House } from 'lucide-react-native';
import { memo, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Circle, Marker } from 'react-native-maps';

import { criarEstilos, Texto, useTema } from '@/design-system';
import type { Tema } from '@/design-system';
import type { TerrenoOutput } from '@/types/api';

import { letraDaDoenca, RAIO_APROXIMADO_M } from '../constantes';
import type { GrupoAproximado, RegistroPublico, ResumoMunicipio } from '../tipos';

/**
 * Marcadores com visual próprio são caros no Android quando ficam
 * acompanhando mudanças (`tracksViewChanges`): o mapa redesenha cada um a
 * cada quadro. Aqui eles acompanham só até o primeiro desenho, ou logo depois
 * de mudar de estado (ex: selecionado), e então congelam.
 */
function useDesenhoEstavel(estado: unknown): boolean {
  const [acompanhar, setAcompanhar] = useState(true);
  useEffect(() => {
    setAcompanhar(true);
    const t = setTimeout(() => setAcompanhar(false), 500);
    return () => clearTimeout(t);
  }, [estado]);
  return acompanhar;
}

const corDoRegistro = (tema: Tema, doenca: RegistroPublico['doenca']) =>
  doenca ? tema.doenca[doenca.chave].cor : tema.doenca.saudavel.cor;

const useEstilos = criarEstilos((t) => ({
  ponto: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: t.cores.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selecionado: { width: 40, height: 40, borderRadius: 20, borderWidth: 3 },
  saudavel: { backgroundColor: t.cores.superficie, borderWidth: 2 },
  vazado: { backgroundColor: t.cores.superficie, borderStyle: 'dashed' },
  contador: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: t.cores.texto,
    alignItems: 'center',
    justifyContent: 'center',
  },
  terreno: {
    width: 36,
    height: 36,
    borderRadius: t.raio.md,
    borderWidth: 3,
    borderColor: t.cores.superficie,
    backgroundColor: t.mapa.terreno,
    alignItems: 'center',
    justifyContent: 'center',
  },
  municipio: {
    borderRadius: t.raio.pilula,
    borderWidth: 3,
    borderColor: t.cores.superficie,
    backgroundColor: t.mapa.grupo,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// --- Registro com ponto exato ------------------------------------------------

type MarcadorRegistroProps = {
  registro: RegistroPublico;
  selecionado: boolean;
  onPress: (registro: RegistroPublico) => void;
};

export const MarcadorRegistro = memo(function MarcadorRegistro({ registro, selecionado, onPress }: MarcadorRegistroProps) {
  const tema = useTema();
  const estilos = useEstilos();
  const acompanhar = useDesenhoEstavel(selecionado);
  const cor = corDoRegistro(tema, registro.doenca);

  return (
    <Marker
      coordinate={registro.localizacao}
      onPress={() => onPress(registro)}
      tracksViewChanges={acompanhar}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={selecionado ? 10 : 1}
      accessibilityLabel={registro.doenca?.nome ?? 'Folha saudável'}
    >
      {registro.doenca ? (
        <View style={[estilos.ponto, selecionado && estilos.selecionado, { backgroundColor: cor }]}>
          <Texto variante={selecionado ? 'destaque' : 'rotulo'} cor="sobrePrimaria" style={{ fontWeight: '700' }}>
            {letraDaDoenca(registro.doenca.chave)}
          </Texto>
        </View>
      ) : (
        <View style={[estilos.ponto, estilos.saudavel, selecionado && estilos.selecionado, { borderColor: cor }]}>
          <Texto variante="rotulo" corPersonalizada={cor} style={{ fontWeight: '700' }}>
            ✓
          </Texto>
        </View>
      )}
    </Marker>
  );
});

// --- Registros anônimos: um marcador por município e doença ------------------

type MarcadorGrupoProps = {
  grupo: GrupoAproximado;
  selecionado: boolean;
  onPress: (grupo: GrupoAproximado) => void;
};

export const MarcadorGrupo = memo(function MarcadorGrupo({ grupo, selecionado, onPress }: MarcadorGrupoProps) {
  const tema = useTema();
  const estilos = useEstilos();
  const acompanhar = useDesenhoEstavel(selecionado);
  const cores = grupo.doenca ? tema.doenca[grupo.doenca.chave] : tema.doenca.saudavel;
  const total = grupo.registros.length;

  return (
    <>
      <Circle
        center={grupo.centro}
        radius={RAIO_APROXIMADO_M}
        strokeColor={cores.cor}
        strokeWidth={2}
        fillColor={`${cores.cor}1F`}
        lineDashPattern={[10, 8]}
      />
      <Marker
        coordinate={grupo.centro}
        onPress={() => onPress(grupo)}
        tracksViewChanges={acompanhar}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={selecionado ? 10 : 2}
        accessibilityLabel={`${total} registro(s) com localização aproximada em ${grupo.municipio.nome}`}
      >
        <View style={[estilos.ponto, estilos.vazado, selecionado && estilos.selecionado, { borderColor: cores.cor }]}>
          <Texto variante="rotulo" corPersonalizada={cores.cor} style={{ fontWeight: '700' }}>
            {grupo.doenca ? letraDaDoenca(grupo.doenca.chave) : '✓'}
          </Texto>
          {total > 1 ? (
            <View style={estilos.contador}>
              <Texto variante="legenda" cor="sobrePrimaria" style={{ fontWeight: '700' }}>
                {total}
              </Texto>
            </View>
          ) : null}
        </View>
      </Marker>
    </>
  );
});

// --- Terreno do próprio usuário -----------------------------------------------

type MarcadorTerrenoProps = {
  terreno: TerrenoOutput;
  onPress: (terreno: TerrenoOutput) => void;
};

export const MarcadorTerreno = memo(function MarcadorTerreno({ terreno, onPress }: MarcadorTerrenoProps) {
  const tema = useTema();
  const estilos = useEstilos();
  const acompanhar = useDesenhoEstavel(terreno.id_terreno);
  return (
    <Marker
      coordinate={terreno.localizacao}
      onPress={() => onPress(terreno)}
      tracksViewChanges={acompanhar}
      anchor={{ x: 0.5, y: 0.5 }}
      zIndex={5}
      title={terreno.nome}
      accessibilityLabel={`Seu terreno ${terreno.nome}`}
    >
      <View style={estilos.terreno}>
        <House size={18} color={tema.cores.textoSobrePrimaria} />
      </View>
    </Marker>
  );
});

// --- Panorama: contagem por município -----------------------------------------

type MarcadorMunicipioProps = {
  resumo: ResumoMunicipio;
  maior: number;
  onPress: (resumo: ResumoMunicipio) => void;
};

export const MarcadorMunicipio = memo(function MarcadorMunicipio({ resumo, maior, onPress }: MarcadorMunicipioProps) {
  const estilos = useEstilos();
  const acompanhar = useDesenhoEstavel(resumo.total);
  // Área do círculo proporcional à contagem, entre 32 e 64 px de diâmetro.
  const tamanho = Math.round(32 + 32 * Math.sqrt(resumo.total / Math.max(1, maior)));

  return (
    <Marker
      coordinate={resumo.centro}
      onPress={() => onPress(resumo)}
      tracksViewChanges={acompanhar}
      anchor={{ x: 0.5, y: 0.5 }}
      accessibilityLabel={`${resumo.total} registros em ${resumo.municipio.nome}`}
    >
      <View style={[estilos.municipio, { width: tamanho, height: tamanho }]}>
        <Texto variante="corpoForte" cor="sobrePrimaria">
          {resumo.total}
        </Texto>
      </View>
    </Marker>
  );
});
