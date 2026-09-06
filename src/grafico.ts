import { formatarReais } from "./metricas.js";
import { PontoGrafico } from "./tipos.js";

const larguraTotal: number = 640;
const alturaBarra: number = 26;
const espacoEntreBarras: number = 12;
const margemRotulo: number = 150;
const margemValor: number = 96;

const limparTexto = (texto: string): string => {
    return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const maiorValor = (pontos: PontoGrafico[]): number => {
    let maior = 0;

    for (const ponto of pontos) {
        if (ponto.valor > maior) {
            maior = ponto.valor;
        }
    }

    return (maior > 0) ? maior : 1;
}

const montarBarra = (ponto: PontoGrafico, posicao: number, maior: number): string => {
    const larguraUtil = larguraTotal - margemRotulo - margemValor;
    const largura = Math.max(2, Math.round((ponto.valor / maior) * larguraUtil));
    const topo = espacoEntreBarras + posicao * (alturaBarra + espacoEntreBarras);
    const meio = topo + alturaBarra / 2 + 4;

    return `
    <text class="gr-rotulo" x="${margemRotulo - 10}" y="${meio}" text-anchor="end">${limparTexto(ponto.rotulo)}</text>
    <rect class="gr-trilho" x="${margemRotulo}" y="${topo}" width="${larguraUtil}" height="${alturaBarra}" rx="2"></rect>
    <rect class="gr-barra" x="${margemRotulo}" y="${topo}" width="${largura}" height="${alturaBarra}" rx="2"></rect>
    <text class="gr-valor" x="${margemRotulo + larguraUtil + 8}" y="${meio}">${formatarReais(ponto.valor)}</text>`;
}

export const desenharGrafico = (pontos: PontoGrafico[]): string => {
    if (pontos.length === 0) {
        return "";
    }

    const maior = maiorValor(pontos);
    const altura = pontos.length * (alturaBarra + espacoEntreBarras) + espacoEntreBarras;

    let barras = "";

    for (let indice = 0; indice < pontos.length; indice++) {
        barras = barras + montarBarra(pontos[indice], indice, maior);
    }

    return `<svg class="grafico" viewBox="0 0 ${larguraTotal} ${altura}" role="img" aria-label="Valor imobilizado por categoria">${barras}
    </svg>`;
}
