export type SituacaoEstoque = "OK"|"CRITICO"|"SEM_ESTOQUE";

export type Peca = {
    id: number,
    codigo: string,
    nome: string,
    categoria_id: number,
    categoria: string,
    fornecedor_id: number,
    fornecedor: string,
    quantidade: number,
    quantidade_minima: number,
    valor_unitario: number,
    valor_em_estoque: number,
    situacao: SituacaoEstoque,
    atualizado_em: string
}

export type Categoria = {
    id: number,
    nome: string,
    pecas: number
}

export type Fornecedor = {
    id: number,
    nome: string,
    cnpj: string,
    telefone: string,
    cidade: string,
    pecas: number
}

export type RespostaPecas = {
    ok: boolean,
    total?: number,
    encontradas?: number,
    pagina?: number,
    limite?: number,
    dados?: Peca[],
    erro?: string
}

export type RespostaCategorias = {
    ok: boolean,
    total?: number,
    dados?: Categoria[],
    erro?: string
}

export type RespostaFornecedores = {
    ok: boolean,
    total?: number,
    dados?: Fornecedor[],
    erro?: string
}

export type RespostaEscrita = {
    ok: boolean,
    mensagem?: string,
    erro?: string
}

export type FiltroPecas = {
    busca: string,
    categoria: number,
    situacao: string,
    pagina: number,
    limite: number
}

export type PaginaPecas = {
    pecas: Peca[],
    encontradas: number,
    pagina: number,
    limite: number
}

export type Metricas = {
    itensDistintos: number,
    pecasEmEstoque: number,
    valorImobilizado: number,
    itensParaRepor: number
}

export type LinhaTabela = {
    codigo: string,
    nome: string,
    categoria: string,
    quantidade: string,
    quantidadeMinima: string,
    valorUnitario: string,
    valorTotal: string,
    situacao: SituacaoEstoque,
    rotulo: string,
    nivel: number
}

export type PontoGrafico = {
    rotulo: string,
    valor: number
}

export type Destaque = {
    rotulo: string,
    valor: number
}

export type ContagemPorChave = {
    [chave: string]: number
}

export type CamposFormulario = {
    [chave: string]: string
}

export type FormularioPeca = {
    id: number,
    codigo: string,
    nome: string,
    categoria_id: number,
    fornecedor_id: number,
    quantidade: number,
    quantidade_minima: number,
    valor_unitario: number
}
