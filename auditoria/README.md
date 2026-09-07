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

O `auditoria.js` já vem compilado, então não precisa instalar nada. Para
recompilar depois de mexer no `auditoria.ts`:

```
npx tsc auditoria.ts --target ES2020 --module commonjs
```

## Arquivos

- `auditoria.ts` — o script (código-fonte)
- `auditoria.js` — o mesmo script compilado
- `estoque.json` — os 100 itens de entrada
- `auditoria.json` — o relatório gerado pela última execução

## Resultado da última execução

- Valor total do estoque: **R$ 1.150.221,90**
- Produtos em nível crítico: **16** de 100

> Observação: ao compilar, o TypeScript avisa que não encontra os tipos do Node
> (`Cannot find name 'fs/promises'`). É só o pacote de tipos que não está
> instalado — o código compila e roda normalmente. Para tirar o aviso:
> `npm i -D @types/node`.
