# Design system do app

> Criado em 2026-10-24, junto com a tela do mapa (etapa 6/7). Código em `src/design-system/`.
> **Demanda aberta:** migrar o resto do app para ele antes da mudança de UI planejada (lista no fim).

## Por que existe

O app vai passar por uma mudança de visual. Para ela custar pouco, nenhuma tela nova escolhe cor, tamanho de fonte, espaçamento ou sombra por conta própria: tudo vem de um **tema**. Mudar o visual é trocar os valores do tema, não editar tela por tela.

## Camadas

```
tokens.ts      valores brutos (paleta, espaços, raios, tipografia, sombras)
   ↓
tema.ts        papéis: "superfície", "texto secundário", "doença: ferrugem", "risco: alto"
   ↓
TemaProvider   entrega o tema por contexto; useTema() e criarEstilos()
   ↓
componentes/   Texto, Botao, Chip, Cartao, Selo, Segmentado, Folha
   ↓
telas          só usam o tema e os componentes (ex: src/features/mapa)
```

- **Tokens não são usados direto pelas telas.** Uma tela pede `tema.cores.textoSecundario`, nunca `paleta.cinza600`. Assim o mesmo papel pode mudar de cor sem caçar ocorrências.
- **Cores com significado são tokens semânticos**: `tema.doenca.ferrugem.cor`, `tema.risco.alto`, `tema.tom.aviso`. O nome e a letra de cada doença ficam no domínio (`features/mapa/constantes.ts`), não no tema.
- **Trocar o tema inteiro** (nova identidade, modo escuro): criar outro objeto `Tema` e passá-lo em `<TemaProvider tema={...}>` no `src/app/_layout.tsx`.

## Como usar numa tela

```tsx
import { criarEstilos, Texto, Botao, useTema } from '@/design-system';

const useEstilos = criarEstilos((t) => ({
  caixa: { padding: t.espaco.lg, gap: t.espaco.sm, backgroundColor: t.cores.superficie },
}));

export default function Exemplo() {
  const estilos = useEstilos();
  return (
    <View style={estilos.caixa}>
      <Texto variante="subtitulo">Título</Texto>
      <Texto variante="rotulo" cor="secundario">Detalhe</Texto>
      <Botao titulo="Salvar" onPress={salvar} />
    </View>
  );
}
```

`criarEstilos` monta o `StyleSheet` **uma vez por tema** (cache), então o custo é o mesmo de um `StyleSheet.create` no topo do arquivo.

## Componentes

| Componente | Para quê |
|---|---|
| `Texto` | todo texto. Variantes: `display`, `titulo`, `subtitulo`, `destaque`, `corpo`, `corpoForte`, `rotulo`, `legenda`, `sobretitulo`. Cores: `texto`, `secundario`, `sobrePrimaria`, `primaria`, `erro` |
| `Botao` | `primario`, `secundario` (contorno) e `texto`; `compacto`; `carregando`; área de toque ≥ 44 px |
| `Chip` | filtro que liga/desliga, com bolinha de cor opcional (cheia ou vazada) e versão flutuante sobre o mapa |
| `Cartao` | bloco com fundo `superficie` ou `suave`, opcionalmente elevado e tocável |
| `Selo` | rótulo de estado: tons `neutro`, `sucesso`, `aviso`, `perigo`, `info` e `risco.*` |
| `Segmentado` | escolha única entre poucas opções (ex: 7/14/30 dias) |
| `Folha` | folha que sobe do rodapé com até 3 alturas; gesto e animação na thread de interface (Reanimated + Gesture Handler) |

## Desempenho (meta: utilizável em celulares atuais, inclusive os de entrada)

- Estilos criados uma vez por tema; componentes de lista e de mapa memorizados (`memo`).
- A `Folha` anima com Reanimated: arrastar não passa pelo JavaScript a cada quadro.
- No mapa, marcadores com visual próprio acompanham mudanças (`tracksViewChanges`) só até o primeiro desenho; acima de 300 pontos, ou com o mapa afastado, a tela troca para o panorama por município.
- Listas com `FlatList` e janela de renderização curta; fotos com cache em disco (`expo-image`).

## Demanda: migrar o resto do app

As telas abaixo ainda usam `src/constants/colors.ts` (`COLORS`), cores escritas no próprio arquivo ou os componentes antigos (`components/Button.tsx`, `TextField.tsx`). Migrar cada uma para `Texto`, `Botao`, `criarEstilos` e o tema, e por fim apagar `COLORS`, `Button` antigo e `constants/theme.ts`/`spacing.ts` se não sobrarem usos.

| Tela / componente | Situação |
|---|---|
| `features/mapa/*`, `(abas)/mapa.tsx`, `(abas)/_layout.tsx` | ✅ no design system |
| `welcome.tsx`, `login.tsx`, `register.tsx`, `components/AuthForm.tsx`, `EscolhaPrivacidade.tsx` | a migrar |
| `(abas)/diagnosticar.tsx`, `(abas)/terrenos.tsx`, `(abas)/perfil.tsx` | a migrar |
| `terreno/*`, `cultura/*`, `components/FormularioTerreno.tsx`, `CamposPlantio.tsx`, `CampoData.tsx`, `TelaFormulario.tsx`, `EstadoTela.tsx`, `EtiquetaCultura.tsx` | a migrar |
| `diagnostico/*`, `registro/[id].tsx`, `diagnosis.tsx`, `camera.tsx`, `culture-selection.tsx`, `CultureCard.tsx`, `CulturaIcone.tsx` | a migrar |
| `components/Button.tsx`, `TextField.tsx` | substituir por `Botao` e um `CampoTexto` novo no design system |
| `src/app/_layout.tsx` (cabeçalhos da pilha usam `COLORS`) | a migrar |
| Template do Expo: `app-tabs*.tsx`, `themed-*.tsx`, `animated-icon*`, `hint-row.tsx`, `external-link.tsx`, `web-badge.tsx`, `ui/collapsible.tsx` | sobra do template, sem uso: apagar |

Faltam no design system para essa migração: **`CampoTexto`** (o `TextField` atual), um **tema escuro** se o novo visual tiver fundo verde nas telas de formulário (como hoje), e ícones padronizados (hoje cada tela importa do `lucide-react-native` com a cor do tema).
