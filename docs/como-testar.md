# Como testar o app

> Atualizado em 2026-10-24. Cobre as etapas 2, 4 e 5 da v2 e a tela do mapa (com dados de demonstração).
> O que ainda falta validar está em [`pendencias.md`](pendencias.md).

## 1. Subir o ambiente

Três peças, cada uma no seu terminal:

| Peça | Onde | Comando |
|---|---|---|
| Banco (Postgres + PostGIS) | `PhytoraAPI/` | `npm run db:up` (Docker Desktop aberto). Primeira vez: `npm run migrate && npm run seed` |
| API | `PhytoraAPI/` | `npm run dev`. O `.env` precisa de `JWT_SECRET` e de `PYTHON_CMD` apontando para o Python do `.venv` (ex: `./.venv/Scripts/python.exe`) |
| App (Metro) | `Phytora/` | `npm run start:go` e, no terminal, `a` para abrir no emulador |

- **Sempre `start:go`**, nunca `npm start`: como o `expo-dev-client` está instalado, o `npm start` gera um QR de dev client, que só abre num build próprio (etapa 3, em stand-by) e no celular aparece como "abrir com o Chrome".
- **Endereço da API no app** (`EXPO_PUBLIC_API_URL`): crie `Phytora/.env` a partir do `.env.example`. O nome precisa ser exatamente `.env` (um `phytora.env` é ignorado). Variáveis `EXPO_PUBLIC_*` só são lidas quando o Metro inicia: reinicie depois de mudar.
  - Só emulador: `http://10.0.2.2:3080` (o padrão).
  - Celular físico (e também o emulador): o IP do computador no Wi-Fi, ex: `http://192.168.1.73:3080`.
- **Memória**: emulador, Docker, API e Metro juntos já derrubaram processos nesta máquina. Feche o que não estiver usando.

## 2. Onde rodar

| Aparelho | Situação |
|---|---|
| **Emulador Android** (`Pixel_7_2`, API 35, Google Play) | ✅ Roda o app. **O Google Maps fica em branco** (ver abaixo) |
| **Celular Android** | Deve funcionar: o Expo Go do Android aceita instalar a versão do SDK 56 (expo.dev/go). Precisa da rede liberada (ver abaixo) |
| **iPhone** | ❌ Não abre: o Expo Go da App Store está no **SDK 58** e o projeto no 56; cada Expo Go roda um único SDK, e no iOS não dá para instalar um antigo. Resolver = atualizar o projeto para o SDK 58 (decisão pendente) |

### Problemas conhecidos do ambiente

- **Mapa em branco no emulador.** O app abre e a tela do mapa funciona (filtros, folha, contagens, cartão de proximidade), mas o Google Maps não desenha nem ruas nem marcadores. Um `MapView` puro, sem nenhum código do Phytora, também fica em branco, então o problema é do emulador e não do código. Já descartado: placa de vídeo (renderização por software não mudou nada), rede básica, relógio, proxy e o Avast (o Windows recebe o certificado verdadeiro do Google). O Google Maps do emulador registra timeouts ao falar com os servidores do Google. A tentar: atualizar o Google Play Services pela Play Store do emulador; desligar temporariamente o Escudo da Web do Avast e reiniciar o emulador; um emulador com imagem "Google APIs".
- **Celular não alcança o computador.** O Wi-Fi está como rede **Pública** no Windows e não há regra liberando o Node. Para um celular físico: mudar o perfil da rede para **Privada** (Configurações → Rede e Internet → Wi-Fi) e permitir o Node.js quando o Windows perguntar, ou, num PowerShell como administrador:
  ```powershell
  New-NetFirewallRule -DisplayName "Phytora dev (Metro e API)" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8081,3080 -Profile Private,Public
  ```
  Teste: no navegador do celular, `http://<IP>:3080/culturas` deve mostrar o JSON das culturas.
- **IP errado no QR.** Com placas virtuais (VMware, WSL, Radmin VPN), o Metro pode anunciar o IP errado. Force o do Wi-Fi: `$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.73"; npm run start:go`.
- **GPS do emulador.** Ajuste em ⋯ → Location (ex: Santa Maria/RS, -29.6842, -53.8069) antes de cadastrar terrenos; a posição padrão é nos EUA e o município sai nulo.

## 3. Testes da API (sem o app)

Roteiros manuais com a extensão REST Client do VS Code, em `PhytoraAPI/scripts/`: `smoke-auth.http`, `smoke-terrenos.http` e `smoke-registros.http` (este precisa de uma foto de folha em `scripts/folha-teste.jpg`). Todos passaram na implementação; o `/infer` deve continuar respondendo `septoria`, 0,6352, com a imagem de referência.

## 4. Roteiros do app

Crie uma conta nova para cada rodada; o banco tem contas dos testes da API.

### Cadastro, conta e Perfil (etapas 2 e 5)
1. Cadastro em duas telas: tentar avançar sem escolher a opção de privacidade → erro; escolher e criar.
2. Perfil mostra nome, email e a chave "Mostrar só o município". Desligar pede confirmação; ligar salva direto.
3. Sair volta para a tela inicial; entrar de novo mantém a escolha.

### Terrenos e culturas (etapa 4)
1. Aba Terrenos vazia mostra o convite.
2. Cadastrar terreno: permissão de localização → "Obtendo localização…" → coordenadas com a precisão → salvar abre o detalhe, com o município certo.
3. Negar a permissão: explicação e botão "Permitir"/"Abrir configurações"; salvar bloqueado.
4. Nome repetido (mesmo em maiúsculas) → erro.
5. Adicionar milho → aviso de que o diagnóstico é só para soja e ícone de folha. Mudar a data → a safra acompanha. Data futura → erro no campo.
6. A mesma cultura ativa duas vezes → erro.
7. Editar cultura; encerrar com data anterior ao plantio → erro; encerrar com hoje → vai para o Histórico.
8. Editar terreno com "Usar minha localização atual" (mude o GPS do emulador para outra cidade antes) → município recalculado.
9. Excluir → confirmação → some da lista. Lista em ordem alfabética, com etiquetas de cultura; puxar para atualizar funciona.
10. Com a API parada, salvar → erro de conexão, sem travar.

### Diagnóstico salvo (etapa 5)
1. Aba Diagnosticar → "Diagnosticar e salvar" → escolher terreno e soja (outras culturas aparecem desabilitadas).
2. Câmera: aparece a precisão do GPS e a distância até o terreno; enviar → resultado com o selo "Salvo".
3. Galeria: aviso de que usa a localização do terreno.
4. GPS longe do terreno (mude a localização do emulador) → pede confirmação antes de enviar.
5. API parada → a foto continua na tela com "Tentar de novo".
6. No detalhe do terreno, seção "Diagnósticos" → abrir um registro com a foto grande.
7. "Análise rápida (não salva)" continua funcionando.
8. **EXIF**: depois de salvar uma foto, na pasta da API:
   ```
   ./.venv/Scripts/python.exe -c "import glob,os;from PIL import Image;f=max(glob.glob('.runtime/fotos/**/*.jpg',recursive=True),key=os.path.getmtime);print(f,dict(Image.open(f).getexif()))"
   ```
   A saída deve terminar em `{}` (foto sem metadados). Se não, a API precisa limpar o EXIF (decisão Q8 da etapa 5).

### Mapa (UI das etapas 6 e 7, dados de demonstração)
Precisa de um aparelho onde o Google Maps desenhe (ver "Onde rodar"). Os registros são fictícios, gerados no app, em volta de Santa Maria; a tela mostra o selo "Dados de demonstração".
1. Marcadores com cor e letra por doença; saudáveis vazados; anônimos como círculo tracejado no centro do município, com a contagem.
2. Filtros de doença e "Saudáveis"; período 7/14/30 dias na folha.
3. Folha: arrastar entre as três alturas; resumo → lista (recentes primeiro, por distância) → registro.
4. Tocar num registro: linha até o seu terreno mais perto, distância, "ponto exato" ou "só o município", e "Diagnosticar a <terreno>" se ele tiver soja.
5. Cartão de proximidade no topo (terreno com soja perto de Santa Maria) → toque mostra o raio de 15 km.
6. Afastar o mapa → panorama por município; tocar num município aproxima.
7. Desempenho: arrastar o mapa e a folha sem travamentos num celular comum.
