import { Metricas, Peca } from "./tipos.js";

const converteParaNumero = (valor: unknown): number => {
    const convertido = Number(valor);
    return (Number.isFinite(convertido)) ? convertido : 0;
}

const somaQuantidade = (pecas: Peca[]): number => {
    return pecas.reduce((total, peca) => total + converteParaNumero(peca.quantidade), 0);
}

const somaValorImobilizado = (pecas: Peca[]): number => {
    return pecas.reduce((total, peca) => total + converteParaNumero(peca.quantidade) * converteParaNumero(peca.valor_unitario), 0);
}

const contaItensParaRepor = (pecas: Peca[]): number => {
    return pecas.reduce((total, peca) => (peca.situacao === "OK") ? total : total + 1, 0);
}

export const calcularMetricas = (pecas: Peca[]): Metricas => {
    const metricas: Metricas = {
        itensDistintos: pecas.length,
        pecasEmEstoque: somaQuantidade(pecas),
        valorImobilizado: somaValorImobilizado(pecas),
        itensParaRepor: contaItensParaRepor(pecas)
    }

    return metricas;
}

export const formatarReais = (valor: number): string => {
    return converteParaNumero(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const formatarInteiro = (valor: number): string => {
    return converteParaNumero(valor).toLocaleString("pt-BR");
}
