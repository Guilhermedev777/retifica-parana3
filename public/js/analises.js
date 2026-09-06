import { formatarInteiro, formatarReais } from "./metricas.js";
export const traduzSituacao = (situacao) => {
    if (situacao === "CRITICO") {
        return "Repor";
    }
    if (situacao === "SEM_ESTOQUE") {
        return "Zerado";
    }
    return "Em nivel";
};
const calcularNivel = (peca) => {
    const referencia = (peca.quantidade_minima > 0) ? peca.quantidade_minima * 2 : 1;
    return Math.min(100, Math.round((peca.quantidade / referencia) * 100));
};
// ---------------------------------------------------------------------
// filter: recortes de negocio sobre o array bruto que veio do PHP
// ---------------------------------------------------------------------
export const apenasCriticas = (pecas) => {
    return pecas.filter((peca) => peca.situacao === "CRITICO");
};
export const apenasZeradas = (pecas) => {
    return pecas.filter((peca) => peca.situacao === "SEM_ESTOQUE");
};
export const paraRepor = (pecas) => {
    return pecas.filter((peca) => peca.situacao !== "OK");
};
export const porCategoria = (pecas, categoria) => {
    return pecas.filter((peca) => peca.categoria === categoria);
};
export const porFornecedor = (pecas, fornecedor) => {
    return pecas.filter((peca) => peca.fornecedor === fornecedor);
};
export const acimaDoValor = (pecas, valorMinimo) => {
    return pecas.filter((peca) => peca.valor_em_estoque >= valorMinimo);
};
// ---------------------------------------------------------------------
// ranking: objetos de contagem chave-valor para achar o destaque
// ---------------------------------------------------------------------
export const contarPorCategoria = (pecas) => {
    const contagem = {};
    for (const peca of pecas) {
        contagem[peca.categoria] = (contagem[peca.categoria] || 0) + 1;
    }
    return contagem;
};
export const somarValorPorCategoria = (pecas) => {
    const acumulado = {};
    for (const peca of pecas) {
        acumulado[peca.categoria] = (acumulado[peca.categoria] || 0) + peca.valor_em_estoque;
    }
    return acumulado;
};
export const contarPorFornecedor = (pecas) => {
    const contagem = {};
    for (const peca of pecas) {
        contagem[peca.fornecedor] = (contagem[peca.fornecedor] || 0) + 1;
    }
    return contagem;
};
export const maiorDoRanking = (contagem) => {
    let destaque = null;
    for (const chave of Object.keys(contagem)) {
        if (destaque === null || contagem[chave] > destaque.valor) {
            destaque = { rotulo: chave, valor: contagem[chave] };
        }
    }
    return destaque;
};
export const categoriaQueMaisImobiliza = (pecas) => {
    return maiorDoRanking(somarValorPorCategoria(pecas));
};
export const categoriaComMaisItens = (pecas) => {
    return maiorDoRanking(contarPorCategoria(pecas));
};
export const fornecedorComMaisItens = (pecas) => {
    return maiorDoRanking(contarPorFornecedor(pecas));
};
export const pecaDeMaiorValor = (pecas) => {
    let destaque = null;
    for (const peca of pecas) {
        if (destaque === null || peca.valor_em_estoque > destaque.valor_em_estoque) {
            destaque = peca;
        }
    }
    return destaque;
};
// ---------------------------------------------------------------------
// map: transforma o formato da API no formato que a tela precisa
// ---------------------------------------------------------------------
export const paraLinhaTabela = (pecas) => {
    return pecas.map((peca) => {
        const linha = {
            codigo: peca.codigo,
            nome: peca.nome,
            categoria: peca.categoria,
            quantidade: formatarInteiro(peca.quantidade),
            quantidadeMinima: formatarInteiro(peca.quantidade_minima),
            valorUnitario: formatarReais(peca.valor_unitario),
            valorTotal: formatarReais(peca.valor_em_estoque),
            situacao: peca.situacao,
            rotulo: traduzSituacao(peca.situacao),
            nivel: calcularNivel(peca)
        };
        return linha;
    });
};
export const paraSerieGrafico = (contagem) => {
    const serie = Object.keys(contagem).map((chave) => {
        const ponto = { rotulo: chave, valor: contagem[chave] };
        return ponto;
    });
    return serie.sort((um, outro) => outro.valor - um.valor);
};
