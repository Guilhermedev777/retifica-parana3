/*
    Desafio Final: Auditoria de Estoque Assincrona
    Leitura e gravacao de arquivos sem bloquear a Main Thread (fs/promises + then/catch).

    Como executar (dentro desta pasta):
        npx tsc auditoria.ts --target ES2020 --module commonjs
        node auditoria.js
*/

import { readFile, writeFile } from "fs/promises";

// [1] TIPAGEM
type ItemEstoque = {
    codigo: number,
    nome: string,
    preco: number,
    quantidade: number,
    ativo: boolean
}

type RelatorioAuditoria = {
    valorTotalEstoque: number,
    produtosCriticos: ItemEstoque[]
}

const CAMINHO_ESTOQUE: string = "./estoque.json";
const CAMINHO_AUDITORIA: string = "./auditoria.json";
const QUANTIDADE_CRITICA: number = 5;

// [3] LOGICA
const calcularValorTotal = (itens: ItemEstoque[]): number =>
    itens.reduce((total: number, item: ItemEstoque): number => total + (item.preco * item.quantidade), 0);

const filtrarProdutosCriticos = (itens: ItemEstoque[]): ItemEstoque[] =>
    itens.filter((item: ItemEstoque): boolean => item.quantidade < QUANTIDADE_CRITICA);

const gerarRelatorio = (itens: ItemEstoque[]): RelatorioAuditoria => {
    const relatorio: RelatorioAuditoria = {
        valorTotalEstoque: Number(calcularValorTotal(itens).toFixed(2)),
        produtosCriticos: filtrarProdutosCriticos(itens)
    }

    return relatorio;
}

// [2] PIPELINE + [4] PERSISTENCIA
readFile(CAMINHO_ESTOQUE, "utf-8")
    .then((conteudo: string): Promise<RelatorioAuditoria> => {
        const itens: ItemEstoque[] = JSON.parse(conteudo);
        const relatorio: RelatorioAuditoria = gerarRelatorio(itens);

        return writeFile(CAMINHO_AUDITORIA, JSON.stringify(relatorio, null, 2), "utf-8")
            .then((): RelatorioAuditoria => relatorio);
    })
    .then((relatorio: RelatorioAuditoria): void => {
        console.log("Auditoria concluida com sucesso.");
        console.log("Valor total do estoque: R$ " + relatorio.valorTotalEstoque);
        console.log("Produtos em nivel critico: " + relatorio.produtosCriticos.length);
        console.log("Relatorio salvo em: " + CAMINHO_AUDITORIA);
    })
    .catch((erro: unknown): void => {
        console.error("Falha na auditoria de estoque.");
        console.error(erro instanceof Error ? erro.message : erro);
    });
