<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $id = (int)($_POST["id"] ?? 0);

    $sqlCategoria = "select nome from categoria where id = ?";
    $consultaCategoria = $pdo->prepare($sqlCategoria);
    $consultaCategoria->execute([$id]);

    $dados = $consultaCategoria->fetch(PDO::FETCH_OBJ);

    if (!$dados) {
        echo json_encode(["ok" => false, "erro" => "Esta categoria ja foi excluida ou nunca existiu."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // A categoria e apagada de verdade, entao a contagem precisa incluir as pecas
    // ja excluidas logicamente: elas continuam apontando para a categoria pela
    // chave estrangeira e derrubariam o delete.
    $sqlVinculo = "select count(*) as total, sum(ativo) as ativas from peca where categoria_id = ?";
    $consultaVinculo = $pdo->prepare($sqlVinculo);
    $consultaVinculo->execute([$id]);

    $vinculo = $consultaVinculo->fetch(PDO::FETCH_OBJ);
    $ativas = (int)$vinculo->ativas;
    $total = (int)$vinculo->total;

    if ($ativas > 0) {
        echo json_encode([
            "ok"   => false,
            "erro" => "A categoria " . $dados->nome . " tem " . $ativas . " peca(s) na prateleira. Mova essas pecas para outra categoria antes de excluir."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($total > 0) {
        echo json_encode([
            "ok"   => false,
            "erro" => "A categoria " . $dados->nome . " nao tem pecas na prateleira, mas ainda guarda " . $total . " peca(s) excluida(s) no historico. Mova essas pecas para outra categoria antes de excluir."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlExcluir = "delete from categoria where id = ?";
    $consultaExcluir = $pdo->prepare($sqlExcluir);
    $consultaExcluir->execute([$id]);

    echo json_encode([
        "ok"       => true,
        "mensagem" => "Categoria " . $dados->nome . " excluida."
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel excluir a categoria. Confira se o MySQL do XAMPP esta ligado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
