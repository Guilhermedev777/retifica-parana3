import { CamposFormulario, Categoria, FiltroPecas, FormularioPeca, Fornecedor, PaginaPecas, RespostaCategorias, RespostaEscrita, RespostaFornecedores, RespostaPecas } from "./tipos.js";

const enderecoApi: string = "../api/";

const validaSeRespostaOk = (resposta: Response): boolean => (resposta.ok) ? true : false;

const lerMensagemDeErro = (erro: unknown): string => (erro instanceof Error) ? erro.message : "Falha de rede ao falar com o servidor.";

const montarConsulta = (filtro: FiltroPecas): string => {
    const parametros = new URLSearchParams();

    parametros.set("busca", filtro.busca);
    parametros.set("categoria", String(filtro.categoria));
    parametros.set("situacao", filtro.situacao);
    parametros.set("pagina", String(filtro.pagina));
    parametros.set("limite", String(filtro.limite));

    return parametros.toString();
}

const montarCorpo = (campos: CamposFormulario): URLSearchParams => {
    const corpo = new URLSearchParams();

    for (const chave of Object.keys(campos)) {
        corpo.set(chave, campos[chave]);
    }

    return corpo;
}

export const buscarPecas = async (filtro: FiltroPecas): Promise<PaginaPecas> => {
    try {
        const resposta = await fetch(enderecoApi + "pecas.php?" + montarConsulta(filtro));

        if (!validaSeRespostaOk(resposta)) {
            throw new Error("A API respondeu com status " + resposta.status + ".");
        }

        const corpo = await resposta.json() as RespostaPecas;

        if (!corpo.ok) {
            throw new Error(corpo.erro || "A API recusou a consulta.");
        }

        return {
            pecas: (Array.isArray(corpo.dados)) ? corpo.dados : [],
            encontradas: corpo.encontradas || 0,
            pagina: corpo.pagina || 1,
            limite: corpo.limite || filtro.limite
        };
    } catch (erro) {
        throw new Error(lerMensagemDeErro(erro));
    }
}

export const buscarCategorias = async (): Promise<Categoria[]> => {
    try {
        const resposta = await fetch(enderecoApi + "categorias.php");

        if (!validaSeRespostaOk(resposta)) {
            throw new Error("A API respondeu com status " + resposta.status + ".");
        }

        const corpo = await resposta.json() as RespostaCategorias;

        if (!corpo.ok) {
            throw new Error(corpo.erro || "A API recusou a consulta.");
        }

        return (Array.isArray(corpo.dados)) ? corpo.dados : [];
    } catch (erro) {
        throw new Error(lerMensagemDeErro(erro));
    }
}

export const buscarFornecedores = async (): Promise<Fornecedor[]> => {
    try {
        const resposta = await fetch(enderecoApi + "fornecedores.php");

        if (!validaSeRespostaOk(resposta)) {
            throw new Error("A API respondeu com status " + resposta.status + ".");
        }

        const corpo = await resposta.json() as RespostaFornecedores;

        if (!corpo.ok) {
            throw new Error(corpo.erro || "A API recusou a consulta.");
        }

        return (Array.isArray(corpo.dados)) ? corpo.dados : [];
    } catch (erro) {
        throw new Error(lerMensagemDeErro(erro));
    }
}

const enviar = async (rota: string, corpo: URLSearchParams): Promise<RespostaEscrita> => {
    try {
        const resposta = await fetch(enderecoApi + rota, { method: "POST", body: corpo });

        if (!validaSeRespostaOk(resposta)) {
            throw new Error("A API respondeu com status " + resposta.status + ".");
        }

        return await resposta.json() as RespostaEscrita;
    } catch (erro) {
        throw new Error(lerMensagemDeErro(erro));
    }
}

export const salvarPeca = async (peca: FormularioPeca): Promise<RespostaEscrita> => {
    return enviar("pecas_salvar.php", montarCorpo({
        id: String(peca.id),
        codigo: peca.codigo,
        nome: peca.nome,
        categoria_id: String(peca.categoria_id),
        fornecedor_id: String(peca.fornecedor_id),
        quantidade: String(peca.quantidade),
        quantidade_minima: String(peca.quantidade_minima),
        valor_unitario: String(peca.valor_unitario)
    }));
}

export const excluirPeca = async (id: number): Promise<RespostaEscrita> => {
    return enviar("pecas_excluir.php", montarCorpo({ id: String(id) }));
}

export const salvarCategoria = async (id: number, nome: string): Promise<RespostaEscrita> => {
    return enviar("categorias_salvar.php", montarCorpo({ id: String(id), nome: nome }));
}

export const excluirCategoria = async (id: number): Promise<RespostaEscrita> => {
    return enviar("categorias_excluir.php", montarCorpo({ id: String(id) }));
}

export const salvarFornecedor = async (fornecedor: Fornecedor): Promise<RespostaEscrita> => {
    return enviar("fornecedores_salvar.php", montarCorpo({
        id: String(fornecedor.id),
        nome: fornecedor.nome,
        cnpj: fornecedor.cnpj,
        telefone: fornecedor.telefone,
        cidade: fornecedor.cidade
    }));
}

export const excluirFornecedor = async (id: number): Promise<RespostaEscrita> => {
    return enviar("fornecedores_excluir.php", montarCorpo({ id: String(id) }));
}
