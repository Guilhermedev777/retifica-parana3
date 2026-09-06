# Retífica Paraná — Dashboard de controle de peças

Dashboard interna para o balcão da oficina: mostra o que existe na prateleira,
quanto vale o estoque parado e quais peças precisam ser repostas. Tem também a
tela de cadastros, com os CRUDs de peça, categoria e fornecedor.

Fluxo do dado: **MariaDB (funções + views + procedures + triggers) → PHP (JSON) → TypeScript → DOM**.

---

## 1. Requisitos

| O quê | Versão | Para quê |
|---|---|---|
| XAMPP (Apache + MariaDB) | 8.x | rodar a API PHP e o banco |
| Navegador | qualquer atual | abrir a dashboard |
| Node.js + TypeScript | opcional | recompilar os `.ts` |

O JavaScript já vem compilado em `public/js/`, então o projeto **roda sem
instalar o Node**. O Node só é necessário se você editar os arquivos `.ts`.

---

## 2. Instalação (5 passos)

**1. Copie a pasta para o htdocs**

```
C:\xampp\htdocs\retifica-parana-dashboard
```

**2. Ligue o Apache e o MySQL** no painel do XAMPP.

**3. Importe o banco** — há dois caminhos, escolha um.

**Caminho rápido (recomendado):** abra `http://localhost/phpmyadmin` e importe
um único arquivo:

```
banco/00_banco_completo.sql   -> banco inteiro, na ordem certa
```

Ele pode ser reimportado quantas vezes for preciso sem dar erro de "já existe".

> Pelo terminal, se preferir:
> `mysql -u root < banco/00_banco_completo.sql`

**Caminho passo a passo:** se você quer mostrar cada item da rubrica separado,
importe os arquivos numerados **nesta ordem**:

```
01_schema.sql            -> banco, tabelas (categoria, fornecedor, peca, movimentacao_estoque) e índices
02_dados_exemplo.sql     -> 5 categorias, 3 fornecedores, 23 peças e movimentações
03_views_ctes.sql        -> CTEs + views analíticas
04_triggers.sql          -> triggers BEFORE UPDATE / BEFORE INSERT
05_funcoes.sql           -> funções do banco + a view reescrita reaproveitando elas
06_view_ficha_peca.sql   -> view que centraliza quatro tabelas
07_procedures.sql        -> stored procedures de busca, filtro e paginação
```

> A ordem não é enfeite, por dois motivos.
>
> O `02` precisa rodar **antes** do `04`: os dados de exemplo entram
> propositalmente "sujos" (código minúsculo, espaços sobrando) para as CTEs do
> `03` provarem que limpam o dado bruto. Se as triggers já existissem, elas
> limpariam tudo na inserção e a demonstração se perderia.
>
> O `05` roda **depois** do `03` porque conta uma história: a regra de situação
> (`OK` / `CRÍTICO` / `SEM_ESTOQUE`) nasce escrita à mão dentro da view, no `03`.
> No `05` ela vira a função `fn_situacao_estoque` e a view é reescrita chamando
> a função — que passa a ser reaproveitada também pela view do `06` e pelas
> procedures do `07`.

**4. Teste a API** no navegador:

```
http://localhost/retifica-parana-dashboard/api/pecas.php
http://localhost/retifica-parana-dashboard/api/categorias.php
http://localhost/retifica-parana-dashboard/api/fornecedores.php
```

Os três devem começar com `{"ok":true,...}`.

**5. Abra a dashboard:**

```
http://localhost/retifica-parana-dashboard/public/index.php
```

---

## 3. Como usar

### 3.1 Dashboard (`public/index.php`)

- **Buscar / Categoria / Situação / Por página** — os filtros vão para o banco.
  O PHP não monta SQL: ele chama `CALL sp_listar_pecas(?,?,?,?,?)`.
- **Todas / Repor / Zeradas** — recortes feitos no navegador com `.filter()`
  sobre a lista que já chegou.
- **Onde o dinheiro está parado** — ranking calculado com objeto de contagem
  chave-valor, e o gráfico de barras desenhado em SVG a partir do `.map()`.
- **Anterior / Próxima** — paginação, também resolvida pela procedure.

### 3.2 Cadastros (`public/cadastro.php`)

Os três CRUDs completos. Cada bloco tem formulário e lista; **Editar** carrega
a linha no formulário e **Excluir** aplica a regra de negócio.

| Situação | O que o sistema responde |
|---|---|
| Peça com quantidade maior que zero | "Ainda há 4 unidade(s) de PN-9001 no estoque. Zere a quantidade antes de excluir." |
| Peça zerada | "Peça PN-9001 excluída. O histórico de movimentação foi mantido." |
| Categoria com peças na prateleira | "A categoria Bielas tem 1 peça(s) na prateleira. Mova essas peças para outra categoria antes de excluir." |
| Categoria só com peças já excluídas | "…não tem peças na prateleira, mas ainda guarda 1 peça(s) excluída(s) no histórico." |
| Fornecedor com peças ligadas | "O fornecedor Metalúrgica São José tem 9 peça(s) ligada(s). Troque o fornecedor dessas peças antes de excluir." |
| Código ou CNPJ repetido | "Já existe uma peça com o código PN-1001." |

Peça e fornecedor usam **exclusão lógica** (`ativo = 0`), para não perder o
histórico. Categoria usa **exclusão física**, e por isso a regra dela conta
também as peças já excluídas — elas continuam apontando para a categoria pela
chave estrangeira e derrubariam o `DELETE`.

### 3.3 Cadastrar direto no banco (opcional)

Ainda funciona, se você quiser mostrar o caminho pelo phpMyAdmin:

```sql
INSERT INTO categoria (nome) VALUES ('Bielas');

INSERT INTO peca (codigo, nome, categoria_id, fornecedor_id, quantidade, quantidade_minima, valor_unitario)
VALUES ('PN-6001', 'Biela retificada 1.6', 6, 1, 10, 4, 320.00);
```

Se alguém errar e deixar a quantidade negativa, a trigger
`trg_peca_before_update` grava o valor positivo:

```sql
UPDATE peca SET quantidade = -7 WHERE codigo = 'PN-6001';
SELECT codigo, quantidade FROM peca WHERE codigo = 'PN-6001';  -- retorna 7
```

---

## 4. Recompilar o TypeScript (só se editar os `.ts`)

```bash
cd retifica-parana-dashboard
npm install -g typescript      # uma vez só
tsc                            # gera public/js/*.js
tsc --watch                    # recompila enquanto você edita
```

A configuração está em `tsconfig.json` (`strict: true`, saída em `public/js`).

---

## 5. Estrutura do projeto

```
retifica-parana-dashboard/
├── banco/                        Scripts SQL, numerados na ordem de execução
│   ├── 00_banco_completo.sql     os sete abaixo num arquivo só (import rápido)
│   ├── 01_schema.sql             tabelas, chaves estrangeiras e índices
│   ├── 02_dados_exemplo.sql      dados de demonstração
│   ├── 03_views_ctes.sql         CTEs + views analíticas
│   ├── 04_triggers.sql           BEFORE UPDATE / BEFORE INSERT
│   ├── 05_funcoes.sql            funções + view reescrita reaproveitando elas
│   ├── 06_view_ficha_peca.sql    view centralizando quatro tabelas
│   └── 07_procedures.sql         busca, filtro, paginação e movimentação
├── api/                          Camada PHP (só devolve JSON)
│   ├── config/conexao.php        PDO
│   ├── pecas.php                 GET  — CALL sp_listar_pecas + sp_contar_pecas
│   ├── pecas_salvar.php          POST — inclusão e edição
│   ├── pecas_excluir.php         POST — regra de exclusão
│   ├── categorias.php            GET
│   ├── categorias_salvar.php     POST
│   ├── categorias_excluir.php    POST — regra de exclusão
│   ├── fornecedores.php          GET
│   ├── fornecedores_salvar.php   POST
│   └── fornecedores_excluir.php  POST — regra de exclusão
├── src/                          Código-fonte TypeScript
│   ├── tipos.ts                  contratos de dados, zero `any`
│   ├── api.ts                    fetch + async/await + try/catch
│   ├── metricas.ts               reduce + formatação + proteção contra NaN
│   ├── analises.ts               filter, ranking (chave-valor) e map
│   ├── grafico.ts                gráfico de barras em SVG
│   ├── main.ts                   render da dashboard
│   └── cadastro.ts               render e envio dos três CRUDs
├── public/                       O que o navegador abre
│   ├── partes/cabecalho.php      template: <head>, navbar, abertura do <main>
│   ├── partes/rodape.php         template: rodapé, scripts e fechamento
│   ├── index.php                 dashboard
│   ├── cadastro.php              CRUDs
│   ├── index.html                redireciona para index.php
│   ├── assets/css/estilo.css
│   ├── assets/img/logo-retifica-parana.png
│   └── js/                       saída compilada (não editar à mão)
├── tsconfig.json
├── README.md                     este arquivo
├── RESULTADO.md                  item da rubrica → onde está no código
└── ROTEIRO-APRESENTACAO.md       o que falar e o que clicar na banca
```

---

## 6. Onde cada item da rubrica está no código

| Item da rubrica | Arquivo |
|---|---|
| CTEs e Views analíticas | `banco/03_views_ctes.sql` |
| Stored Procedures (busca, filtro, paginação) | `banco/07_procedures.sql` + `api/pecas.php` |
| Trigger BEFORE UPDATE | `banco/04_triggers.sql` |
| Função no banco para reutilização | `banco/05_funcoes.sql` |
| View centralizando várias tabelas | `banco/06_view_ficha_peca.sql` |
| Aparência e usabilidade | `public/index.php` + `public/assets/css/estilo.css` |
| Bootstrap (10 componentes) | `public/partes/cabecalho.php` + `public/index.php` |
| Template para diminuir arquivos | `public/partes/` + `index.php` + `cadastro.php` |
| Estrutura do projeto | esta seção 5 |
| 3 CRUDs completos | `api/*_salvar.php`, `api/*_excluir.php`, `src/cadastro.ts` |
| Regras de exclusão com mensagem | `api/pecas_excluir.php`, `api/categorias_excluir.php`, `api/fornecedores_excluir.php` |
| Modelagem e contratos (TypeScript) | `src/tipos.ts` |
| Reduce | `src/metricas.ts` |
| Filter | `src/analises.ts` |
| Ranking e frequência | `src/analises.ts` (`contarPorCategoria`, `maiorDoRanking`) |
| Map | `src/analises.ts` (`paraLinhaTabela`, `paraSerieGrafico`) |
| Edge cases | `src/metricas.ts` (`converteParaNumero()`) e `src/main.ts` (estado vazio/erro) |
| fetch async/await + try/catch | `src/api.ts` |
| Manipulação segura do DOM | `src/main.ts` e `src/cadastro.ts` (`elemento()`, `campo()`, sem `!`) |
| XAMPP + compilação | `tsconfig.json` + este README |

---

## 7. Se der problema

| Sintoma | Causa provável | Solução |
|---|---|---|
| Tela mostra "A leitura não chegou" | MySQL desligado ou banco não importado | ligue o MySQL no XAMPP e importe `banco/00_banco_completo.sql` |
| `api/pecas.php` mostra código PHP | arquivo aberto fora do Apache | acesse por `http://localhost/...`, não por `file://` |
| `PROCEDURE sp_listar_pecas does not exist` | banco importado só até o script 04 | importe `banco/00_banco_completo.sql` |
| `Table 'vw_pecas_dashboard' doesn't exist` | faltou o script 03 | importe `banco/00_banco_completo.sql` |
| `Access denied for user 'root'` | senha no MySQL | ajuste `$pass` em `api/config/conexao.php` |
| Dashboard abre em branco | JS não compilado ou aberto por `file://` | rode `tsc` e abra pelo `localhost` |
| Página abre sem estilo nenhum | sem internet: o Bootstrap vem de CDN | conecte a internet, ou aceite a tela sem o Bootstrap (ela continua funcionando) |
| CTE não aceita na view | MariaDB anterior à 10.2 | atualize o XAMPP |
