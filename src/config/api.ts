// Endereço da API, configurável pelo .env do app (ver .env.example).
// O padrão 10.0.2.2 é o alias que o emulador Android usa para o localhost
// da máquina; num celular físico, use o IP da máquina na rede local.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3080';
