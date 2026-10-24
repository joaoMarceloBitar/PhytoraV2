# v2 — Proposta de atualização

> Consolidado a partir de uma sessão de discussão em rounds (ver histórico de conversa). Todas as decisões abaixo foram revisadas e confirmadas explicitamente antes deste documento ser escrito.

## 1. Objetivo

Transformar o Phytora de uma ferramenta de diagnóstico pontual (foto → resultado, descartado) em uma **rede colaborativa de monitoramento fitossanitário regional**: usuários cadastram terrenos, cada diagnóstico vira um registro georreferenciado visível a outros usuários no mapa, e o sistema cruza esses registros com dados climáticos do INMET para alertar proativamente quem tem terrenos em zonas de risco.

Isso exige, pela primeira vez neste projeto: contas de usuário, um banco de dados persistente (hoje não existe nenhum), geolocalização, e um mapa no app.

## 2. Escopo

### Dentro do escopo

- Reestruturação do backend em camadas (`routes/controllers/services/repositories`) + migração completa para **TypeScript**
- **Postgres + PostGIS** via Docker Compose (ambiente local)
- **Knex** como query builder + sistema de migrations/seeds
- **Zod** para DTOs (validação em runtime + tipos TS inferidos), com `Entity`/`Input DTO`/`Output DTO` separados por recurso
- Autenticação: cadastro, login, **JWT** (access token 15min) + **refresh token rotativo** (30 dias, guardado hasheado em `Sessao`), `bcrypt` para senha
- CRUD de `Terreno`, catálogos `Cultura`/`Doenca`, `Cultura_Plantada`
- Adaptar o fluxo de inferência **já existente** para persistir o resultado como `Registro_Doenca` (hoje a imagem é processada e descartada)
- Armazenamento de fotos em **disco local** do servidor, servido via rota estática do Express, atrás de uma interface (`salvarFoto(buffer) → url`) trocável por S3/R2 depois
- Consulta espacial (`ST_DWithin`, `ST_Distance`) para registros/terrenos próximos
- Mapa no app mobile via `react-native-maps` — **Android apenas** nesta versão
- Migração do app de Expo Go puro para **dev client** (`expo-dev-client`), via `expo run:android` local ou EAS Build
- Integração com o INMET: seed de estações meteorológicas do RS com coordenadas, lookup da estação mais próxima **com dado disponível**, fallback para "clima indisponível" se nenhuma estação num raio de 50km tiver dado recente
- Regra de classificação de risco v1 (baseada em regras, não ML): mesma doença registrada em raio de **15km** nos últimos **7 dias**, cruzada com limiar climático simples — todos os limiares configuráveis via `.env`, não fixos no código
- Notificações geradas no backend e exibidas no app (push via `expo-notifications`, Android)

### Fora do escopo (explicitamente adiado)

- **iOS** — bloqueado sem Mac ou Apple Developer Program (US$ 99/ano); decisão fica para depois, condicionada a investir na conta paga
- Deploy em nuvem/produção — ambiente **local apenas** por enquanto (dev/demo acadêmico)
- "Logout de todos os dispositivos" simultaneamente — só logout do dispositivo atual nesta versão
- Armazenamento em S3/Cloudflare R2 — interface já pronta para trocar depois, sem esforço de migração
- Modelo de ML para classificação de risco — fica regra simples e configurável
- Workspace/monorepo compartilhando tipos entre `Phytora/` e `PhytoraAPI/` — DTOs são espelhados manualmente por enquanto (superfície de API pequena o suficiente para isso ser barato)

## 3. Mudanças por área

### App mobile (`Phytora/`)

- Migrar de Expo Go para dev client (`expo-dev-client` + `expo run:android` local, ou `eas build --profile development --platform android`)
- Novas telas: cadastro, login, lista/criação de terrenos (com captura de localização via GPS), mapa com marcadores de `Registro_Doenca`, lista de notificações
- `culture-selection.tsx` deixa de ser decorativo: passa a vincular a captura a um `Cultura_Plantada` real de um terreno do usuário
- Tokens armazenados via `expo-secure-store` (não `AsyncStorage`)
- `src/services/inference.ts` passa a: incluir header `Authorization` com o access token; enviar `id_terreno`/`id_cultura_plantada`/localização junto da foto para o novo endpoint `/registros`; tratar refresh automático de token em resposta 401
- Tipos DTO espelhados manualmente em `src/types/api.ts`, no mesmo formato dos DTOs do backend (mesma convenção de nomes, ver seção de naming abaixo)
- `react-native-maps` com clustering se o volume de marcadores justificar
- `expo-notifications` para push (Android)
- Tratamento de erro de rede visível ao usuário (hoje só há `console.error`)

### API (`PhytoraAPI/`)

- Migração completa para **TypeScript**, arquivo por arquivo, preservando o comportamento atual — validado por um teste manual ponta a ponta do `/infer` antes/depois de cada etapa da migração
- Reestruturação em camadas:
  ```
  src/
    server.ts        (bootstrap: valida modelo, sobe worker, sobe HTTP)
    app.ts           (montagem do Express)
    config/          (env e caminhos)
    db/
      knexfile.ts
      migrations/    (uma por entidade/alteração de schema)
      seeds/         (01_culturas.ts, 02_doencas.ts, 03_estacoes_inmet.ts)
    routes/
    controllers/
    services/        (regra de negócio, sem contato com DB nem I/O externo)
    repositories/    (query via Knex, único ponto de contato com o DB)
    infra/           (adaptadores externos: worker Python, cliente INMET, storage de fotos)
    middlewares/     (upload, autenticação, tratamento de erros)
    dtos/            (schemas Zod + tipos inferidos, Input/Output por recurso)
    types/           (tipos de domínio)
  ```

  > A camada `infra/` foi acrescentada durante a etapa 0: o worker Python (e, mais adiante,
  > o cliente do INMET e o storage de fotos) é I/O externo — não é regra de negócio
  > (`services/`) nem acesso a banco (`repositories/`), então precisava de um lugar próprio.
- Execução via `tsx` no dia a dia (`npm run dev`), com script de build (`tsc`) separado
- Middleware de autenticação (verifica JWT, injeta usuário autenticado no `request`)
- Serviço de storage de fotos abstraído; implementação inicial = disco local + rota estática `/uploads`
- Serviço de consulta espacial no `repository` (`ST_DWithin`, `ST_Distance`)
- Integração INMET: client HTTP para `apitempo.inmet.gov.br`, seed de estações do RS, lookup de estação mais próxima com fallback (raio máx. 50km, senão clima indisponível e risco cai só no critério de proximidade)
- Serviço de cálculo de risco (regra configurável via `.env`: `RISCO_RAIO_KM=15`, `RISCO_DIAS=7`, limiares climáticos)
- Geração de `Notificacao` quando um novo `Registro_Doenca` aciona zona de risco para terrenos de outros usuários
- `docker-compose.yml` com imagem `postgis/postgis` (Postgres + extensão PostGIS já incluída), volume persistente
- `.env`/`.env.example` com: connection string do DB, `JWT_SECRET`, `PORT`, `MODEL_PATH`, `PYTHON_CMD` (já existentes) + variáveis novas de risco/INMET

#### Convenção de nomes na fronteira da API

`snake_case` em português, ponta a ponta (banco → DTO → JSON → mobile) — ex: `{ "id_terreno": ..., "senha_hash": ... }` — fiel ao modelo de dados já especificado, sem camada de tradução para `camelCase`.

#### Endpoints

```
POST   /auth/registrar
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout

GET    /terrenos                              (do usuário autenticado)
POST   /terrenos
GET    /terrenos/:id
PUT    /terrenos/:id
DELETE /terrenos/:id

GET    /culturas                               (catálogo fixo)
GET    /culturas/:id_cultura/doencas            (catálogo por cultura)

POST   /terrenos/:id_terreno/culturas-plantadas
GET    /terrenos/:id_terreno/culturas-plantadas
PUT    /culturas-plantadas/:id                  (ex: encerrar safra)

POST   /registros                              (foto + inferência + salva + dispara risco/notificação)
GET    /registros?lat=&lng=&raio_km=            (feed pro mapa)
GET    /registros/:id

GET    /notificacoes
PATCH  /notificacoes/:id                        (marcar como lida)
```

### Modelo de IA

Sem mudanças de arquitetura nesta atualização — mantém a CNN atual (4 doenças + folha saudável, treinada para soja). A única mudança é que o resultado da inferência passa a ser **persistido** (como `Registro_Doenca`) em vez de descartado após a resposta.

## 4. Critérios de aceite

- [ ] Usuário consegue se cadastrar e fazer login pelo app, recebendo tokens válidos
- [ ] Access token expira em 15min e é renovado automaticamente via refresh token rotativo, sem exigir novo login
- [ ] Usuário consegue cadastrar um terreno com localização (GPS do device) e associar uma cultura plantada a ele
- [ ] Ao tirar/escolher uma foto e rodar a inferência (fluxo já existente), o resultado é salvo como `Registro_Doenca` vinculado ao terreno/cultura/usuário, com a foto persistida em disco e acessível via URL
- [ ] O mapa no app exibe marcadores de `Registro_Doenca` (do próprio usuário e de outros), com foto e resultado ao tocar
- [ ] Um novo `Registro_Doenca` dispara consulta espacial que encontra terrenos de outros usuários dentro de 15km com a mesma doença nos últimos 7 dias, cruza com dado climático da estação INMET mais próxima (com fallback se não houver estação com dado disponível), e gera `Notificacao` para os donos desses terrenos quando a zona é classificada como risco
- [ ] Usuário recebe notificação push (Android) quando uma `Notificacao` é gerada para ele
- [ ] Toda a API roda em TypeScript, organizada em `routes/controllers/services/repositories/dtos`, sem regressão no endpoint `/infer` existente
- [ ] Ambiente local sobe via `docker-compose` (Postgres+PostGIS) + migrations/seeds do Knex aplicáveis do zero

## 5. Ordem de implementação

Cada etapa é testável isoladamente antes de seguir para a próxima:

0. ✅ **Concluída** — Reestruturar `PhytoraAPI` em camadas + migrar para TypeScript (preservando `/infer` intacto, validado por smoke test manual)
1. ✅ **Concluída** — Configurar Postgres+PostGIS via Docker Compose + Knex (migrations de todas as entidades, seeds de culturas/doenças/estações INMET)
2. ✅ **Concluída** (API e app, validada no emulador do Android Studio) — Sistema de contas e autenticação (cadastro, login, refresh rotativo, middleware de auth) + DTOs Zod
3. ⏸️ **Em stand-by** — Migrar o app mobile de Expo Go para dev client. Só a etapa 9 exige isso (push não funciona no Expo Go do Android); as etapas 4–8 seguem no Expo Go. Retomar antes da etapa 9 (ver 5.1)
4. 🚧 **Implementada, falta validar no emulador** (API validada pelo `smoke-terrenos.http`) — CRUD de Terrenos e Culturas Plantadas (API + telas no app)
5. 🚧 **Implementada, falta validar no emulador** (API validada, decisões em 5.1) — Adaptar o fluxo de inferência existente para persistir `Registro_Doenca` (upload de foto para disco local via storage abstraído)
6. 🚧 **UI antecipada com dados de demonstração** (2026-10-24); falta a API — Endpoint de consulta espacial (registros próximos, terrenos em risco)
7. 🚧 **UI pronta, falta validar num aparelho** (o Google Maps fica em branco no emulador) — Integração com mapa no app (`react-native-maps`, exibir registros)
8. Integração com a API do INMET + lógica de cálculo de zona de risco (a API pública do INMET passou a exigir chave: ver pendências)
9. Sistema de notificações (geração no backend + `expo-notifications` no app). Proposta: dividir em 9a (lista no app, Expo Go) e 9b (push, depois da etapa 3)

Ordem recomendada a partir daqui: 6 → 7 → 8 → 9a → 3 → 9b. Pendências consolidadas em `docs/pendencias.md` do app (lado do app) e da API (lado da API).

## 5.1 Decisões tomadas durante a implementação

Registradas aqui só as que dizem respeito ao app; as da API estão no `docs/v2-proposta.md` do repositório `PhytoraAPI`.

### Etapa 2 — Autenticação (lado do app)

- **Modo convidado mantido**: a "Análise Rápida" continua acessível sem conta — diagnostica, mas não salva nada nem aparece no mapa. Telas de `welcome`/`login`/`register` só existem para quem está deslogado; `home` só para quem está logado (`Stack.Protected` do expo-router).
- **Persistência da conta no aparelho**: o refresh token, o perfil (`nome`, `email`) e um `device_id` ficam no `expo-secure-store` (cifrado pelo Android Keystore, apagado ao desinstalar). O access token fica **só em memória**.
- **Abertura do app sem esperar a rede**: com sessão salva, o app entra logado na hora usando o perfil em cache e confirma com a API em segundo plano. Sem internet, continua logado; só um 401 de verdade (sessão expirada ou revogada) leva de volta ao login.
- **Um refresh por vez**: o cliente HTTP (`src/services/api.ts`) faz todas as requisições que receberem 401 ao mesmo tempo esperarem o mesmo refresh. Dois refreshes com o mesmo token fariam a API tratá-lo como roubado e derrubar a sessão.
- **`device_id` é um UUID gerado na primeira abertura** (via `expo-crypto`), não o ID de hardware do Android — sem permissão extra nem questão de privacidade. Sobrevive ao logout: identifica o aparelho, não a conta.
- **URL da API configurável** por `EXPO_PUBLIC_API_URL` no `.env` (ver `.env.example`); o padrão continua `http://10.0.2.2:3080` (emulador Android).
- **Splash espera a sessão**: além dos 2,5s de imagem, aguarda a verificação da sessão salva; o `index` decide entre `home` e `welcome`.
- **Adiado**: desbloqueio por biometria (`expo-local-authentication`), evolução natural da persistência.

### Etapa 3 — Dev client

- **Em stand-by desde 2026-10-21**: o build local travou em dois bloqueios de ambiente (falta do JDK 17 e inspeção HTTPS do Avast, detalhados abaixo), e nada até a etapa 8 depende do dev client. O `react-native-maps` (etapa 7) já vem embutido no Expo Go; o que o Expo Go não suporta é **push no Android** (removido no SDK 53), necessário só na etapa 9. A chave própria do Google Maps também só vale num build próprio, mas isso importa para publicar, não para desenvolver.
- **O que já foi feito fica**: `expo-dev-client` instalado, package definitivo no `app.json`, `scripts/run-android.js` e as decisões abaixo. Enquanto a etapa estiver parada, o app roda com `npm run start:go`.
- **Para retomar**: instalar o JDK 17, desligar a verificação HTTPS do Avast durante o build e rodar `npm run android`. Plano B, se o build local continuar travando: EAS Build (compila na nuvem, sem JDK na máquina).

- **Build local** (`expo run:android`), não EAS. O EAS fica de plano B; continua sendo o caminho para um futuro build de iOS sem Mac.
- **Identidade definitiva do app**: `com.joaomarcelobitar.phytora`, igual para o `android.package` e o `ios.bundleIdentifier`. A chave do Google Maps (etapa 7) e o Firebase (etapa 9) ficam amarrados a esse nome, então ele não deve mudar.
- **`android/` continua fora do git** e é regenerada por `npx expo prebuild --clean` a partir do `app.json` e dos plugins (CNG). **Nunca editar `android/` à mão**: o próximo prebuild apaga a edição.
- **JDK 21 do Android Studio (JBR) só para o build**, sem mexer no `JAVA_HOME` global da máquina (que é um JDK 25, novo demais para o Gradle do Android). O script `npm run android` escolhe o JBR sozinho. **Também é preciso um JDK 17 instalado**: o plugin Gradle do React Native 0.85 compila com `jvmToolchain(17)`. Sem ele, o Gradle tenta baixar um sozinho pelo plugin foojay 0.5.0, que é incompatível com o Gradle 9, e o erro (`JvmVendorSpec ... IBM_SEMERU`) não diz nada sobre isso.
- **Antivírus com inspeção de HTTPS quebra o build** (`PKIX path building failed`): o Avast reassina as conexões com uma raiz que o Windows aceita, mas o Java não. O JBR não inclui o módulo que lê os certificados do Windows, então a solução é desligar a verificação HTTPS do Avast enquanto o Gradle baixa dependências.
- **Expo Go continua funcionando enquanto der**: o app não usa nenhuma biblioteca nativa fora do Expo Go até a etapa 9 (`react-native-maps` está incluído no Expo Go). Isso mantém o teste gratuito no iPhone. Ao adicionar uma biblioteca nativa nas etapas 4–8, conferir antes se ela roda no Expo Go.
- **Sem variantes de build** (dev e produção lado a lado): ainda não existe build de produção.
- **Código continua multiplataforma**: "Android apenas" é decisão de escopo (falta de Mac e conta Apple), não limitação técnica. Novas bibliotecas devem suportar os dois sistemas.

### Etapa 4 — Terrenos e culturas plantadas (lado do app)

Decidido em rodadas de perguntas (2026-10-21 a 2026-10-23). As decisões de banco e de API estão no `docs/v2-proposta.md` da `PhytoraAPI`.

- **Foco em funcionar, não no visual**: as telas novas usam os componentes que já existem (`COLORS`, `Button`, `TextField`, cabeçalho verde). O visual será adaptado depois.
- **Navegação por abas** na parte de baixo, só para quem está logado: **Início**, **Terrenos** e **Perfil** (nome, email e Sair). O modo convidado não muda.
- **A Análise Rápida e o `culture-selection` não mudam nesta etapa.** Ligar a foto a uma cultura plantada fica para a etapa 5.
- **Localização pelo GPS do aparelho** (`expo-location`, que roda no Expo Go). A tela mostra a precisão ("±35 m") com botão de atualizar, sem precisão mínima obrigatória. "Obtendo localização…" tem limite de 15 s antes de mostrar erro. Escolher o ponto num mapa fica para a etapa 7.
- **GPS negado ou indisponível bloqueia o cadastro**, com explicação e botão para as configurações. Não há digitação manual de coordenadas.
- **Editar a localização**: "usar minha localização atual", com confirmação. O município é recalculado pela API; os registros antigos não mudam.
- **O cadastro exige internet**, com erro claro quando não houver. Fila offline fica como evolução.
- **Fluxo**: o terreno é criado primeiro; a cultura é adicionada na tela de detalhes dele.
- **Lista de terrenos**: nome, município, área e as culturas ativas como etiquetas, em ordem alfabética. Lista vazia mostra um convite para cadastrar. Puxar para atualizar.
- **Detalhes do terreno**: dados, culturas ativas (com botão de encerrar), histórico das encerradas recolhido, e as ações Adicionar cultura, Editar e Excluir. Sem mapa por enquanto.
- **"Excluir" na tela, arquivar na API**: a confirmação avisa que os diagnósticos continuam no mapa. Sem lista de arquivados nem restauração.
- **Cultura plantada**: todas as culturas do catálogo podem ser plantadas, com aviso de que o diagnóstico ainda é só para soja. Data de plantio obrigatória e sem datas futuras. A safra é preenchida pela data (julho a dezembro → `AAAA/AAAA+1`; janeiro a junho → `AAAA-1/AAAA`) e pode ser editada.
- **Ícones de milho e fumo**: ícone genérico de folha até chegarem os próprios. O `CultureCard` deixa de mostrar trigo para milho e soja para as outras culturas.
- **Estados das telas**: indicador de carregamento, tela de erro com "Tentar de novo", e erros de formulário por campo pelo `errosDoFormulario` que já existe.
- **Validação**: roteiro manual no emulador (sem testes automatizados).
- **Adiados**: compartilhar terreno com outros usuários (a tabela `terreno_usuario` já permite), fila offline, escolher o ponto no mapa (etapa 7), talhões, safrinha, e uma segunda opção de inferência com o modelo "JEV" da typesafeAI.

**Decididos durante a implementação**
- **Depois de cadastrar, o app abre o detalhe do terreno** (e não a lista), porque o próximo passo é adicionar a cultura. Voltar leva à lista.
- **Datas digitadas em `DD/MM/AAAA`**, com as barras postas automaticamente. Um seletor de calendário exigiria uma biblioteca nova; fica para a fase do visual.
- **Encerrar cultura tem tela própria** com a data (padrão hoje), para registrar uma colheita feita antes. Editar cultura recebe os dados pelos parâmetros da rota, porque a API não tem GET de uma cultura plantada.
- **Ícones com `lucide-react-native`** (já instalado, sem uso até agora) nas abas e na folha genérica de milho e fumo.
- **Rotas**: abas em `src/app/(abas)/` (`home`, `terrenos`, `perfil`); telas de terreno e cultura em `src/app/terreno/` e `src/app/cultura/`, abrindo por cima das abas com cabeçalho e voltar. A `home` saiu da raiz, mas a rota continua `/home`. O "Sair" foi da home para o Perfil.
- **`expo-location` sem config plugin**: no Android as permissões entram sozinhas, e o texto do plugin só vale para iOS.

### Etapa 5 — Diagnóstico vira registro (lado do app)

Decidido em duas rodadas de perguntas (2026-10-24). As decisões de banco e API estão no `docs/v2-proposta.md` da `PhytoraAPI`.

- **Dois caminhos para diagnosticar e salvar**: "Diagnosticar e salvar" no Início (escolhe terreno e cultura em `diagnostico/escolher`) e "Diagnosticar" em cada soja ativa no detalhe do terreno. Outras culturas aparecem desabilitadas, com "Diagnóstico só para soja".
- **Análise Rápida continua** para todos; para quem está logado, rotulada "Análise rápida (não salva)".
- **Tela da foto** (`diagnostico/foto`): câmera (`ImagePicker.launchCameraAsync`) ou galeria. Da câmera, o app lê o GPS (mesmo `useLocalizacao` dos terrenos) e mostra a precisão e a distância até o terreno; acima de `EXPO_PUBLIC_DISTANCIA_MAX_KM` (2 km) pede confirmação antes de enviar. Sem GPS, avisa que vai usar o ponto do terreno. Da galeria, avisa que usa o ponto do terreno.
- **Envio**: a foto é reduzida para no máximo 1280 px e regravada em JPEG 0,8 (`expo-image-manipulator`, incluído no Expo Go), o que também descarta o EXIF. O cliente HTTP (`api.ts`) passou a aceitar `FormData`, inclusive no reenvio depois de um refresh de token.
- **Falha no envio** mantém a foto na tela, com "Tentar de novo".
- **Resultado**: a `diagnosis.tsx` da Análise Rápida ganhou o modo "salvo": selo "Salvo nos seus diagnósticos" (ou "Salvo como inconclusivo", com a explicação), e os botões "Diagnosticar outra" e "Ver no terreno". O "Voltar para a tela inicial" da Análise Rápida passou a usar `dismissAll`, porque o `welcome` não existe para quem está logado.
- **Histórico**: seção "Diagnósticos" no detalhe do terreno (miniatura, doença, data, confiança) e a tela `registro/[id]`, com a foto grande, município, ponto, origem, top-3 e versão do modelo.
- **Cadastro em duas etapas na mesma tela** (a senha não passa por parâmetro de rota): conta → "Seus diagnósticos no mapa", com o aviso e as duas opções, nenhuma pré-marcada. Erro em nome, email ou senha volta para a primeira etapa.
- **Texto do aviso** (aprovado): doença, foto e data visíveis a todos, nome nunca; "Mostrar o ponto exato" pode revelar a lavoura; "Mostrar só o município" guarda o ponto exato só para os alertas; a mudança no Perfil vale para todos os diagnósticos, inclusive os já feitos.
- **Perfil**: chave "Mostrar só o município". Ligar salva direto; desligar pede confirmação ("Todos os seus diagnósticos, inclusive os antigos, vão passar a mostrar o ponto exato para outras pessoas").

### Etapas 6 e 7 — UI do mapa (antecipada, 2026-10-24)

A tela do mapa foi feita antes da API da etapa 6, a pedido, a partir das propostas de interface (canvas https://claude.ai/artifact/ALFfUymDApEdEPTDGgLEHo). Decidido numa rodada curta:

- **Combinação das três propostas**: mapa com folha deslizante (resumo → lista → registro selecionado), cartão de proximidade do terreno mais afetado no topo, e panorama por município com o mapa afastado. O alerta aberto fica para a etapa 9a.
- **Dados desacoplados**: a tela só conhece a interface `FonteRegistros` (`src/features/mapa/fonte.ts`). Em desenvolvimento ela devolve **dados fictícios** gerados no app (90 registros em volta de Santa Maria, municípios reais), com o selo "Dados de demonstração" na tela; fora do desenvolvimento, vazia. A etapa 6 escreve a implementação que chama a API, sem mexer na UI.
- **Sem clima ainda**: o cartão e o registro mostram só proximidade e frequência ("3 registros de ferrugem a menos de 15 km em 7 dias"). O nível de risco com clima entra na etapa 8.
- **Navegação**: abas **Mapa** (no lugar do Início), **Terrenos**, **Diagnosticar** (no centro, com o antigo conteúdo do Início) e **Perfil**. Alertas entra na 9a. O `index` redireciona para `/mapa`.
- **`react-native-maps`** (1.27.2, incluído no Expo Go; Google Maps no Android, sem chave no Expo Go). No dev client vai precisar de chave própria.
- **Município no anônimo e no panorama**: por enquanto círculo tracejado no centro do município (anônimos agrupados num marcador por município e doença, com a contagem) e, no panorama, um círculo por município com tamanho pela contagem. O contorno real vindo da API é pergunta da rodada da etapa 6.
- **Distância e proximidade calculadas no app**, com os terrenos que ele já tem (`features/mapa/geografia.ts`). Se a etapa 6 decidir calcular na API, só a fonte muda.
- **Design system** criado em `src/design-system/` (tokens → tema → `TemaProvider`/`criarEstilos` → componentes). Só as telas novas o usam; **a migração do resto do app é demanda aberta**, listada em `docs/design-system.md`, e precisa acontecer antes da mudança de UI planejada.
- **Desempenho** (meta: utilizável em celulares atuais): marcadores com `tracksViewChanges` só até o primeiro desenho; panorama acima de 300 pontos ou com o mapa afastado (`LIMIAR_PANORAMA`); folha animada na thread de interface (Reanimated + Gesture Handler); estilos por tema em cache; `FlatList` com janela curta; fotos com cache em disco; estilo de mapa sem comércio e transporte; busca só ao terminar de mover o mapa, com descarte de respostas atrasadas.

## 6. Perguntas em aberto

Nenhuma no momento. Pontos explicitamente adiados para depois (não bloqueiam esta versão): suporte a iOS, deploy em nuvem, logout de todos os dispositivos, storage em S3/R2, modelo de ML para risco.
