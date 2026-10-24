import { Image } from 'expo-image';
import { memo } from 'react';
import { View } from 'react-native';

import { API_URL } from '@/config/api';
import { criarEstilos, Texto, useTema } from '@/design-system';

import { letraDaDoenca } from '../constantes';
import type { RegistroPublico } from '../tipos';

type FotoRegistroProps = {
  registro: RegistroPublico;
  tamanho: number;
};

const useEstilos = criarEstilos((t) => ({
  caixa: { borderRadius: t.raio.md, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
}));

/**
 * Foto do registro, com cache em disco do expo-image (a lista rola sem
 * baixar de novo). Sem foto (dados de demonstração), mostra a letra da doença.
 */
function FotoRegistro({ registro, tamanho }: FotoRegistroProps) {
  const tema = useTema();
  const estilos = useEstilos();
  const cores = registro.doenca ? tema.doenca[registro.doenca.chave] : tema.doenca.saudavel;
  const caixa = [estilos.caixa, { width: tamanho, height: tamanho, backgroundColor: cores.suave }];

  if (registro.foto_url) {
    return (
      <Image
        source={{ uri: `${API_URL}${registro.foto_url}` }}
        style={caixa}
        contentFit="cover"
        cachePolicy="disk"
        recyclingKey={registro.id_registro}
        transition={120}
        accessibilityLabel="Foto da folha"
      />
    );
  }
  return (
    <View style={caixa}>
      <Texto variante="subtitulo" corPersonalizada={cores.cor}>
        {registro.doenca ? letraDaDoenca(registro.doenca.chave) : '✓'}
      </Texto>
    </View>
  );
}

export default memo(FotoRegistro);
