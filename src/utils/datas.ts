// Datas sem hora. Na tela: `DD/MM/AAAA`. Na API: `AAAA-MM-DD`.

const doisDigitos = (n: number) => String(n).padStart(2, '0');

/** Hoje no relógio do aparelho, em `AAAA-MM-DD`. */
export function hojeIso(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

/** `AAAA-MM-DD` → `DD/MM/AAAA`. */
export function paraTela(iso: string): string {
  const [ano, mes, dia] = iso.split('-');
  return `${dia}/${mes}/${ano}`;
}

/** `DD/MM/AAAA` → `AAAA-MM-DD`, ou `null` se não for uma data que existe (ex: 31/02). */
export function paraIso(texto: string): string | null {
  const partes = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto.trim());
  if (!partes) return null;

  const [, dia, mes, ano] = partes.map(Number) as [number, number, number, number];
  const data = new Date(ano, mes - 1, dia);
  const existe =
    data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;

  return existe ? `${ano}-${doisDigitos(mes)}-${doisDigitos(dia)}` : null;
}

/** Põe as barras enquanto o usuário digita: "15102025" → "15/10/2025". */
export function mascararData(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

/**
 * Safra a partir da data de plantio (`AAAA-MM-DD`). A mesma regra da API:
 * julho a dezembro abre a safra do ano (`2025/2026`); janeiro a junho
 * pertence à safra que começou no ano anterior.
 */
export function calcularSafra(dataPlantio: string): string {
  const ano = Number(dataPlantio.slice(0, 4));
  const mes = Number(dataPlantio.slice(5, 7));
  return mes >= 7 ? `${ano}/${ano + 1}` : `${ano - 1}/${ano}`;
}
