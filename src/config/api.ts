// Endereço da API, configurável pelo .env do app (ver .env.example).
// O padrão 10.0.2.2 é o alias que o emulador Android usa para o localhost
// da máquina; num celular físico, use o IP da máquina na rede local.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3080';

// Diagnóstico pela câmera: GPS mais longe que isto do terreno escolhido pede
// confirmação antes de enviar (a foto pode ser de outro terreno).
export const DISTANCIA_MAX_KM = Number(process.env.EXPO_PUBLIC_DISTANCIA_MAX_KM ?? 2);
