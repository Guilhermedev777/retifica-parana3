import { buscarCategorias, buscarFornecedores, buscarPecas, excluirCategoria, excluirFornecedor, excluirPeca, salvarCategoria, salvarFornecedor, salvarPeca } from "./api.js";
import { formatarReais } from "./metricas.js";
let pecas = [];
let categorias = [];
let fornecedores = [];
const filtroCompleto = {
    busca: "",
    categoria: 0,
    situacao: "",
    pagina: 1,
    limite: 200
};
const elemento = (id) => {
    return document.getElementById(id);
};
const campo = (id) => {
    const alvo = elemento(id);
    if (alvo instanceof HTMLInputElement || alvo instanceof HTMLSelectElement) {
        return alvo;
    }
    return null;
};
const lerCampo = (id) => {
    const alvo = campo(id);
    return (alvo) ? alvo.value.trim() : "";
};
const escreverCampo = (id, valor) => {
    const alvo = campo(id);
    if (alvo) {
        alvo.value = valor;
    }
};
const desenhar = (id, html) => {
    const alvo = elemento(id);
    if (alvo) {
        alvo.innerHTML = html;
    }
};
const limparTexto = (texto) => {
    return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
const avisar = (mensagem, deuCerto) => {
    const alvo = elemento("avisoCadastro");
    if (!alvo) {
        return;
    }
    alvo.textContent = mensagem;
    alvo.classList.toggle("aviso-cadastro--erro", !deuCerto);
    alvo.classList.toggle("aviso-cadastro--ok", deuCerto);
    alvo.hidden = false;
};
const tratarResposta = (resposta) => {
    if (resposta.ok) {
        avisar(resposta.mensagem || "Registro salvo.", true);
        return true;
    }
    avisar(resposta.erro || "Nao foi possivel concluir a operacao.", false);
    return false;
};
const botoesDaLinha = (tipo, id) => {
    return `
      <button type="button" class="btn botao-linha" data-acao="editar" data-tipo="${tipo}" data-id="${id}">Editar</button>
      <button type="button" class="btn botao-linha botao-linha--perigo" data-acao="excluir" data-tipo="${tipo}" data-id="${id}">Excluir</button>`;
};
const renderizarPecas = () => {
    let html = "";
    for (const peca of pecas) {
        html = html + `
    <tr>
      <td class="cel-codigo">${limparTexto(peca.codigo)}</td>
      <td>${limparTexto(peca.nome)}</td>
      <td>${limparTexto(peca.categoria)}</td>
      <td>${limparTexto(peca.fornecedor)}</td>
      <td class="cel-num">${peca.quantidade}</td>
      <td class="cel-num">${formatarReais(peca.valor_unitario)}</td>
      <td class="cel-acoes">${botoesDaLinha("peca", peca.id)}</td>
    </tr>`;
    }
    desenhar("listaPecas", html);
};
const renderizarCategorias = () => {
    let html = "";
    for (const categoria of categorias) {
        html = html + `
    <tr>
      <td>${limparTexto(categoria.nome)}</td>
      <td class="cel-num">${categoria.pecas}</td>
      <td class="cel-acoes">${botoesDaLinha("categoria", categoria.id)}</td>
    </tr>`;
    }
    desenhar("listaCategorias", html);
};
const renderizarFornecedores = () => {
    let html = "";
    for (const fornecedor of fornecedores) {
        html = html + `
    <tr>
      <td>${limparTexto(fornecedor.nome)}</td>
      <td>${limparTexto(fornecedor.cnpj)}</td>
      <td>${limparTexto(fornecedor.cidade)}</td>
      <td class="cel-num">${fornecedor.pecas}</td>
      <td class="cel-acoes">${botoesDaLinha("fornecedor", fornecedor.id)}</td>
    </tr>`;
    }
    desenhar("listaFornecedores", html);
};
const preencherSeletores = () => {
    let opcoesCategoria = '<option value="0">Escolha uma categoria</option>';
    for (const categoria of categorias) {
        opcoesCategoria = opcoesCategoria + '<option value="' + categoria.id + '">' + limparTexto(categoria.nome) + "</option>";
    }
    desenhar("pecaCategoria", opcoesCategoria);
    let opcoesFornecedor = '<option value="0">Sem fornecedor</option>';
    for (const fornecedor of fornecedores) {
        opcoesFornecedor = opcoesFornecedor + '<option value="' + fornecedor.id + '">' + limparTexto(fornecedor.nome) + "</option>";
    }
    desenhar("pecaFornecedor", opcoesFornecedor);
};
const limparFormularioPeca = () => {
    escreverCampo("pecaId", "0");
    escreverCampo("pecaCodigo", "");
    escreverCampo("pecaNome", "");
    escreverCampo("pecaCategoria", "0");
    escreverCampo("pecaFornecedor", "0");
    escreverCampo("pecaQuantidade", "0");
    escreverCampo("pecaMinima", "1");
    escreverCampo("pecaValor", "0,00");
};
const limparFormularioCategoria = () => {
    escreverCampo("categoriaId", "0");
    escreverCampo("categoriaNome", "");
};
const limparFormularioFornecedor = () => {
    escreverCampo("fornecedorId", "0");
    escreverCampo("fornecedorNome", "");
    escreverCampo("fornecedorCnpj", "");
    escreverCampo("fornecedorTelefone", "");
    escreverCampo("fornecedorCidade", "");
};
const carregarTudo = async () => {
    try {
        const pagina = await buscarPecas(filtroCompleto);
        pecas = pagina.pecas;
        categorias = await buscarCategorias();
        fornecedores = await buscarFornecedores();
        preencherSeletores();
        renderizarPecas();
        renderizarCategorias();
        renderizarFornecedores();
    }
    catch (erro) {
        avisar((erro instanceof Error) ? erro.message : "Erro inesperado ao carregar os dados.", false);
    }
};
const editarPeca = (id) => {
    for (const peca of pecas) {
        if (peca.id === id) {
            escreverCampo("pecaId", String(peca.id));
            escreverCampo("pecaCodigo", peca.codigo);
            escreverCampo("pecaNome", peca.nome);
            escreverCampo("pecaCategoria", String(peca.categoria_id));
            escreverCampo("pecaFornecedor", String(peca.fornecedor_id));
            escreverCampo("pecaQuantidade", String(peca.quantidade));
            escreverCampo("pecaMinima", String(peca.quantidade_minima));
            escreverCampo("pecaValor", String(peca.valor_unitario));
            avisar("Editando a peca " + peca.codigo + ".", true);
        }
    }
};
const editarCategoria = (id) => {
    for (const categoria of categorias) {
        if (categoria.id === id) {
            escreverCampo("categoriaId", String(categoria.id));
            escreverCampo("categoriaNome", categoria.nome);
            avisar("Editando a categoria " + categoria.nome + ".", true);
        }
    }
};
const editarFornecedor = (id) => {
    for (const fornecedor of fornecedores) {
        if (fornecedor.id === id) {
            escreverCampo("fornecedorId", String(fornecedor.id));
            escreverCampo("fornecedorNome", fornecedor.nome);
            escreverCampo("fornecedorCnpj", fornecedor.cnpj);
            escreverCampo("fornecedorTelefone", fornecedor.telefone);
            escreverCampo("fornecedorCidade", fornecedor.cidade);
            avisar("Editando o fornecedor " + fornecedor.nome + ".", true);
        }
    }
};
const executarAcao = async (acao, tipo, id) => {
    try {
        if (acao === "editar") {
            if (tipo === "peca") {
                editarPeca(id);
            }
            if (tipo === "categoria") {
                editarCategoria(id);
            }
            if (tipo === "fornecedor") {
                editarFornecedor(id);
            }
            return;
        }
        let resposta = { ok: false, erro: "Acao desconhecida." };
        if (tipo === "peca") {
            resposta = await excluirPeca(id);
        }
        if (tipo === "categoria") {
            resposta = await excluirCategoria(id);
        }
        if (tipo === "fornecedor") {
            resposta = await excluirFornecedor(id);
        }
        if (tratarResposta(resposta)) {
            limparFormularioPeca();
            limparFormularioCategoria();
            limparFormularioFornecedor();
            await carregarTudo();
        }
    }
    catch (erro) {
        avisar((erro instanceof Error) ? erro.message : "Erro inesperado.", false);
    }
};
const ligarLista = (id) => {
    const lista = elemento(id);
    if (!lista) {
        return;
    }
    lista.addEventListener("click", (evento) => {
        const alvo = evento.target;
        if (!(alvo instanceof HTMLElement)) {
            return;
        }
        const acao = alvo.dataset.acao;
        const tipo = alvo.dataset.tipo;
        const registro = alvo.dataset.id;
        if (acao && tipo && registro) {
            executarAcao(acao, tipo, Number(registro));
        }
    });
};
const ligarFormularios = () => {
    const formPeca = elemento("formPeca");
    if (formPeca instanceof HTMLFormElement) {
        formPeca.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const dados = {
                id: Number(lerCampo("pecaId")),
                codigo: lerCampo("pecaCodigo"),
                nome: lerCampo("pecaNome"),
                categoria_id: Number(lerCampo("pecaCategoria")),
                fornecedor_id: Number(lerCampo("pecaFornecedor")),
                quantidade: Number(lerCampo("pecaQuantidade")),
                quantidade_minima: Number(lerCampo("pecaMinima")),
                valor_unitario: Number(lerCampo("pecaValor").replace(",", "."))
            };
            try {
                if (tratarResposta(await salvarPeca(dados))) {
                    limparFormularioPeca();
                    await carregarTudo();
                }
            }
            catch (erro) {
                avisar((erro instanceof Error) ? erro.message : "Erro inesperado.", false);
            }
        });
    }
    const formCategoria = elemento("formCategoria");
    if (formCategoria instanceof HTMLFormElement) {
        formCategoria.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            try {
                if (tratarResposta(await salvarCategoria(Number(lerCampo("categoriaId")), lerCampo("categoriaNome")))) {
                    limparFormularioCategoria();
                    await carregarTudo();
                }
            }
            catch (erro) {
                avisar((erro instanceof Error) ? erro.message : "Erro inesperado.", false);
            }
        });
    }
    const formFornecedor = elemento("formFornecedor");
    if (formFornecedor instanceof HTMLFormElement) {
        formFornecedor.addEventListener("submit", async (evento) => {
            evento.preventDefault();
            const dados = {
                id: Number(lerCampo("fornecedorId")),
                nome: lerCampo("fornecedorNome"),
                cnpj: lerCampo("fornecedorCnpj"),
                telefone: lerCampo("fornecedorTelefone"),
                cidade: lerCampo("fornecedorCidade"),
                pecas: 0
            };
            try {
                if (tratarResposta(await salvarFornecedor(dados))) {
                    limparFormularioFornecedor();
                    await carregarTudo();
                }
            }
            catch (erro) {
                avisar((erro instanceof Error) ? erro.message : "Erro inesperado.", false);
            }
        });
    }
};
const ligarCancelamentos = () => {
    const cancelarPeca = elemento("botaoCancelarPeca");
    if (cancelarPeca) {
        cancelarPeca.addEventListener("click", () => {
            limparFormularioPeca();
        });
    }
    const cancelarCategoria = elemento("botaoCancelarCategoria");
    if (cancelarCategoria) {
        cancelarCategoria.addEventListener("click", () => {
            limparFormularioCategoria();
        });
    }
    const cancelarFornecedor = elemento("botaoCancelarFornecedor");
    if (cancelarFornecedor) {
        cancelarFornecedor.addEventListener("click", () => {
            limparFormularioFornecedor();
        });
    }
};
const iniciar = () => {
    ligarFormularios();
    ligarCancelamentos();
    ligarLista("listaPecas");
    ligarLista("listaCategorias");
    ligarLista("listaFornecedores");
    carregarTudo();
};
document.addEventListener("DOMContentLoaded", iniciar);
