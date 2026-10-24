import type { Localizacao, MunicipioOutput } from '@/types/api';

/** 42.5 → "42,5 ha" */
export const formatarArea = (hectares: number) => `${String(hectares).replace('.', ',')} ha`;

/** "Santa Maria/RS"; nulo quando o ponto está fora de qualquer município. */
export const formatarMunicipio = (municipio: MunicipioOutput | null) =>
  municipio ? `${municipio.nome}/${municipio.uf}` : 'Município não identificado';

/** "-29.68420, -53.80690" (5 casas ≈ 1 m). */
export const formatarCoordenadas = ({ latitude, longitude }: Localizacao) =>
  `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

/** "soja" → "Soja" (o catálogo guarda os nomes em minúsculas). */
export const formatarNomeCultura = (nome: string) => nome.charAt(0).toUpperCase() + nome.slice(1);

/** ISO → "24/10/2026 14:32" no fuso do aparelho. */
export function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

/** 0.6352 → "63,5%" */
export const formatarConfianca = (confianca: number) =>
  `${(confianca * 100).toFixed(1).replace('.', ',')}%`;

/** ISO → "hoje", "ontem", "há 5 dias" (pelo calendário do aparelho). */
export function formatarTempoRelativo(iso: string, agora = new Date()): string {
  const data = new Date(iso);
  const inicioDoDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((inicioDoDia(agora) - inicioDoDia(data)) / 86_400_000);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `há ${dias} dias`;
}
