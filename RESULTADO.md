# Resultado da entrega

Projeto: **Dashboard de controle de peças — Retífica Paraná**

Este documento percorre a rubrica item por item, na ordem em que ela aparece na
planilha, dizendo onde cada exigência está no código e como demonstrá-la ao vivo.

---

## 1. Banco de Dados Avançado

| Item da rubrica | Nota | Onde está | Como demonstrar |
|---|---|---|---|
| CTEs e Views analíticas que limpam e consolidam os dados brutos | 1,00 | `banco/03_views_ctes.sql` | `SELECT * FROM vw_pecas_dashboard;` — os códigos gravados em minúsculo e os nomes com espaços sobrando saem limpos, e a situação já vem classificada |
| Stored Procedures para busca, filtros e paginação, com o PHP fazendo `CALL` | 1,00 | `banco/07_procedures.sql` + `api/pecas.php` | `CALL sp_listar_pecas('bronzina', 0, '', 10, 0);` no phpMyAdmin, e depois a mesma busca na tela. O PHP não monta SQL: tem uma linha, `"call sp_listar_pecas(?, ?, ?, ?, ?)"` |
| Triggers BEFORE UPDATE para padronizar valores positivos | 1,00 | `banco/04_triggers.sql` | `UPDATE peca SET quantidade = -7 WHERE codigo='PN-1001';` grava 7 |
| Função no banco para reutilização de scripts | 0,50 | `banco/05_funcoes.sql` | `SELECT fn_situacao_estoque(0,5), fn_situacao_estoque(3,6), fn_situacao_estoque(40,12);` devolve `SEM_ESTOQUE`, `CRITICO`, `OK`. A mesma função é chamada pela view do `03`, pela view do `06` e pelas procedures do `07` |
| View que centraliza informações de tabelas distintas | 0,50 | `banco/06_view_ficha_peca.sql` | `SELECT * FROM vw_ficha_peca;` — junta **quatro** tabelas: `peca`, `categoria`, `fornecedor` e `movimentacao_estoque` (a última movimentação de cada peça) |

**Subtotal: 4,00.**

Detalhe que vale citar: `sp_movimentar_estoque` grava o histórico e ajusta o
saldo na mesma chamada, com um piso em zero. Sem esse piso, uma baixa maior que
o saldo deixaria a quantidade negativa e a trigger de padronização gravaria o
valor positivo, inflando o estoque em vez de zerá-lo.

---

## 2. Desenvolvimento Web Avançada

| Item da rubrica | Nota | Onde está | Como demonstrar |
|---|---|---|---|
| Aparência: interface amigável e usável | 0,30 | `public/index.php` + `public/assets/css/estilo.css` | tudo em uma tela, sem menu escondido: filtros no topo, indicadores, ranking com gráfico, prateleira |
| Bootstrap com pelo menos 3 componentes | 0,30 | `public/partes/cabecalho.php`, `public/index.php`, `public/cadastro.php` | **10 componentes**: navbar, nav, card, table, table-responsive, alert, spinner, badge, form-control e form-select |
| Template para facilitar manutenção e diminuir arquivos | 0,30 | `public/partes/cabecalho.php` e `public/partes/rodape.php` | as duas telas incluem as mesmas partes; mudar o logo ou o menu é mexer em **um** arquivo, não em dois |
| Estrutura do projeto bem definida | 0,30 | seção 5 do `README.md` | `banco/` numerado por dependência, `api/` com um arquivo por rota, `src/` com um módulo por responsabilidade, `public/` com o template separado |
| 3 CRUDs completos, com inclusão, edição e exclusão | 1,30 | `api/*_salvar.php`, `api/*_excluir.php`, `src/cadastro.ts`, `public/cadastro.php` | peça, categoria e fornecedor, os três com as quatro operações na tela de Cadastros |
| Regras de exclusão com mensagem clara | 0,50 | `api/pecas_excluir.php`, `api/categorias_excluir.php`, `api/fornecedores_excluir.php` | tente excluir a PN-2001 (40 unidades), a categoria Bloco (5 peças) e o fornecedor Metalúrgica São José (9 peças) |

**Subtotal: 3,00.**

As mensagens de exclusão dizem **o que impede** e **o que fazer**, não só "erro":

```
Ainda ha 40 unidade(s) de PN-2001 no estoque. Zere a quantidade antes de excluir.
A categoria Bloco tem 5 peca(s) na prateleira. Mova essas pecas para outra categoria antes de excluir.
O fornecedor Metalurgica Sao Jose tem 9 peca(s) ligada(s). Troque o fornecedor dessas pecas antes de excluir.
```

---

## 3. Lógica Avançada

| Item da rubrica | Nota | Onde está | Como demonstrar |
|---|---|---|---|
| Modelagem de Dados e Contratos de Interface | 0,50 | `src/tipos.ts` | 17 `type` mapeando o JSON do PHP campo a campo. **Zero `any`**, zero `!`, e todas as funções exportadas com retorno explícito — dá para conferir com `grep -n "any" src/*.ts` |
| Agregações e Cálculos Financeiros (Reduce) | 0,50 | `src/metricas.ts` | três `.reduce()` sobre o array bruto: valor imobilizado (`quantidade × valor_unitario`), unidades em estoque e itens a repor |
| Segmentação e Filtros de Negócio (Filter) | 0,50 | `src/analises.ts` | as abas **Todas / Repor / Zeradas** rodam `.filter()` sobre a lista já carregada. Há ainda `porCategoria`, `porFornecedor` e `acimaDoValor` |
| Algoritmos de Ranking e Frequência | 0,50 | `src/analises.ts` | `contarPorCategoria` e `somarValorPorCategoria` montam um **objeto de contagem chave-valor**; `maiorDoRanking` percorre as chaves e devolve o destaque. É o bloco "Onde o dinheiro está parado" |
| Transformação e Formatação (Map) | 0,50 | `src/analises.ts` | `paraLinhaTabela` transforma `Peca[]` em `LinhaTabela[]` com os valores **já formatados em R$**; `paraSerieGrafico` transforma o objeto de contagem no array que alimenta o gráfico |
| Tratamento de Cenários de Exceção (Edge Cases) | 0,50 | `src/metricas.ts` + `src/main.ts` | esvazie a tabela: aparece "Nenhuma peça registrada ainda" e os indicadores mostram R$ 0,00, nunca `NaN`. Desligue o MySQL: aparece "A leitura não chegou" |

**Subtotal: 3,00.**

---

## 4. Tech Forge

Os seis itens desta disciplina já estavam marcados como **Totalmente
Satisfatório** na rubrica, somando 3,00. O que foi feito nesta entrega só
reforça o que já estava valendo:

| Item | Nota | Reforço nesta entrega |
|---|---|---|
| Consumo de API e Fluxo Assíncrono | 0,50 | `src/api.ts` cresceu de 1 para 9 rotas, todas com `async/await` e `try/catch` |
| Integração de Ambientes (XAMPP + compilação) | 0,50 | 7 módulos TypeScript compilando em `strict` sem erro |
| Manipulação Segura do DOM | 0,50 | `elemento()` e `campo()` usam `instanceof` e `if`; nenhum `!` no projeto |
| Organização do Código e Modularidade | 0,50 | `api.ts` só busca, `metricas.ts` só soma, `analises.ts` só recorta, `grafico.ts` só desenha, `main.ts` e `cadastro.ts` só renderizam |
| Comunicação Técnico-Visual | 0,50 | o gráfico de barras em SVG entrou no bloco de ranking |
| Comunicação Técnica e Domínio Conceitual | 0,50 | roteiro do fluxo do dado em `ROTEIRO-APRESENTACAO.md` |

---

## 5. Como o projeto foi verificado

Nada aqui é "deve funcionar". Cada camada foi testada rodando:

- **Banco:** `00_banco_completo.sql` importado três vezes seguidas em banco
  limpo, sem um único erro. Funções conferidas com valores nulos e negativos;
  procedures conferidas com busca, filtro por categoria, filtro por situação e
  três páginas de paginação sem sobreposição.
- **API:** os 9 endpoints chamados um a um, incluindo os caminhos de erro —
  código duplicado, campo vazio, exclusão bloqueada e banco fora do ar
  (HTTP 500 com JSON, nunca uma tela branca de PHP).
- **Telas:** dashboard e cadastros exercitadas em navegador de verdade. Os
  indicadores da tela batem exatamente com `CALL sp_resumo_dashboard()`:
  23 itens, 296 unidades, R$ 29.910,90 e 8 a repor. Zero erro de JavaScript no
  console.

Dois defeitos foram encontrados e corrigidos nesse processo: o
`CREATE INDEX` do `01_schema.sql` não era idempotente (a promessa de reimportar
o banco nunca tinha sido verdade) e a `vw_ficha_peca` duplicava peças cujas
movimentações caíam no mesmo segundo.

---

## 6. Checklist antes da apresentação

- [ ] Importar `banco/00_banco_completo.sql`
- [ ] Abrir `api/pecas.php` e confirmar `{"ok":true`
- [ ] Abrir a dashboard e conferir os 4 indicadores
- [ ] Rodar `CALL sp_resumo_dashboard()` e mostrar que bate com a tela
- [ ] Demonstrar busca, filtro e paginação
- [ ] Demonstrar as abas Todas / Repor / Zeradas
- [ ] Cadastrar, editar e tentar excluir uma peça com estoque
- [ ] Demonstrar a trigger com valor negativo
- [ ] Demonstrar o estado vazio e o estado de erro
- [ ] Rodar `tsc` na frente da banca
- [ ] Explicar o caminho do dado (roteiro em `ROTEIRO-APRESENTACAO.md`)
