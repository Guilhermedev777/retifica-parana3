<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $busca     = trim($_GET["busca"] ?? "");
    $categoria = (int)($_GET["categoria"] ?? 0);
    $situacao  = trim($_GET["situacao"] ?? "");
    $pagina    = (int)($_GET["pagina"] ?? 1);
    $limite    = (int)($_GET["limite"] ?? 50);

    if ($pagina < 1) {
        $pagina = 1;
    }

    if ($limite < 1) {
        $limite = 50;
    }

    $offset = ($pagina - 1) * $limite;

    $sqlPeca = "call sp_listar_pecas(?, ?, ?, ?, ?)";
    $consultaPeca = $pdo->prepare($sqlPeca);
    $consultaPeca->execute([$busca, $categoria, $situacao, $limite, $offset]);

    $dadosPeca = $consultaPeca->fetchAll(PDO::FETCH_OBJ);
    $consultaPeca->closeCursor();

    $sqlTotal = "call sp_contar_pecas(?, ?, ?)";
    $consultaTotal = $pdo->prepare($sqlTotal);
    $consultaTotal->execute([$busca, $categoria, $situacao]);

    $dadosTotal = $consultaTotal->fetch(PDO::FETCH_OBJ);
    $consultaTotal->closeCursor();

    $pecas = [];
    foreach($dadosPeca as $dados) {
        $pecas[] = [
            "id"                => (int)   $dados->id,
            "codigo"            => (string)$dados->codigo,
            "nome"              => (string)$dados->nome,
            "categoria_id"      => (int)   $dados->categoria_id,
            "categoria"         => (string)$dados->categoria,
            "fornecedor_id"     => (int)   $dados->fornecedor_id,
            "fornecedor"        => (string)$dados->fornecedor,
            "quantidade"        => (int)   $dados->quantidade,
            "quantidade_minima" => (int)   $dados->quantidade_minima,
            "valor_unitario"    => (float) $dados->valor_unitario,
            "valor_em_estoque"  => (float) $dados->valor_em_estoque,
            "situacao"          => (string)$dados->situacao,
            "atualizado_em"     => (string)$dados->atualizado_em
        ];
    }

    echo json_encode([
        "ok"       => true,
        "total"    => count($pecas),
        "encontradas" => (int)$dadosTotal->total,
        "pagina"   => $pagina,
        "limite"   => $limite,
        "dados"    => $pecas
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel ler o estoque. Confira se o MySQL do XAMPP esta ligado e se o banco retifica_parana foi importado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
