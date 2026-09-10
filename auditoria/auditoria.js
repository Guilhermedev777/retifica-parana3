"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const CAMINHO_ESTOQUE = "./estoque.json";
const CAMINHO_AUDITORIA = "./auditoria.json";
const QUANTIDADE_CRITICA = 5;
// [3] LOGICA
const converterParaItens = (brutos) => brutos.map((bruto) => ({
    id: bruto.codigo,
    nome: bruto.nome,
    preco: bruto.preco,
    quantidade: bruto.quantidade
}));
const calcularValorTotal = (itens) => itens.reduce((total, item) => total + (item.preco * item.quantidade), 0);
const filtrarProdutosCriticos = (itens) => itens.filter((item) => item.quantidade < QUANTIDADE_CRITICA);
const gerarRelatorio = (itens) => {
    const relatorio = {
        valorTotalEstoque: Number(calcularValorTotal(itens).toFixed(2)),
        produtosCriticos: filtrarProdutosCriticos(itens)
    };
    return relatorio;
};
// [2] PIPELINE + [4] PERSISTENCIA
(0, promises_1.readFile)(CAMINHO_ESTOQUE, "utf-8")
    .then((conteudo) => {
    const brutos = JSON.parse(conteudo);
    const itens = converterParaItens(brutos);
    const relatorio = gerarRelatorio(itens);
    return (0, promises_1.writeFile)(CAMINHO_AUDITORIA, JSON.stringify(relatorio, null, 2), "utf-8")
        .then(() => relatorio);
})
    .then((relatorio) => {
    console.log("Auditoria concluida com sucesso.");
    console.log("Valor total do estoque: R$ " + relatorio.valorTotalEstoque);
    console.log("Produtos em nivel critico: " + relatorio.produtosCriticos.length);
    console.log("Relatorio salvo em: " + CAMINHO_AUDITORIA);
})
    .catch((erro) => {
    console.error("Falha na auditoria de estoque.");
    console.error(erro instanceof Error ? erro.message : erro);
});
