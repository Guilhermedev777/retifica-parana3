import { readFile, writeFile } from "fs/promises";

// [1] TIPAGEM
type ItemBruto = {
    codigo: number,
    nome: string,
    preco: number,
    quantidade: number,
    ativo: boolean
}

type ItemEstoque = {
    id: number,
    nome: string,
    preco: number,
    quantidade: number
}

type RelatorioAuditoria = {
    valorTotalEstoque: number,
    produtosCriticos: ItemEstoque[]
}

const CAMINHO_ESTOQUE: string = "./estoque.json";
const CAMINHO_AUDITORIA: string = "./auditoria.json";
const QUANTIDADE_CRITICA: number = 5;

// [3] LOGICA
const converterParaItens = (brutos: ItemBruto[]): ItemEstoque[] =>
    brutos.map((bruto: ItemBruto): ItemEstoque => ({
        id: bruto.codigo,
        nome: bruto.nome,
        preco: bruto.preco,
        quantidade: bruto.quantidade
    }));

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
        const brutos: ItemBruto[] = JSON.parse(conteudo);
        const itens: ItemEstoque[] = converterParaItens(brutos);
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
