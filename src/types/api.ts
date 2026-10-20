// Espelho manual dos DTOs da PhytoraAPI (src/dtos/ de lá). Mesma convenção:
// snake_case em português, sem tradução para camelCase.

// --- Auth ------------------------------------------------------------------

export interface RegistrarInput {
  nome: string;
  email: string;
  senha: string;
  device_id: string;
}

export interface LoginInput {
  email: string;
  senha: string;
  device_id: string;
}

export interface RefreshInput {
  refresh_token: string;
}

export interface UsuarioOutput {
  id_user: string;
  nome: string;
  email: string;
}

export interface AuthOutput {
  access_token: string;
  refresh_token: string;
  usuario: UsuarioOutput;
}

export interface RefreshOutput {
  access_token: string;
  refresh_token: string;
}

// --- Erros -----------------------------------------------------------------

/** Formato de toda resposta de erro da API. */
export interface ErroOutput {
  ok: false;
  error: string;
  detalhes?: { campo: string; mensagem: string }[];
}
