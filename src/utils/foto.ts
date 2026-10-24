import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// O modelo trabalha com imagens bem menores (128 px no checkpoint atual):
// mandar mais que isto só deixa o envio lento no sinal fraco da lavoura.
const LADO_MAXIMO = 1280;

/**
 * Reduz a foto e regrava como JPEG antes do envio. A regravação também deixa
 * para trás os metadados EXIF da foto original, que podem trazer a
 * coordenada exata de onde ela foi tirada.
 */
export async function prepararFoto(uri: string, largura: number, altura: number): Promise<string> {
  const contexto = ImageManipulator.manipulate(uri);

  // Largura ou altura 0 = o sistema não informou; nesse caso só regrava.
  if (Math.max(largura, altura) > LADO_MAXIMO) {
    contexto.resize(largura >= altura ? { width: LADO_MAXIMO } : { height: LADO_MAXIMO });
  }

  const imagem = await contexto.renderAsync();
  const resultado = await imagem.saveAsync({ compress: 0.8, format: SaveFormat.JPEG });
  return resultado.uri;
}
