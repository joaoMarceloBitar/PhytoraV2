import { useState } from 'react';

import CampoData from '@/components/CampoData';
import TextField from '@/components/TextField';
import { calcularSafra, hojeIso, paraIso, paraTela } from '@/utils/datas';

/**
 * Estado da data de plantio e da safra. A safra acompanha a data enquanto o
 * usuário não a editar à mão; depois disso, fica como ele escreveu.
 */
export function usePlantio(inicial?: { data_plantio: string; safra: string }) {
  const dataInicial = inicial?.data_plantio ?? hojeIso();
  const [dataTexto, setDataTexto] = useState(paraTela(dataInicial));
  const [safra, setSafra] = useState(inicial?.safra ?? calcularSafra(dataInicial));
  // Uma safra salva que não bate com a regra foi escolhida pelo usuário.
  const [safraManual, setSafraManual] = useState(
    inicial ? inicial.safra !== calcularSafra(inicial.data_plantio) : false,
  );

  function mudarData(texto: string) {
    setDataTexto(texto);
    const iso = paraIso(texto);
    if (iso && !safraManual) setSafra(calcularSafra(iso));
  }

  function mudarSafra(texto: string) {
    setSafra(texto);
    setSafraManual(true);
  }

  /** Dados prontos para a API, ou o erro do campo de data. */
  function validar():
    | { ok: true; dados: { data_plantio: string; safra: string } }
    | { ok: false; erro: string } {
    const iso = paraIso(dataTexto);
    if (!iso) return { ok: false, erro: 'Data inválida. Use o formato DD/MM/AAAA.' };
    return { ok: true, dados: { data_plantio: iso, safra: safra.trim() } };
  }

  return { dataTexto, mudarData, safra, mudarSafra, validar };
}

type CamposPlantioProps = {
  plantio: ReturnType<typeof usePlantio>;
  erros: Record<string, string>;
};

export default function CamposPlantio({ plantio, erros }: CamposPlantioProps) {
  return (
    <>
      <CampoData
        label="Data de plantio"
        value={plantio.dataTexto}
        onChangeText={plantio.mudarData}
        erro={erros.data_plantio}
      />
      <TextField
        label="Safra"
        value={plantio.safra}
        onChangeText={plantio.mudarSafra}
        erro={erros.safra}
        placeholder="2025/2026"
        keyboardType="numbers-and-punctuation"
        maxLength={9}
      />
    </>
  );
}
