// Dados FICTÍCIOS para desenvolver a tela do mapa antes da API da etapa 6.
// Só são usados em modo de desenvolvimento (ver fonte.ts), e a tela mostra o
// aviso "dados de demonstração". Os municípios e seus centros são reais
// (tabela `municipio` da API); os registros não.

import type { ChaveDoenca } from '@/design-system';
import type { Localizacao, MunicipioOutput } from '@/types/api';

import { DOENCAS } from './constantes';
import type { FonteRegistros } from './fonte';
import type { Area, Filtros, RegistroPublico, ResumoMunicipio } from './tipos';

type MunicipioDemo = MunicipioOutput & { centro: Localizacao; peso: number };

const MUNICIPIOS: MunicipioDemo[] = [
  { codigo_ibge: '4316907', nome: 'Santa Maria', uf: 'RS', centro: { latitude: -29.7768, longitude: -53.7713 }, peso: 6 },
  { codigo_ibge: '4310538', nome: 'Itaara', uf: 'RS', centro: { latitude: -29.5615, longitude: -53.7677 }, peso: 2 },
  { codigo_ibge: '4320651', nome: 'Silveira Martins', uf: 'RS', centro: { latitude: -29.6387, longitude: -53.5489 }, peso: 2 },
  { codigo_ibge: '4319125', nome: 'São Martinho da Serra', uf: 'RS', centro: { latitude: -29.474, longitude: -53.8877 }, peso: 1 },
  { codigo_ibge: '4306379', nome: 'Dilermando de Aguiar', uf: 'RS', centro: { latitude: -29.8082, longitude: -54.115 }, peso: 2 },
  { codigo_ibge: '4315503', nome: 'Restinga Sêca', uf: 'RS', centro: { latitude: -29.8004, longitude: -53.4145 }, peso: 1 },
  { codigo_ibge: '4318432', nome: 'São João do Polêsine', uf: 'RS', centro: { latitude: -29.641, longitude: -53.4697 }, peso: 1 },
  { codigo_ibge: '4310751', nome: 'Ivorá', uf: 'RS', centro: { latitude: -29.5107, longitude: -53.5832 }, peso: 1 },
  { codigo_ibge: '4319406', nome: 'São Pedro do Sul', uf: 'RS', centro: { latitude: -29.6037, longitude: -54.1962 }, peso: 1 },
];

const TOTAL = 90;
const DIA_MS = 86_400_000;

/** Gerador pseudoaleatório com semente: os mesmos dados a cada abertura. */
function mulberry32(semente: number) {
  let a = semente;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gerar(): (RegistroPublico & { municipioDemo: MunicipioDemo })[] {
  const aleatorio = mulberry32(2026);
  const pesoTotal = MUNICIPIOS.reduce((s, m) => s + m.peso, 0);
  const agora = Date.now();

  const escolherMunicipio = () => {
    let r = aleatorio() * pesoTotal;
    for (const m of MUNICIPIOS) {
      r -= m.peso;
      if (r <= 0) return m;
    }
    return MUNICIPIOS[0]!;
  };

  // Ferrugem é a mais comum na safra; um terço são folhas saudáveis.
  const escolherDoenca = (): ChaveDoenca | null => {
    const r = aleatorio();
    if (r < 0.34) return 'ferrugem';
    if (r < 0.48) return 'mancha_alvo';
    if (r < 0.58) return 'mosaico';
    if (r < 0.68) return 'septoria';
    return null;
  };

  return Array.from({ length: TOTAL }, (_, i) => {
    const municipio = escolherMunicipio();
    const chave = escolherDoenca();
    const anonimo = aleatorio() < 0.3;
    // Mais registros recentes que antigos.
    const diasAtras = Math.floor(aleatorio() ** 1.4 * 30);
    return {
      id_registro: `demo-${i}`,
      doenca: chave ? { chave, nome: DOENCAS.find((d) => d.chave === chave)!.nome } : null,
      cultura: 'soja',
      data_registro: new Date(agora - diasAtras * DIA_MS - aleatorio() * DIA_MS).toISOString(),
      confianca: 0.6 + aleatorio() * 0.37,
      foto_url: null,
      precisao: anonimo ? 'municipio' : 'exato',
      localizacao: anonimo
        ? municipio.centro
        : {
            latitude: municipio.centro.latitude + (aleatorio() - 0.5) * 0.12,
            longitude: municipio.centro.longitude + (aleatorio() - 0.5) * 0.14,
          },
      municipio: { codigo_ibge: municipio.codigo_ibge, nome: municipio.nome, uf: municipio.uf },
      municipioDemo: municipio,
    };
  });
}

// Gerados uma vez, na primeira consulta.
let registros: ReturnType<typeof gerar> | null = null;

const dentro = (area: Area, p: Localizacao) =>
  p.latitude <= area.norte && p.latitude >= area.sul && p.longitude <= area.leste && p.longitude >= area.oeste;

function filtrar(area: Area, filtros: Filtros) {
  registros ??= gerar();
  const desde = Date.now() - filtros.dias * DIA_MS;
  return registros.filter((r) => {
    if (Date.parse(r.data_registro) < desde) return false;
    if (!dentro(area, r.localizacao)) return false;
    if (r.doenca === null) return filtros.saudaveis;
    return filtros.doenca === 'todas' || r.doenca.chave === filtros.doenca;
  });
}

// Simula a ida e volta da rede, para a tela ser testada com carregamento.
const esperar = () => new Promise((resolver) => setTimeout(resolver, 250));

export const fonteDemonstracao: FonteRegistros = {
  demonstracao: true,

  async buscarRegistros(area, filtros) {
    await esperar();
    return filtrar(area, filtros).map(({ municipioDemo: _m, ...r }) => r);
  },

  async resumirPorMunicipio(area, filtros) {
    await esperar();
    const porMunicipio = new Map<string, ResumoMunicipio>();
    for (const r of filtrar(area, filtros)) {
      const m = r.municipioDemo;
      const atual = porMunicipio.get(m.codigo_ibge);
      if (atual) atual.total++;
      else porMunicipio.set(m.codigo_ibge, { municipio: r.municipio!, centro: m.centro, total: 1 });
    }
    return [...porMunicipio.values()].sort((a, b) => b.total - a.total);
  },
};
