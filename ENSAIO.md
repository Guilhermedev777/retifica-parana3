# Ensaio da apresentação — 10 minutos

Banca: **terça-feira, 15 de setembro.** Oito minutos de fala e demonstração,
quase dois de reserva para perguntas.

A ordem segue o peso da rubrica: banco primeiro (4,00), depois tela e lógica
(3,00 cada). O roteiro detalhado do fluxo do dado está em
`ROTEIRO-APRESENTACAO.md`; este arquivo é o cronômetro.

---

## Os 10 minutos, bloco a bloco

### 0:00 — Abertura (40s)

> "É uma dashboard de estoque para o balcão da Retífica Paraná. O dado sai da
> tabela crua, passa por CTEs e funções que limpam e classificam, vira uma view,
> é entregue por uma stored procedure, o PHP só chama a procedure e devolve JSON,
> o TypeScript consome com fetch e calcula, e o DOM desenha. Cada camada faz uma
> coisa só."

Diga a frase inteira **antes** do primeiro clique — ela é o mapa do resto.

### 0:40 — O dado cru vira dado limpo (40s) — CTE, 1,00

```sql
SELECT codigo, nome, quantidade FROM peca LIMIT 3;
SELECT codigo, nome, quantidade, situacao FROM vw_pecas_dashboard LIMIT 3;
```

> "Na tabela o código está em minúsculo e o nome tem espaço sobrando. A primeira
> CTE higieniza com TRIM, UPPER, COALESCE e ABS; a segunda junta categoria e
> fornecedor e já classifica a situação."

### 1:20 — A regra virou função (30s) — Função, 0,50

```sql
SELECT fn_situacao_estoque(0,5), fn_situacao_estoque(3,6), fn_situacao_estoque(40,12);
```

Leia as três saídas em voz alta: `SEM_ESTOQUE`, `CRITICO`, `OK`.
Encaixe aqui, em uma frase: *"e a vw_ficha_peca junta quatro tabelas numa
consulta só."*

### 1:50 — A procedure que a tela usa (50s) — Procedure, 1,00

```sql
CALL sp_listar_pecas('bronzina', 0, '', 10, 0);
```

Abra `api/pecas.php` e mostre a linha `"call sp_listar_pecas(?, ?, ?, ?, ?)"`.

> "Busca, filtro e paginação estão dentro do banco. O PHP não monta SQL."

Se perguntarem do tipo: o PDO devolve `DECIMAL` como texto, por isso o `(float)`.

### 2:40 — Trigger (30s) — 1,00

```sql
UPDATE peca SET quantidade = -7 WHERE codigo='PN-1001';
```

Consulte a peça e mostre o 7 gravado.

### 3:10 — A tela funcionando (1min30)

1. Busca `bronzina` → Filtrar — *"isso foi a procedure."*
2. Por página 10 → Próxima — *"LIMIT e OFFSET dentro da procedure."*
3. Abas Repor / Zeradas — *"isso é `.filter()` no navegador, sem ir ao servidor de novo."*
4. Ranking "Onde o dinheiro está parado" — *"objeto de contagem chave-valor."*
5. Gráfico — *"o `.map()` vira array e o SVG é desenhado a partir dele."*

### 4:40 — CRUD e regra de exclusão (1min) — 1,30 + 0,50

Cadastre uma peça, edite, e tente excluir a `PN-2001` (40 unidades). Leia a
mensagem em voz alta: *"zere a quantidade antes de excluir."*

### 5:40 — O código por dentro (1min20) — Lógica, 3,00

- `src/tipos.ts` — o contrato do JSON, sem nenhum `any` no projeto
- `src/api.ts` — fetch com `async/await` dentro de `try/catch`
- `src/metricas.ts` — `reduce` nos quatro indicadores
- `src/analises.ts` — `filter` nas abas, ranking por contagem, `map` nas linhas e no gráfico
- `auditoria/auditoria.ts` — `fs/promises` com `.then()/.catch()` encadeado; `map` converte `codigo` em `id`, `filter` separa os críticos, `reduce` soma o total

### 7:00 — Quando dá errado (40s) — Edge cases, 0,50

```sql
UPDATE peca SET ativo = 0;   -- mostre o estado vazio
UPDATE peca SET ativo = 1;   -- e volte
```

Rode `tsc` na frente da banca: compila em strict, sem erro.

> **Cuidado:** desligar o MySQL para mostrar o estado de erro custa tempo e
> religar sob pressão é risco. Deixe para quando perguntarem — a resposta pronta
> é: "o try/catch no `api.ts` vira mensagem na tela em vez de quebrar a
> aplicação".

### 7:40 — Fecho (30s)

```sql
CALL sp_resumo_dashboard();
```

> "A procedure de resumo soma em SQL, o TypeScript soma com reduce, e os dois
> chegam ao mesmo número."

Feche citando o que ficou de fora **de propósito**: controle de concorrência e
autenticação. Saber o que falta conta a favor.

### 8:10 — Perguntas (1min50)

Deixe o phpMyAdmin e o editor abertos: quase toda pergunta tem uma tela que
responde. Se não souber, diga que não sabe e diga o que faria para descobrir.

---

## Checklist dos 5 minutos antes

- [ ] XAMPP com Apache e MySQL ligados
- [ ] `api/pecas.php` abre começando com `{"ok":true`
- [ ] Dashboard aberta em `public/index.php`
- [ ] phpMyAdmin no banco `retifica_parana`, em outra aba
- [ ] As quatro consultas já digitadas, prontas para dar Enter
- [ ] Terminal aberto na pasta do projeto, pronto para `tsc`
- [ ] PN-1001 e PN-2001 conferidas com estoque
- [ ] `node auditoria.js` rodado uma vez, funcionando
- [ ] Celular no silencioso e notificações do PC desligadas
- [ ] Água na mesa

Se o banco tiver sido mexido nos testes, reimporte `banco/00_banco_completo.sql`
— ele pode ser reimportado sem erro.

---

## Perguntas prováveis

**Por que procedure em vez de SQL no PHP?**
Centraliza a regra no banco e o PHP fica com uma linha. Busca, filtro e
paginação são resolvidos onde os dados estão.

**Por que exclusão lógica?**
Peça e fornecedor têm histórico; apagar de verdade quebraria movimentações
antigas. Categoria não tem histórico, então é exclusão física — e a regra dela
conta também as peças já excluídas logicamente, que continuam apontando para ela
pela chave estrangeira.

**E se dois usuários mexerem ao mesmo tempo?**
Hoje o último a salvar vence. `atualizado_em` é a base do controle de
concorrência — mapeado como próximo passo, não implementado.

**Por que TypeScript e não JavaScript direto?**
O contrato do JSON fica declarado em `tipos.ts`. Se o PHP mudar um campo, o
compilador acusa antes de rodar.

**Por que a auditoria usa `.then()` e não `async/await`?**
O enunciado pedia o encadeamento explícito. E ele mostra o mecanismo por baixo
do `await`: cada `.then()` devolve uma nova Promise, e por isso um único
`.catch()` no fim cobre leitura, cálculo e escrita.

**E se o `estoque.json` estiver corrompido?**
`JSON.parse` lança dentro do `.then()`, a cadeia rejeita e cai no mesmo
`.catch()`. Dá para provar ao vivo: renomeie o arquivo e rode.

**Por que existe um `map` na auditoria?**
A origem identifica por `codigo` e o contrato `ItemEstoque` pede `id`. O `map`
adapta o dado bruto ao tipo, em vez de o tipo se adaptar ao dado.

**E se cair a internet?**
O Bootstrap vem de CDN, então o visual perde acabamento — mas banco, PHP, JSON e
TypeScript são locais, e o gráfico é SVG desenhado pelo próprio código.

**Qual foi a parte mais difícil?**
A `vw_ficha_peca`. Duas movimentações no mesmo segundo empatavam e duplicavam a
peça; o desempate passou a ser pelo maior `id`.

---

## Do ensaio até a banca

| Dia | O que fazer |
|---|---|
| **Qui 10** | Uma leitura em voz alta, com cronômetro, sem tocar no computador. Anote os dois piores blocos. |
| **Sex 11** | Dois ensaios completos com a máquina ligada. O primeiro pode passar de 10 min; o segundo precisa caber. Corte frase, nunca demonstração. |
| **Sáb 12** | Um ensaio de manhã; o resto do dia é prova. Se couber no tempo duas vezes seguidas, está pronto. |
| **Dom 13** | Cinco minutos só de deixas. Depois, provas. Não mexa no código. |
| **Seg 14** | Ensaio final 2x e teste de máquina do zero: reimportar o banco, abrir a API, `tsc`, `node auditoria.js`. |
| **Ter 15** | Só o checklist dos 5 minutos antes. Chegue cedo e teste o projetor. |

### Regra de ouro

Depois de segunda à noite, **o código está congelado**. Todo defeito que aparece
em apresentação nasceu de uma alteração de última hora — e a rubrica já está
fechada. O que falta agora é falar bem sobre o que já está pronto.
