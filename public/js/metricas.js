const converteParaNumero = (valor) => {
    const convertido = Number(valor);
    return (Number.isFinite(convertido)) ? convertido : 0;
};
const somaQuantidade = (pecas) => {
    return pecas.reduce((total, peca) => total + converteParaNumero(peca.quantidade), 0);
};
const somaValorImobilizado = (pecas) => {
    return pecas.reduce((total, peca) => total + converteParaNumero(peca.quantidade) * converteParaNumero(peca.valor_unitario), 0);
};
const contaItensParaRepor = (pecas) => {
    return pecas.reduce((total, peca) => (peca.situacao === "OK") ? total : total + 1, 0);
};
export const calcularMetricas = (pecas) => {
    const metricas = {
        itensDistintos: pecas.length,
        pecasEmEstoque: somaQuantidade(pecas),
        valorImobilizado: somaValorImobilizado(pecas),
        itensParaRepor: contaItensParaRepor(pecas)
    };
    return metricas;
};
export const formatarReais = (valor) => {
    return converteParaNumero(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};
export const formatarInteiro = (valor) => {
    return converteParaNumero(valor).toLocaleString("pt-BR");
};
