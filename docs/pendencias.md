# Pendências da v2

> Recapitulação em 2026-10-24, no fechamento das etapas 4 e 5 e da UI do mapa. Lista única do que falta, nos dois repositórios.
> Roteiros de teste: [`como-testar.md`](como-testar.md). Plano e decisões: [`v2-proposta.md`](v2-proposta.md). Roadmap visual: https://claude.ai/artifact/3s3tQfMMyu7EYQRJEP9YRf (ainda mostra a etapa 5 como pendente).

## 1. Validar o que já está implementado

| Item | Situação | Como |
|---|---|---|
| Etapa 4 (terrenos e culturas) no app | API validada; app não testado ponta a ponta no emulador | roteiro em `como-testar.md` |
| Etapa 5 (diagnóstico salvo, modo anônimo) no app | API validada (28 passos); app não testado | roteiro em `como-testar.md` |
| EXIF das fotos | esperado sair na regravação do app (Android usa `Bitmap.compress`); não conferido numa foto real | comando em `como-testar.md` |
| **Mapa** | a tela abre e funciona; o crash de `setMapPadding` foi corrigido; **o Google Maps fica em branco no emulador** (problema do emulador, não do código) | celular Android físico, ou consertar o Google Maps do emulador (ver `como-testar.md`) |
| `AuthContext.tsx` | os comentários explicativos (restauração da sessão offline, tratamento do 401) foram apagados numa edição durante a etapa 3; a lógica não mudou | decidir se restaura |

## 2. Etapas da v2

Ordem recomendada: **6 → 7 → 8 → 9a → 3 → 9b**. Cada uma começa com uma rodada de perguntas.

| Etapa | Situação | O que falta |
|---|---|---|
| **6. Consulta espacial** | UI antecipada (com dados de demonstração) | API do feed por área (bbox) e por raio; resumo por município; trocar a `fonteDemonstracao` pela fonte da API em `src/features/mapa/fonte.ts`. Perguntas já levantadas: contorno real do município (anônimo e panorama), distância calculada na API ou no app, período padrão, limite por consulta, seed de demonstração no banco |
| **7. Mapa** | UI pronta | validar num aparelho com mapa funcionando; ajustar o ponto do terreno arrastando o pino (pendente da etapa 4); agrupamento de marcadores só se o volume pedir |
| **8. Clima e risco** | não começada | **fonte de clima**: a API pública do INMET não devolve mais dados horários sem chave (recomendação: Open-Meteo atrás de `infra/clima`, e pedir a chave ao INMET por cadastro.act@inmet.gov.br para comparar); regra por doença (limiares da literatura, configuráveis); cálculo assíncrono após o registro; notificações sem repetir. Os cartões do mapa ganham o nível de risco |
| **9a. Alertas no app** | não começada | lista de notificações, contador de não lidas, marcar como lida. Roda no Expo Go |
| **3. Dev client** (stand-by desde 21/10) | parada | instalar o JDK 17, desligar a verificação HTTPS do Avast durante o build e rodar `npm run android`; plano B: EAS Build. Também: chave própria do Google Maps (`com.joaomarcelobitar.phytora`) |
| **9b. Push** | não começada | precisa da etapa 3; Expo Push + projeto Firebase (credencial FCM); token de push na `sessao` |

## 3. Decisões em aberto (fora das etapas)

- **Atualizar o projeto para o SDK 58.** Libera o iPhone (o Expo Go da loja só roda o SDK 58; desde o 57 ele exige login na mesma conta Expo no app e no terminal). Riscos levantados: React Native 0.85 → 0.88, `react-native-gesture-handler` 2 → 3 (a `Folha` do design system usa a API antiga), `expo-router` com mudanças no núcleo de navegação, `react-native-worklets` 0.8 → 0.13, `react-native-maps` 1.27 → 1.29, `NODE_ENV` mudando qual `.env` é lido, `AGENTS.md` fixado na doc do SDK 56. Sugestão: branch própria, 56 → 57 → 58 em dois passos, depois de validar o que está pronto.
- **Mudança de UI** planejada depois das features. Pré-requisito: a migração do resto do app para o design system (abaixo).

## 4. Dívidas técnicas

- **Migrar o app para o design system** (`docs/design-system.md`): só o mapa e as abas usam o tema; o resto ainda usa `COLORS` e os componentes antigos. Faltam no design system um `CampoTexto` e, talvez, um tema escuro.
- **Arquivos do template do Expo** sem uso (`app-tabs*.tsx`, `themed-*.tsx`, `animated-icon*`, `hint-row.tsx`, `external-link.tsx`, `web-badge.tsx`, `ui/collapsible.tsx`): apagar. O `app-tabs.web.tsx` é a única falha restante do `tsc` (rota `/explore` inexistente).
- **Testes automatizados**: hoje só roteiros manuais (`.http` e `como-testar.md`).
- **Lint**: o script `npm run lint` existe, mas não há configuração de ESLint no projeto.
- **Espelho de tipos**: os DTOs da API são copiados à mão em `src/types/api.ts`; cada mudança de contrato precisa ser repetida.

## 5. Ambiente de desenvolvimento

- Google Maps em branco no emulador (ver acima).
- Wi-Fi como rede Pública no Windows: celulares não alcançam o Metro nem a API.
- `phytora.env` na raiz do app é a configuração com o IP do Wi-Fi, mas o Expo só lê `.env`: renomear para usar.
- Memória da máquina: processos em segundo plano já foram derrubados por falta de memória.
- Docker Desktop precisa ser aberto à mão; o banco usa a porta 5433 (a 5432 é de um PostgreSQL 17 nativo).

## 6. Depois da v2 (já registrado no roadmap)

Visual próprio; compartilhar terreno; fila offline; talhões e safrinha; segundo modelo de diagnóstico (JEV da typesafeAI) e modelos para outras culturas; iOS com build próprio; deploy em nuvem e fotos em S3/R2; sair de todos os aparelhos; limite de tentativas de login; exclusão de conta (LGPD); preferências de alerta; biometria; "ocultar" o próprio registro.
