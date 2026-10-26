# Handoff: Menus v2 (sidebar + dashboard screens with animated charts)

## Overview
New navigation shell (sidebar + top bar) and five redesigned screens for the "Soccer" Vue project: **Estrutura › Informação básica**, **Preparar jogo › Táticas**, **Preparar jogo › Onze inicial**, **Preparar jogo › Bilhetes**, **Treino › Técnico**. Charts and lists animate on enter.

## About the Design Files
`Menus v2.html` is a **design reference built in plain HTML/CSS/JS** — not production code. Recreate it inside the existing Vue app using its established patterns (router, store, component library, chart lib if any). Open the HTML in a browser to see exact behavior.

## Fidelity
**High-fidelity.** Colors, type, spacing, and animations are final. Data is mock — wire to the app's real data.

## Suggested Vue structure
- `layouts/GameLayout.vue` — grid: sidebar 248px | content; top bar 64px.
- `components/nav/SideMenu.vue` (+ `SideMenuGroup.vue`, `SideMenuItem.vue`) — driven by a `menu` config array (below).
- `components/nav/TopBar.vue`
- `components/ui/` — `Card.vue`, `KpiCard.vue`, `MoneyField.vue`, `PosTag.vue`, `Stars.vue`, `CountUp.vue`, `Toast.vue`
- `components/charts/` — `BarChart.vue`, `DonutChart.vue`, `LineChart.vue` (pure SVG, no lib needed), `Pitch.vue`
- Routes: `/:section/:page` (e.g. `/estrutura/informacao-basica`). Active sidebar state derives from the route.

## Layout
- **App grid:** `grid-template-columns:248px 1fr; grid-template-rows:64px 1fr; height:100vh`. Only `<main>` and the sidebar scroll.
- **Background (body):** `radial-gradient(120% 70% at 55% -10%, oklch(0.62 0.10 140) 0%, oklch(0.42 0.08 150) 35%, oklch(0.24 0.05 165) 75%, oklch(0.16 0.03 170) 100%)`.
- **Brand cell (top-left):** bg `oklch(0.50 0.09 145 / .55)`, Oswald 22px uppercase, letter-spacing .06em. Replace placeholder with the project logo.
- **Sidebar:** bg `linear-gradient(oklch(0.34 0.06 155 / .7), oklch(0.14 0.03 170 / .9))`, padding 10px 12px 16px, gap 3px, hidden scrollbar.
- **Top bar:** bg `oklch(0.55 0.09 140 / .35)`, padding 0 24px. Search field flex:1 max 860px, height 34px, bg `oklch(0.62 0.08 140 / .45)`, radius 4. Icon buttons 38×38 (news, calendar, messages, notifications; red pulsing dot on unread). Club block on the right: crest 38px circle + name (600) + season (11px muted), left border divider.
- **Main:** padding 22px 24px 40px. Breadcrumb: section name 20px/500 muted + right border, section icon 16px, "›", page name 600.

## Sidebar behavior
- Group labels (Clube, Competição, Histórico, Outros): 11px/600 uppercase, letter-spacing .08em, color `--dim`, padding 16px 6px 6px.
- Item: 20px icon + label 15px/600, padding 11px 12px, radius 4, chevron on the right (rotates 45° → -45° when open, .25s).
- **Accordion:** only one item open at a time; clicking the open one closes it. Submenu height animates with `grid-template-rows:0fr → 1fr` (.3s ease) — no JS height measuring.
- Open item bg `oklch(0.5 0.06 150 / .3)`; submenu bg `oklch(0.5 0.06 150 / .18)`; radius joins (4 4 0 0 / 0 0 4 4).
- Sub-link: padding 10px 16px, 500, muted; hover → ink + padding-left 20px (.2s); current → 600 ink, bg `oklch(0.62 0.05 150 / .35)`.
- Footer (pinned bottom, border-top): "Injeção de capital", "Premium" with green badge "ativo até DD/MM/AAAA".
- Persist open item + current page (route already does the page; store open item in localStorage or the store).

### Menu config
```js
[
 {g:'Clube',items:[
  {id:'prep',t:'Preparar jogo',icon:'target',sub:['Próximo adversário','Táticas','Onze inicial','Estilo de jogo','Instruções de jogo','Prémios','Bilhetes']},
  {id:'treino',t:'Treino',icon:'train',sub:['Técnico','Físico','Moral','Treinador de formação','Relatórios']},
  {id:'estr',t:'Estrutura',icon:'shield',sub:['Informação básica','Contratos','Ambiente da equipa','Orçamento','Lesionados','Equipamento','Estádio','Staff','Sócios','Patrocinadores','Contratos de TV','Troféus']}]},
 {g:'Competição',items:[{id:'comp',t:'Competição',icon:'cup',sub:['Classificação','Calendário','Resultados']},{id:'merc',t:'Mercado',icon:'bag',sub:['Pesquisar','Observados','Propostas']}]},
 {g:'Histórico',items:[{id:'est',t:'Estatísticas',icon:'stats',sub:['Jogadores','Equipa','Épocas']}]},
 {g:'Outros',items:[{id:'ger',t:'Geral',icon:'gear',sub:['Definições','Ajuda']}]}
]
```
Adapt labels/ids to the project's existing routes.

## Screens

### Estrutura › Informação básica
1. Row (1.2fr | 1fr, gap 20): **Club card** (crest 54px + name 28px/600; facts list: País, Fundação, Estádio, Lotação, Sócios — each row 8px padding, bottom border `--line`, white 9px bullet) | **Kit card** (club kit image, centered).
2. **4 KPI cards** (auto-fit minmax 190px): Jogadores no clube, Média, Fiabilidade, Idade média. Label 12px muted, value 22px/600 with **count-up**; icon tile 46×46 radius 6 bg `--card2`.
3. **2 money fields** (minmax 320px): label 12px muted; bar bg `oklch(0.48 0.06 150 / .55)`, value 18px/600 (count-up, 2 decimals, en-US grouping), "$" suffix cell bg `oklch(0.38 0.05 155 / .8)`.
4. **3 chart cards** (minmax 260–320px):
   - *Resumo do ano* — monthly bar chart, revenue (positive, `--rev`) above 0, expense (negative, `--exp`) below; y-axis −4M…12M step 4M; legend below.
   - *Receita — últimos 3 meses* — donut, center label "Receita total" + count-up value.
   - *Despesa — últimos 3 meses* — donut, same pattern.

### Preparar jogo › Táticas
Two columns (1fr | 300px). Left: grid 4 cols gap 22 of formation buttons (height 94, 30px/500, bg `--card2`, radius 4). Hover: 1px ink border + translateY(-2px). Selected: border `oklch(0.85 0.15 120)`, glow `0 0 18px oklch(0.85 0.15 120 / .25)`. Right: **Pitch**.
Formations: 5-4-1, 5-3-2, 5-2-2-1, 5-2-1-2, 4-5-1, 4-4-2, 4-4-1-1, 4-3-3, 4-3-2-1, 4-3-1-2, 4-2-4, 4-2-3-1, 4-1-2-2-1, 4-1-2-1-2, 3-5-2, 3-4-3, 3-4-2-1, 3-4-1-2.

### Pitch component
Aspect 64/100, striped grass (`oklch(0.55 0.13 145)` / `oklch(0.51 0.13 145)`, 12 stripes), white 2px lines (boxes, halfway, center circle 28%). 11 position chips absolutely placed in %: 11px/700 white text, radius 2, colors by role: GK `--gk`, DF `--df`, MF `--mf`, FW `--fw`. **Key animation:** keep the same 11 chip elements (keyed by index 0–10) and only change `left/top` + label on formation change → `transition: left .6s, top .6s cubic-bezier(.5,0,.2,1)`. Slot math is in `slots()` in the HTML. Formation is persisted and shared with Onze inicial.

### Preparar jogo › Onze inicial
Two columns (table | pitch). Table cols: POS (role-colored tag 34px), Nome (+ red "lesionado" badge), MÉD, REAL, MOR, FÍS, IDADE (numbers in small chips bg `oklch(0.45 0.05 150 / .6)`), QUAL (5 stars). Row left-edge 3px marker: starters `oklch(0.82 0.16 125)`, bench `oklch(0.80 0.15 85)`, out `--exp`. Rows stagger in.

### Preparar jogo › Bilhetes
1. Card "Assistência nos últimos jogos": line chart (30–70% grid), line **draws itself** (stroke-dashoffset 1→0, 1.4s, pathLength=1), area gradient fades in, points pop in staggered 110ms.
2. Card table: Data, Adversário, Competição, Preço, Receita, Assistência (inline progress bar that fills to %).

### Treino › Técnico
Two columns (300px | 1fr). Left: coach card (photo 96px circle, name 22px/600, Profissão, Entrada, 5 stars). Right: selected player row + **skills grid** 3 cols: label + value + 4px bar filling to value (`--ok`; trained skills `--exp` with reddish label). Bars stagger 25ms each.

## Animations (all on screen enter)
| What | How |
|---|---|
| Screen | fade + blur(4px→0), .35s |
| Cards (`.rise`) | opacity 0→1, translateY 14→0, .55s cubic-bezier(.2,.7,.2,1), delay index×70ms |
| Count-up | rAF, 1200ms, easeOutCubic |
| Bars | scaleY 0→1, transform-box fill-box, origin bottom (positive) / top (negative), .9s, stagger 120ms |
| Donut | each segment's stroke-dasharray 0→len and dashoffset to cumulative, 1.1s, stagger 150ms |
| Line chart | as above |
| Table rows | fade + translateX(-10→0), .4s, stagger 35ms |
| Progress bars | width 0→value%, 1s |
| Toast "Bem-vindo, mister" | slides in from right, 4s progress bar, slides out (4.5s total) |
| Notif dot | pulse ring 2s infinite |
Respect `prefers-reduced-motion` in production (disable delays/transitions).

## State
- `openMenuId` (sidebar accordion), current route section/page.
- `formation` (string, persisted, shared by Táticas/Onze inicial/Pitch).
- Data: club info, KPIs, budget, monthly revenue/expense, revenue/expense breakdowns, squad list, ticket history, coaches, player skills — replace mocks with the app's API/store.

## Design tokens
```
--ink   oklch(0.97 0.01 140)   text
--mute  oklch(0.82 0.03 150)   secondary text
--dim   oklch(0.68 0.03 155)   group labels
--card  oklch(0.30 0.05 155 / .55)  card bg (+ backdrop-filter blur 6px, shadow 0 8px 24px oklch(0.1 0.03 170/.25))
--card2 oklch(0.36 0.06 150 / .6)   inner tiles/buttons
--line  oklch(0.55 0.05 150 / .25)  dividers
--rev   oklch(0.62 0.11 145)   revenue
--exp   oklch(0.66 0.19 25)    expense / alerts / injured
--ok    oklch(0.72 0.17 150)   success / progress
--gk oklch(0.28 0.02 160)  --df oklch(0.55 0.17 255)  --mf oklch(0.52 0.10 170)  --fw oklch(0.60 0.20 25)
```
- Radius: 2 (tags), 4 (items, inputs, buttons), 6 (cards).
- Spacing: grid gaps 20; card padding 18; main padding 22/24.
- Type: **Chakra Petch** (400/500/600/700) for UI; **Oswald** 500/600 for brand only. Sizes: 11, 12, 14 (base), 15, 16, 18, 20, 22, 28, 30.

## Assets
- Icons: inline 24×24 stroke SVGs (2px, round caps) — swap for the project's icon set.
- Placeholders to replace with real assets: brand logo, club crest, kit image, coach photos.

## Files
- `Menus v2.html` — full interactive reference (open in browser; click sidebar items and formations).
