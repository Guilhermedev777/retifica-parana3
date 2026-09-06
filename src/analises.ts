import { formatarInteiro, formatarReais } from "./metricas.js";
import { ContagemPorChave, Destaque, LinhaTabela, Peca, PontoGrafico } from "./tipos.js";

export const traduzSituacao = (situacao: string): string => {
    if (situacao === "CRITICO") {
        return "Repor";
    }

    if (situacao === "SEM_ESTOQUE") {
        return "Zerado";
    }

    return "Em nivel";
}

const calcularNivel = (peca: Peca): number => {
    const referencia = (peca.quantidade_minima > 0) ? peca.quantidade_minima * 2 : 1;
    return Math.min(100, Math.round((peca.quantidade / referencia) * 100));
}

// ---------------------------------------------------------------------
// filter: recortes de negocio sobre o array bruto que veio do PHP
// ---------------------------------------------------------------------

export const apenasCriticas = (pecas: Peca[]): Peca[] => {
    return pecas.filter((peca) => peca.situacao === "CRITICO");
}

export const apenasZeradas = (pecas: Peca[]): Peca[] => {
    return pecas.filter((peca) => peca.situacao === "SEM_ESTOQUE");
}

export const paraRepor = (pecas: Peca[]): Peca[] => {
    return pecas.filter((peca) => peca.situacao !== "OK");
}

export const porCategoria = (pecas: Peca[], categoria: string): Peca[] => {
    return pecas.filter((peca) => peca.categoria === categoria);
}

export const porFornecedor = (pecas: Peca[], fornecedor: string): Peca[] => {
    return pecas.filter((peca) => peca.fornecedor === fornecedor);
}

export const acimaDoValor = (pecas: Peca[], valorMinimo: number): Peca[] => {
    return pecas.filter((peca) => peca.valor_em_estoque >= valorMinimo);
}

// ---------------------------------------------------------------------
// ranking: objetos de contagem chave-valor para achar o destaque
// ---------------------------------------------------------------------

export const contarPorCategoria = (pecas: Peca[]): ContagemPorChave => {
    const contagem: ContagemPorChave = {};

    for (const peca of pecas) {
        contagem[peca.categoria] = (contagem[peca.categoria] || 0) + 1;
    }

    return contagem;
}

export const somarValorPorCategoria = (pecas: Peca[]): ContagemPorChave => {
    const acumulado: ContagemPorChave = {};

    for (const peca of pecas) {
        acumulado[peca.categoria] = (acumulado[peca.categoria] || 0) + peca.valor_em_estoque;
    }

    return acumulado;
}

export const contarPorFornecedor = (pecas: Peca[]): ContagemPorChave => {
    const contagem: ContagemPorChave = {};

    for (const peca of pecas) {
        contagem[peca.fornecedor] = (contagem[peca.fornecedor] || 0) + 1;
    }

    return contagem;
}

export const maiorDoRanking = (contagem: ContagemPorChave): Destaque|null => {
    let destaque: Destaque|null = null;

    for (const chave of Object.keys(contagem)) {
        if (destaque === null || contagem[chave] > destaque.valor) {
            destaque = { rotulo: chave, valor: contagem[chave] };
        }
    }

    return destaque;
}

export const categoriaQueMaisImobiliza = (pecas: Peca[]): Destaque|null => {
    return maiorDoRanking(somarValorPorCategoria(pecas));
}

export const categoriaComMaisItens = (pecas: Peca[]): Destaque|null => {
    return maiorDoRanking(contarPorCategoria(pecas));
}

export const fornecedorComMaisItens = (pecas: Peca[]): Destaque|null => {
    return maiorDoRanking(contarPorFornecedor(pecas));
}

export const pecaDeMaiorValor = (pecas: Peca[]): Peca|null => {
    let destaque: Peca|null = null;

    for (const peca of pecas) {
        if (destaque === null || peca.valor_em_estoque > destaque.valor_em_estoque) {
            destaque = peca;
        }
    }

    return destaque;
}

// ---------------------------------------------------------------------
// map: transforma o formato da API no formato que a tela precisa
// ---------------------------------------------------------------------

export const paraLinhaTabela = (pecas: Peca[]): LinhaTabela[] => {
    return pecas.map((peca) => {
        const linha: LinhaTabela = {
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
}

export const paraSerieGrafico = (contagem: ContagemPorChave): PontoGrafico[] => {
    const serie = Object.keys(contagem).map((chave) => {
        const ponto: PontoGrafico = { rotulo: chave, valor: contagem[chave] };
        return ponto;
    });

    return serie.sort((um, outro) => outro.valor - um.valor);
}
