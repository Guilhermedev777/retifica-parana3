<?php
    $titulo = "Cadastros";
    $pagina = "cadastro";
    $script = "js/cadastro.js";

    include "partes/cabecalho.php";
?>

    <header class="cabecalho">
        <p class="olho">Estoque / cadastros</p>
        <h1 class="titulo">Cadastros</h1>
        <p class="subtitulo">
            Pecas, categorias e fornecedores. As regras de exclusao avisam antes de apagar qualquer coisa.
        </p>
    </header>

    <div class="alert aviso-cadastro" id="avisoCadastro" role="status" hidden></div>

    <section class="card bloco">
        <h2 class="bloco__titulo">Pecas</h2>

        <form class="formulario" id="formPeca">
            <input type="hidden" id="pecaId" value="0">

            <div class="formulario__campo">
                <label class="formulario__rotulo" for="pecaCodigo">Codigo</label>
                <input class="form-control" type="text" id="pecaCodigo" placeholder="PN-6001">
            </div>

            <div class="formulario__campo formulario__campo--largo">
                <label class="formulario__rotulo" for="pecaNome">Nome</label>
                <input class="form-control" type="text" id="pecaNome" placeholder="Biela retificada 1.6">
            </div>

            <div class="formulario__campo">
                <label class="formulario__rotulo" for="pecaCategoria">Categoria</label>
                <select class="form-select" id="pecaCategoria"></select>
            </div>

            <div class="formulario__campo">
                <label class="formulario__rotulo" for="pecaFornecedor">Fornecedor</label>
                <select class="form-select" id="pecaFornecedor"></select>
            </div>

            <div class="formulario__campo formulario__campo--estreito">
                <label class="formulario__rotulo" for="pecaQuantidade">Quantidade</label>
                <input class="form-control" type="number" id="pecaQuantidade" value="0" min="0">
            </div>

            <div class="formulario__campo formulario__campo--estreito">
                <label class="formulario__rotulo" for="pecaMinima">Minimo</label>
                <input class="form-control" type="number" id="pecaMinima" value="1" min="0">
            </div>

            <div class="formulario__campo formulario__campo--estreito">
                <label class="formulario__rotulo" for="pecaValor">Valor unitario</label>
                <input class="form-control" type="text" id="pecaValor" value="0,00">
            </div>

            <div class="formulario__acoes">
                <button class="btn botao-salvar" type="submit">Salvar peca</button>
                <button class="btn botao-cancelar" type="button" id="botaoCancelarPeca">Limpar</button>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table tabela align-middle">
                <thead>
                    <tr>
                        <th scope="col">Codigo</th>
                        <th scope="col">Nome</th>
                        <th scope="col">Categoria</th>
                        <th scope="col">Fornecedor</th>
                        <th scope="col" class="cel-num">Qtd</th>
                        <th scope="col" class="cel-num">Unitario</th>
                        <th scope="col" class="cel-acoes">Acoes</th>
                    </tr>
                </thead>
                <tbody id="listaPecas"></tbody>
            </table>
        </div>
    </section>

    <section class="card bloco">
        <h2 class="bloco__titulo">Categorias</h2>

        <form class="formulario" id="formCategoria">
            <input type="hidden" id="categoriaId" value="0">

            <div class="formulario__campo formulario__campo--largo">
                <label class="formulario__rotulo" for="categoriaNome">Nome da categoria</label>
                <input class="form-control" type="text" id="categoriaNome" placeholder="Bielas">
            </div>

            <div class="formulario__acoes">
                <button class="btn botao-salvar" type="submit">Salvar categoria</button>
                <button class="btn botao-cancelar" type="button" id="botaoCancelarCategoria">Limpar</button>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table tabela align-middle">
                <thead>
                    <tr>
                        <th scope="col">Categoria</th>
                        <th scope="col" class="cel-num">Pecas</th>
                        <th scope="col" class="cel-acoes">Acoes</th>
                    </tr>
                </thead>
                <tbody id="listaCategorias"></tbody>
            </table>
        </div>
    </section>

    <section class="card bloco">
        <h2 class="bloco__titulo">Fornecedores</h2>

        <form class="formulario" id="formFornecedor">
            <input type="hidden" id="fornecedorId" value="0">

            <div class="formulario__campo formulario__campo--largo">
                <label class="formulario__rotulo" for="fornecedorNome">Nome</label>
                <input class="form-control" type="text" id="fornecedorNome" placeholder="Metalurgica Sao Jose">
            </div>

            <div class="formulario__campo">
                <label class="formulario__rotulo" for="fornecedorCnpj">CNPJ</label>
                <input class="form-control" type="text" id="fornecedorCnpj" placeholder="11.222.333/0001-44">
            </div>

            <div class="formulario__campo">
                <label class="formulario__rotulo" for="fornecedorTelefone">Telefone</label>
                <input class="form-control" type="text" id="fornecedorTelefone" placeholder="(44) 3523-1100">
            </div>

            <div class="formulario__campo">
                <label class="formulario__rotulo" for="fornecedorCidade">Cidade</label>
                <input class="form-control" type="text" id="fornecedorCidade" placeholder="Campo Mourao">
            </div>

            <div class="formulario__acoes">
                <button class="btn botao-salvar" type="submit">Salvar fornecedor</button>
                <button class="btn botao-cancelar" type="button" id="botaoCancelarFornecedor">Limpar</button>
            </div>
        </form>

        <div class="table-responsive">
            <table class="table tabela align-middle">
                <thead>
                    <tr>
                        <th scope="col">Fornecedor</th>
                        <th scope="col">CNPJ</th>
                        <th scope="col">Cidade</th>
                        <th scope="col" class="cel-num">Pecas</th>
                        <th scope="col" class="cel-acoes">Acoes</th>
                    </tr>
                </thead>
                <tbody id="listaFornecedores"></tbody>
            </table>
        </div>
    </section>

<?php include "partes/rodape.php"; ?>
