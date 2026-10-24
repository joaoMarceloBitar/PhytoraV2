import type { Localizacao } from '@/types/api';

const RAIO_DA_TERRA_KM = 6371;

const radianos = (graus: number) => (graus * Math.PI) / 180;

/** Distância em km entre dois pontos (fórmula de haversine). */
export function distanciaKm(a: Localizacao, b: Localizacao): number {
  const dLat = radianos(b.latitude - a.latitude);
  const dLng = radianos(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radianos(a.latitude)) * Math.cos(radianos(b.latitude)) * Math.sin(dLng / 2) ** 2;
  return 2 * RAIO_DA_TERRA_KM * Math.asin(Math.sqrt(h));
}

/** 0.35 → "350 m"; 2.4 → "2,4 km" */
export function formatarDistancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace('.', ',')} km`;
}
