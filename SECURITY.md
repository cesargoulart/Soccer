# Segurança — estado atual e plano

## O que já está protegido

As regras em `firestore.rules` garantem que, a partir do cliente:

- cada utilizador só escreve nos **seus** dados (`users/{uid}` e subcoleções: `players`, `economy`, etc.);
- na lista de transferências (`transferList`), só o **vendedor** pode criar o anúncio;
- tudo o que não está explicitamente permitido é **bloqueado por defeito**.

Para aplicar as regras:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## O risco que continua em aberto (importante)

A **simulação de jogos corre no browser** (`src/services/matchEngine.js`) e escreve o
resultado diretamente no Firestore. Mesmo com as regras acima, um utilizador
mal-intencionado pode, pela consola do browser:

- forjar o resultado do seu próprio jogo (golos, vitória);
- alterar a sua economia (dinheiro), porque a escrita é feita pelo cliente.

As regras impedem mexer nos dados de **outros** jogadores, mas não impedem o jogador
de falsificar os **seus próprios** resultados — e num jogo competitivo isso é decisivo.

## Plano recomendado (backend autoritativo)

Mover as mutações sensíveis para **Cloud Functions** (servidor), deixando o cliente
apenas a ler:

1. **Simulação no servidor.** Uma Callable Function `simulateMatch(fixtureId)` que:
   - lê os planteis e táticas das duas equipas;
   - usa a lógica pura já extraída (`src/services/teamRatings.ts`: `computeRatings`,
     `goalChance`, `createRng` com semente guardada) para simular de forma
     **determinística e reproduzível**;
   - escreve o resultado e atualiza a economia.
2. **Bloquear escrita direta de resultados/economia no cliente** — passar as
   regras de `fixtures`, `completedFixtures` e `users/{uid}/economy` para
   `allow write: if false` (só o Admin SDK das Functions escreve).
3. **Salários e folha semanal** processados também no servidor (já existe
   `economyStore.payWeeklyWages` no cliente; mover o gatilho para uma função
   agendada — Cloud Scheduler — no fecho da jornada de sábado).

A lógica de jogo já foi separada em funções puras precisamente para poder ser
reutilizada tal-e-qual no servidor, sem reescrever nada.
