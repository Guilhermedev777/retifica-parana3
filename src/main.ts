import { apenasZeradas, categoriaQueMaisImobiliza, paraLinhaTabela, paraRepor, paraSerieGrafico, pecaDeMaiorValor, somarValorPorCategoria } from "./analises.js";
import { buscarCategorias, buscarPecas } from "./api.js";
import { desenharGrafico } from "./grafico.js";
import { calcularMetricas, formatarInteiro, formatarReais } from "./metricas.js";
import { Categoria, FiltroPecas, LinhaTabela, Peca } from "./tipos.js";

let pecasDaPagina: Peca[] = [];
let encontradas: number = 0;
let abaAtiva: string = "todas";

const filtro: FiltroPecas = {
    busca: "",
    categoria: 0,
    situacao: "",
    pagina: 1,
    limite: 50
};

const elemento = (id: string): HTMLElement|null => {
    return document.getElementById(id);
}

const campo = (id: string): HTMLInputElement|HTMLSelectElement|null => {
    const alvo = elemento(id);

    if (alvo instanceof HTMLInputElement || alvo instanceof HTMLSelectElement) {
        return alvo;
    }

    return null;
}

const escrever = (id: string, texto: string): void => {
    const alvo = elemento(id);

    if (alvo) {
        alvo.textContent = texto;
    }
}

const desenhar = (id: string, html: string): void => {
    const alvo = elemento(id);

    if (alvo) {
        alvo.innerHTML = html;
    }
}

const exibir = (id: string, visivel: boolean): void => {
    const alvo = elemento(id);

    if (alvo) {
        alvo.hidden = !visivel;
    }
}

const limparTexto = (texto: string): string => {
    return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const mostrarSomente = (estado: string): void => {
    exibir("carregando", (estado === "carregando") ? true : false);
    exibir("aviso", (estado === "aviso") ? true : false);
    exibir("painel", (estado === "painel") ? true : false);
}

const pecasDaAba = (): Peca[] => {
    if (abaAtiva === "repor") {
        return paraRepor(pecasDaPagina);
    }

    if (abaAtiva === "zeradas") {
        return apenasZeradas(pecasDaPagina);
    }

    return pecasDaPagina;
}

const montarLinha = (linha: LinhaTabela): string => {
    const situacao = linha.situacao.toLowerCase();

    return `
    <tr class="linha-peca linha-peca--${situacao}">
      <td class="cel-codigo">${limparTexto(linha.codigo)}</td>
      <td>
        <span class="peca-nome">${limparTexto(linha.nome)}</span>
        <span class="peca-categoria">${limparTexto(linha.categoria)}</span>
      </td>
      <td class="cel-num">
        <span class="quantidade">${linha.quantidade}</span>
        <span class="quantidade-minima">min ${linha.quantidadeMinima}</span>
        <span class="medidor" aria-hidden="true"><i style="width:${linha.nivel}%"></i></span>
      </td>
      <td class="cel-num">${linha.valorUnitario}</td>
      <td class="cel-num cel-total">${linha.valorTotal}</td>
      <td class="cel-situacao">
        <span class="badge rounded-pill selo selo--${situacao}">${linha.rotulo}</span>
      </td>
    </tr>`;
}

const renderizarTabela = (pecas: Peca[]): void => {
    const linhas = paraLinhaTabela(pecas);

    let html = "";

    for (const linha of linhas) {
        html = html + montarLinha(linha);
    }

    desenhar("corpoTabela", html);
    exibir("vazio", (linhas.length === 0) ? true : false);
}

const renderizarIndicadores = (pecas: Peca[]): void => {
    const metricas = calcularMetricas(pecas);

    escrever("indicadorValor", formatarReais(metricas.valorImobilizado));
    escrever("indicadorPecas", formatarInteiro(metricas.pecasEmEstoque));
    escrever("indicadorItens", formatarInteiro(metricas.itensDistintos));
    escrever("indicadorRepor", formatarInteiro(metricas.itensParaRepor));
}

const renderizarDestaques = (pecas: Peca[]): void => {
    const categoria = categoriaQueMaisImobiliza(pecas);
    const peca = pecaDeMaiorValor(pecas);

    if (categoria) {
        escrever("destaqueCategoria", categoria.rotulo);
        escrever("destaqueCategoriaValor", formatarReais(categoria.valor));
    } else {
        escrever("destaqueCategoria", "-");
        escrever("destaqueCategoriaValor", formatarReais(0));
    }

    if (peca) {
        escrever("destaquePeca", peca.nome);
        escrever("destaquePecaValor", formatarReais(peca.valor_em_estoque));
    } else {
        escrever("destaquePeca", "-");
        escrever("destaquePecaValor", formatarReais(0));
    }
}

const renderizarGrafico = (pecas: Peca[]): void => {
    const serie = paraSerieGrafico(somarValorPorCategoria(pecas));
    desenhar("grafico", desenharGrafico(serie));
}

const renderizarPaginacao = (): void => {
    const primeira = (filtro.pagina - 1) * filtro.limite + 1;
    const ultima = primeira + pecasDaPagina.length - 1;

    if (encontradas === 0) {
        escrever("rotuloPagina", "nenhuma peca encontrada");
    } else {
        escrever("rotuloPagina", primeira + " a " + ultima + " de " + encontradas);
    }

    const anterior = elemento("botaoAnterior");
    const proxima = elemento("botaoProxima");

    if (anterior instanceof HTMLButtonElement) {
        anterior.disabled = (filtro.pagina <= 1) ? true : false;
    }

    if (proxima instanceof HTMLButtonElement) {
        proxima.disabled = (ultima >= encontradas) ? true : false;
    }
}

const marcarAba = (): void => {
    const abas = ["todas", "repor", "zeradas"];

    for (const nome of abas) {
        const botao = elemento("aba-" + nome);

        if (botao) {
            botao.classList.toggle("aba--ativa", nome === abaAtiva);
        }
    }
}

const marcarHorario = (): void => {
    const agora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    escrever("carimbo", "leitura das " + agora);
}

const renderizarTudo = (): void => {
    const visiveis = pecasDaAba();

    renderizarIndicadores(pecasDaPagina);
    renderizarDestaques(pecasDaPagina);
    renderizarGrafico(pecasDaPagina);
    renderizarTabela(visiveis);
    renderizarPaginacao();
    marcarAba();
}

const preencherCategorias = (categorias: Categoria[]): void => {
    const seletor = campo("campoCategoria");

    if (!(seletor instanceof HTMLSelectElement)) {
        return;
    }

    let opcoes = '<option value="0">Todas as categorias</option>';

    for (const categoria of categorias) {
        opcoes = opcoes + '<option value="' + categoria.id + '">' + limparTexto(categoria.nome) + "</option>";
    }

    seletor.innerHTML = opcoes;
    seletor.value = String(filtro.categoria);
}

const atualizarPainel = async (): Promise<void> => {
    mostrarSomente("carregando");

    try {
        const pagina = await buscarPecas(filtro);

        pecasDaPagina = pagina.pecas;
        encontradas = pagina.encontradas;

        renderizarTudo();
        mostrarSomente("painel");
        marcarHorario();
    } catch (erro) {
        const mensagem = (erro instanceof Error) ? erro.message : "Erro inesperado.";
        escrever("avisoTexto", mensagem);
        mostrarSomente("aviso");
    }
}

const carregarCategorias = async (): Promise<void> => {
    try {
        const categorias = await buscarCategorias();
        preencherCategorias(categorias);
    } catch (erro) {
        escrever("avisoTexto", (erro instanceof Error) ? erro.message : "Erro inesperado.");
    }
}

const lerFiltros = (): void => {
    const busca = campo("campoBusca");
    const categoria = campo("campoCategoria");
    const situacao = campo("campoSituacao");
    const limite = campo("campoLimite");

    filtro.busca = (busca) ? busca.value.trim() : "";
    filtro.categoria = (categoria) ? Number(categoria.value) : 0;
    filtro.situacao = (situacao) ? situacao.value : "";
    filtro.limite = (limite) ? Number(limite.value) : 50;
    filtro.pagina = 1;
}

const ligarEventos = (): void => {
    const formulario = elemento("formularioFiltro");

    if (formulario instanceof HTMLFormElement) {
        formulario.addEventListener("submit", (evento) => {
            evento.preventDefault();
            lerFiltros();
            atualizarPainel();
        });
    }

    const botao = elemento("botaoAtualizar");

    if (botao) {
        botao.addEventListener("click", () => {
            atualizarPainel();
        });
    }

    const anterior = elemento("botaoAnterior");

    if (anterior) {
        anterior.addEventListener("click", () => {
            if (filtro.pagina > 1) {
                filtro.pagina = filtro.pagina - 1;
                atualizarPainel();
            }
        });
    }

    const proxima = elemento("botaoProxima");

    if (proxima) {
        proxima.addEventListener("click", () => {
            filtro.pagina = filtro.pagina + 1;
            atualizarPainel();
        });
    }

    const abas = ["todas", "repor", "zeradas"];

    for (const nome of abas) {
        const aba = elemento("aba-" + nome);

        if (aba) {
            aba.addEventListener("click", () => {
                abaAtiva = nome;
                renderizarTudo();
            });
        }
    }
}

const iniciar = (): void => {
    ligarEventos();
    carregarCategorias();
    atualizarPainel();
}

document.addEventListener("DOMContentLoaded", iniciar);
