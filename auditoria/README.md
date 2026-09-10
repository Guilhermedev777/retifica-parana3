# Auditoria de Estoque Assíncrona

Desafio final da disciplina: ler um arquivo de estoque, calcular o valor total
e separar os produtos em nível crítico, tudo sem bloquear a Main Thread.

## Como funciona

| Etapa | Onde está no código |
|---|---|
| Tipagem (`ItemEstoque`, `RelatorioAuditoria`) | topo do `auditoria.ts` |
| Pipeline assíncrono (`fs/promises` + `.then()` / `.catch()`) | final do `auditoria.ts` |
| Conversão do JSON bruto para o contrato (`map`) | `converterParaItens` |
| Valor total do estoque (`reduce` de `preco * quantidade`) | `calcularValorTotal` |
| Produtos em nível crítico (`filter` de `quantidade < 5`) | `filtrarProdutosCriticos` |
| Persistência do relatório | `writeFile` dentro do primeiro `.then()` |

Nenhuma função `Sync` é usada, e o `.catch()` no fim da cadeia cobre tanto a
falha de leitura quanto a de escrita.

O arquivo de origem identifica cada item por `codigo`; o `map` converte esse
campo para `id`, que é o nome exigido pelo contrato `ItemEstoque`. É por isso
que o `map` existe: ele adapta o dado bruto ao tipo, em vez de o tipo se
adaptar ao dado.

## Como executar

Dentro desta pasta:

```
node auditoria.js
```

O `auditoria.js` já vem compilado, então não precisa instalar nada para rodar.

## Como recompilar

O `tsconfig.json` desta pasta já tem a configuração certa (Node + CommonJS),
então basta rodar aqui dentro:

```
npx tsc
```

Os tipos do Node ficam na raiz do projeto e são instalados uma única vez:

```
npm install --save-dev @types/node@22
```

Sem eles o TypeScript acusa `Cannot find module 'fs/promises'`. É apenas o
pacote de tipos faltando — o código compila e roda do mesmo jeito.

## Arquivos

- `auditoria.ts` — o script (código-fonte)
- `auditoria.js` — o mesmo script compilado
- `estoque.json` — os 100 itens de entrada
- `estoque-disciplina.json` — o arquivo de exemplo que veio no enunciado
- `auditoria.json` — o relatório gerado pela última execução
- `tsconfig.json` — configuração de compilação desta pasta

## Sobre o estoque usado

O enunciado veio com um arquivo de exemplo de eletrônicos, que está preservado
aqui como `estoque-disciplina.json`. O `estoque.json` que o script lê tem o mesmo
formato, mas com o catálogo da própria retífica — blocos, cabeçotes, conjunto
móvel, válvulas, vedação e injeção diesel —, para o exercício conversar com o
resto do projeto.

Trocar de um para o outro é mudar uma linha no `auditoria.ts`:

```ts
const CAMINHO_ESTOQUE: string = "./estoque-disciplina.json";
```

O resultado muda, o código não. É justamente o ponto: o script depende do
formato, não do conteúdo.

## Resultado da última execução

- Valor total do estoque: **R$ 318.917,90**
- Produtos em nível crítico: **18** de 100 (blocos, cabeçotes, virabrequins e
  bombas injetoras — as peças caras, que a retífica compra sob demanda)
