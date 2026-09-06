# Roteiro da apresentação

O item da rubrica é **"Comunicação Técnica e Domínio Conceitual"**: explicar com
propriedade o fluxo completo do dado — banco → PHP → JSON → TypeScript → DOM — e
responder à banca com segurança. Este arquivo é o que falar e o que clicar.

---

## Antes de começar (5 minutos antes)

1. XAMPP: Apache e MySQL ligados.
2. `http://localhost/retifica-parana-dashboard/api/pecas.php` — tem que começar
   com `{"ok":true`.
3. `http://localhost/retifica-parana-dashboard/public/index.php` aberta.
4. phpMyAdmin aberto em outra aba, no banco `retifica_parana`.
5. Terminal aberto na pasta do projeto, pronto para rodar `tsc`.

Se o banco tiver sido mexido nos testes, reimporte `banco/00_banco_completo.sql`
— ele pode ser reimportado sem erro.

---

## A frase de abertura

> "É uma dashboard de estoque para o balcão da Retífica Paraná. O dado sai da
> tabela crua, passa por CTEs e funções que limpam e classificam, vira uma view,
> é entregue por uma stored procedure, o PHP só chama a procedure e devolve JSON,
> o TypeScript consome com fetch e calcula, e o DOM desenha. Cada camada faz uma
> coisa só."

---

## O caminho do dado, na ordem em que dá para mostrar

### 1. Tabela crua → CTE

phpMyAdmin, aba SQL:

```sql
SELECT codigo, nome, quantidade FROM peca LIMIT 3;
SELECT codigo, nome, quantidade, situacao FROM vw_pecas_dashboard LIMIT 3;
```

> "Repare que na tabela o código está em minúsculo e o nome tem espaço sobrando.
> A primeira CTE higieniza com `TRIM`, `UPPER`, `COALESCE` e `ABS`; a segunda
> junta categoria e fornecedor e classifica a situação."

### 2. A regra virou função reaproveitável

```sql
SELECT fn_situacao_estoque(0, 5), fn_situacao_estoque(3, 6), fn_situacao_estoque(40, 12);
```

> "Essa regra nascia escrita à mão dentro da view. Virou função, e agora a view
> analítica, a view de ficha e as procedures chamam todas a mesma função. Se o
> critério de 'crítico' mudar, muda em um lugar só."

### 3. A view que centraliza quatro tabelas

```sql
SELECT codigo, categoria, fornecedor, ultima_movimentacao_tipo FROM vw_ficha_peca LIMIT 5;
```

> "`vw_ficha_peca` junta peça, categoria, fornecedor e a última movimentação de
> estoque. É a ficha completa em uma consulta só."

### 4. A procedure que a tela usa

```sql
CALL sp_listar_pecas('bronzina', 0, '', 10, 0);
CALL sp_contar_pecas('bronzina', 0, '');
CALL sp_resumo_dashboard();
```

> "Busca, filtro e paginação estão dentro do banco. O PHP não monta SQL."

Abra `api/pecas.php` no editor e mostre a linha:

```php
$sqlPeca = "call sp_listar_pecas(?, ?, ?, ?, ?)";
```

### 5. PHP → JSON

Abra `http://localhost/retifica-parana-dashboard/api/pecas.php?busca=bronzina`.

> "O PHP conecta por PDO, executa a procedure com prepared statement, converte
> os tipos e devolve um contrato fixo: `ok`, `total`, `encontradas`, `pagina`,
> `limite` e `dados`."

Se perguntarem por que converter tipo: **o PDO devolve `DECIMAL` como texto.**
Sem o `(float)`, `valor_unitario` chegaria como `"189.90"` entre aspas e não
bateria com o tipo `number` do TypeScript.

### 6. JSON → TypeScript

Abra `src/tipos.ts`.

> "Cada campo do JSON tem um tipo aqui. Nenhum `any` no projeto inteiro, e todas
> as funções exportadas declaram o retorno."

Abra `src/api.ts`.

> "`fetch` com `async/await` dentro de `try/catch`. Se o banco cair, o erro é
> capturado aqui e vira mensagem na tela em vez de quebrar a aplicação."

### 7. TypeScript → tela

- `src/metricas.ts` — **reduce**: os quatro indicadores do topo.
- `src/analises.ts` — **filter** (abas), **ranking** com objeto de contagem
  chave-valor, **map** (linhas da tabela e série do gráfico).
- `src/grafico.ts` — desenha o SVG a partir do array que o `map` produziu.
- `src/main.ts` — só renderiza; não calcula nada.

**A prova de que a conta está certa:** rode `CALL sp_resumo_dashboard()` no
phpMyAdmin e compare com os indicadores da tela. Os números batem — o banco
somando em SQL e o TypeScript somando com `reduce` chegam ao mesmo resultado.

---

## A demonstração na tela (nesta ordem)

1. **Busca**: digite `bronzina`, clique em Filtrar. — *"isso foi a procedure."*
2. **Paginação**: mude "Por página" para 10, navegue com Próxima. — *"`LIMIT` e `OFFSET` dentro da procedure."*
3. **Abas**: clique em Repor e Zeradas. — *"isso é `.filter()` no navegador, sem ir ao servidor de novo."*
4. **Ranking**: aponte "Onde o dinheiro está parado". — *"objeto de contagem chave-valor."*
5. **Gráfico**: — *"o `.map()` transforma o objeto de contagem em array, e o SVG é desenhado a partir dele."*
6. **Cadastros**: cadastre uma peça, edite, tente excluir com estoque.
7. **Trigger**: no phpMyAdmin, `UPDATE peca SET quantidade = -7 WHERE codigo='PN-1001';` e mostre que gravou 7.
8. **Estado vazio**: `UPDATE peca SET ativo = 0;`, atualize a leitura, mostre a mensagem elegante — e depois `UPDATE peca SET ativo = 1;`.
9. **Estado de erro**: pare o MySQL no XAMPP, clique em "Atualizar leitura", mostre o aviso. Religue.
10. **Compilação**: rode `tsc` no terminal, na frente da banca.

---

## Perguntas que a banca costuma fazer

**"Por que usar procedure em vez de SQL no PHP?"**
Centraliza a regra no banco, o PHP fica com uma linha, e busca, filtro e
paginação passam a ser resolvidos onde os dados estão — sem trazer 23 linhas
para descartar 20 na aplicação.

**"Por que exclusão lógica?"**
Peça e fornecedor têm histórico. Uma peça excluída ainda aparece em movimentações
antigas; apagar de verdade quebraria o histórico. Categoria não tem histórico,
então é exclusão física — e por isso a regra dela conta também as peças já
excluídas logicamente, que continuam apontando para ela pela chave estrangeira.

**"O que acontece se dois usuários mexerem ao mesmo tempo?"**
Hoje o último a salvar vence. A tabela já tem `atualizado_em`, que é a base para
um controle de concorrência — seria o próximo passo, não está implementado.

**"Por que TypeScript e não JavaScript direto?"**
O contrato do JSON fica declarado em `tipos.ts`. Se o PHP mudar um campo, o
compilador acusa antes de rodar, em vez de o erro aparecer como `undefined` na
tela do balconista.

**"E se cair a internet na apresentação?"**
O Bootstrap vem de CDN, então o visual perde o acabamento — mas a aplicação
continua funcionando: banco, PHP, JSON e TypeScript são todos locais, e o
gráfico é SVG desenhado pelo próprio código, sem biblioteca externa.

**"Qual foi a parte mais difícil?"**
Resposta honesta e boa: a `vw_ficha_peca`. A primeira versão pegava a última
movimentação pelo maior `criado_em`, e duas movimentações gravadas no mesmo
segundo empatavam, fazendo a peça aparecer duas vezes. O desempate passou a ser
pelo maior `id`.
