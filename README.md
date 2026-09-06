# Dashboard de controle de peças — Retífica Paraná

Dashboard de estoque para o balcão da Retífica Paraná, em Campo Mourão.

A conferência das peças na oficina era feita de cabeça ou no caderno. A ideia
da tela é responder três perguntas em poucos segundos: o que tem na prateleira,
quanto de dinheiro está parado nela e o que precisa ser reposto.

## O que a tela mostra

Quatro indicadores no topo: valor em estoque, peças na prateleira, itens
cadastrados e quantos precisam de reposição.

Abaixo, um bloco de destaque com a categoria que mais imobiliza dinheiro, a
peça de maior valor parado e um gráfico de barras com o valor por categoria.

Depois vem a prateleira, em tabela, com busca por código ou nome, filtro por
categoria e por situação, paginação, e as abas Todas / Repor / Zeradas.

Cada peça cai em uma de três situações:

- **OK** — quantidade acima do mínimo
- **CRÍTICO** — quantidade igual ou abaixo do mínimo
- **SEM_ESTOQUE** — quantidade zerada

Tem também uma segunda tela, a de cadastros, com peça, categoria e fornecedor.
A exclusão não é direta: se a peça ainda tem estoque, ou se a categoria tem
peças ligadas, o sistema explica o que impede e o que fazer antes.

## Organização das pastas

```
banco/     scripts SQL, numerados na ordem em que precisam rodar
api/       rotas em PHP, uma por arquivo, todas devolvendo JSON
src/       TypeScript
public/    o que o navegador abre
```
