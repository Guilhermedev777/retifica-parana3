# Auditoria de Estoque Assíncrona

Desafio final da disciplina: ler um arquivo de estoque, calcular o valor total
e separar os produtos em nível crítico, tudo sem bloquear a Main Thread.

## Como funciona

| Etapa | Onde está no código |
|---|---|
| Tipagem (`ItemEstoque`, `RelatorioAuditoria`) | topo do `auditoria.ts` |
| Pipeline assíncrono (`fs/promises` + `.then()` / `.catch()`) | final do `auditoria.ts` |
| Valor total do estoque (`preco * quantidade`) | `calcularValorTotal` |
| Produtos em nível crítico (`quantidade < 5`) | `filtrarProdutosCriticos` |
| Persistência do relatório | `writeFile` dentro do primeiro `.then()` |

Nenhuma função `Sync` é usada, e o `.catch()` no fim da cadeia cobre tanto a
falha de leitura quanto a de escrita.

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
- `auditoria.json` — o relatório gerado pela última execução
- `tsconfig.json` — configuração de compilação desta pasta

## Resultado da última execução

- Valor total do estoque: **R$ 1.150.221,90**
- Produtos em nível crítico: **16** de 100
