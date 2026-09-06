<?php
    $titulo = "Controle de pecas";
    $pagina = "index";
    $script = "js/main.js";

    include "partes/cabecalho.php";
?>

    <header class="cabecalho">
        <p class="olho">Estoque / oficina</p>
        <h1 class="titulo">Controle de pecas</h1>
        <p class="subtitulo">
            Leitura direta do balcao: o que tem na prateleira, quanto vale e o que precisa ser reposto.
        </p>
    </header>

    <form class="filtros" id="formularioFiltro">
        <div class="filtros__campo">
            <label class="filtros__rotulo" for="campoBusca">Buscar</label>
            <input class="form-control" type="search" id="campoBusca" placeholder="codigo ou nome da peca">
        </div>

        <div class="filtros__campo">
            <label class="filtros__rotulo" for="campoCategoria">Categoria</label>
            <select class="form-select" id="campoCategoria">
                <option value="0">Todas as categorias</option>
            </select>
        </div>

        <div class="filtros__campo">
            <label class="filtros__rotulo" for="campoSituacao">Situacao</label>
            <select class="form-select" id="campoSituacao">
                <option value="">Todas</option>
                <option value="OK">Em nivel</option>
                <option value="CRITICO">Repor</option>
                <option value="SEM_ESTOQUE">Zerado</option>
            </select>
        </div>

        <div class="filtros__campo filtros__campo--estreito">
            <label class="filtros__rotulo" for="campoLimite">Por pagina</label>
            <select class="form-select" id="campoLimite">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50" selected>50</option>
            </select>
        </div>

        <button class="btn botao-filtrar" type="submit">Filtrar</button>
    </form>

    <div class="estado" id="carregando">
        <div class="spinner-border spinner" role="status" aria-hidden="true"></div>
        <span>Lendo o estoque...</span>
    </div>

    <div class="alert aviso" id="aviso" role="alert" hidden>
        <strong class="aviso__titulo">A leitura nao chegou.</strong>
        <span id="avisoTexto"></span>
        <span class="aviso__dica">Ligue o Apache e o MySQL no XAMPP e clique em "Atualizar leitura".</span>
    </div>

    <div id="painel" hidden>

        <section class="indicadores" aria-label="Indicadores do estoque">
            <article class="card indicador">
                <span class="escala" aria-hidden="true"></span>
                <p class="indicador__rotulo">Valor em estoque</p>
                <p class="indicador__valor indicador__valor--destaque" id="indicadorValor">R$ 0,00</p>
                <p class="indicador__nota">quantidade x valor unitario</p>
            </article>

            <article class="card indicador">
                <span class="escala" aria-hidden="true"></span>
                <p class="indicador__rotulo">Pecas na prateleira</p>
                <p class="indicador__valor" id="indicadorPecas">0</p>
                <p class="indicador__nota">soma de todas as unidades</p>
            </article>

            <article class="card indicador">
                <span class="escala" aria-hidden="true"></span>
                <p class="indicador__rotulo">Itens cadastrados</p>
                <p class="indicador__valor" id="indicadorItens">0</p>
                <p class="indicador__nota">codigos distintos ativos</p>
            </article>

            <article class="card indicador indicador--atencao">
                <span class="escala" aria-hidden="true"></span>
                <p class="indicador__rotulo">Precisam de reposicao</p>
                <p class="indicador__valor" id="indicadorRepor">0</p>
                <p class="indicador__nota">no minimo ou zerados</p>
            </article>
        </section>

        <section class="analise">
            <article class="card bloco">
                <h2 class="bloco__titulo">Onde o dinheiro esta parado</h2>
                <div class="destaques">
                    <div class="destaque">
                        <p class="destaque__rotulo">Categoria que mais imobiliza</p>
                        <p class="destaque__valor" id="destaqueCategoria">-</p>
                        <p class="destaque__nota" id="destaqueCategoriaValor">R$ 0,00</p>
                    </div>
                    <div class="destaque">
                        <p class="destaque__rotulo">Peca de maior valor parado</p>
                        <p class="destaque__valor" id="destaquePeca">-</p>
                        <p class="destaque__nota" id="destaquePecaValor">R$ 0,00</p>
                    </div>
                </div>
                <div class="grafico-caixa" id="grafico"></div>
            </article>
        </section>

        <section class="card bloco-tabela">
            <div class="bloco-tabela__topo">
                <h2 class="bloco-tabela__titulo">Prateleira</h2>

                <div class="abas" role="group" aria-label="Recortes da prateleira">
                    <button class="btn aba aba--ativa" type="button" id="aba-todas">Todas</button>
                    <button class="btn aba" type="button" id="aba-repor">Repor</button>
                    <button class="btn aba" type="button" id="aba-zeradas">Zeradas</button>
                </div>
            </div>

            <div class="vazio" id="vazio" hidden>
                <p class="vazio__titulo">Nenhuma peca registrada ainda.</p>
                <p class="vazio__texto">Cadastre a primeira peca na tela de <a href="cadastro.php">Cadastros</a> e volte aqui.</p>
            </div>

            <div class="table-responsive">
                <table class="table tabela align-middle">
                    <thead>
                        <tr>
                            <th scope="col">Codigo</th>
                            <th scope="col">Peca</th>
                            <th scope="col" class="cel-num">Quantidade</th>
                            <th scope="col" class="cel-num">Unitario</th>
                            <th scope="col" class="cel-num">Total</th>
                            <th scope="col" class="cel-situacao">Situacao</th>
                        </tr>
                    </thead>
                    <tbody id="corpoTabela"></tbody>
                </table>
            </div>

            <div class="paginacao">
                <button class="btn botao-pagina" type="button" id="botaoAnterior">Anterior</button>
                <span class="paginacao__rotulo" id="rotuloPagina">-</span>
                <button class="btn botao-pagina" type="button" id="botaoProxima">Proxima</button>
            </div>
        </section>

    </div>

<?php include "partes/rodape.php"; ?>
