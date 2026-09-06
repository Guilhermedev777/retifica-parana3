<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $id = (int)($_POST["id"] ?? 0);

    $sqlFornecedor = "select nome from fornecedor where id = ? and ativo = 1";
    $consultaFornecedor = $pdo->prepare($sqlFornecedor);
    $consultaFornecedor->execute([$id]);

    $dados = $consultaFornecedor->fetch(PDO::FETCH_OBJ);

    if (!$dados) {
        echo json_encode(["ok" => false, "erro" => "Este fornecedor ja foi excluido ou nunca existiu."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlVinculo = "select count(*) as pecas from peca where fornecedor_id = ? and ativo = 1";
    $consultaVinculo = $pdo->prepare($sqlVinculo);
    $consultaVinculo->execute([$id]);

    $vinculo = $consultaVinculo->fetch(PDO::FETCH_OBJ);

    if ($vinculo->pecas > 0) {
        echo json_encode([
            "ok"   => false,
            "erro" => "O fornecedor " . $dados->nome . " tem " . $vinculo->pecas . " peca(s) ligada(s). Troque o fornecedor dessas pecas antes de excluir."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlExcluir = "update fornecedor set ativo = 0 where id = ?";
    $consultaExcluir = $pdo->prepare($sqlExcluir);
    $consultaExcluir->execute([$id]);

    echo json_encode([
        "ok"       => true,
        "mensagem" => "Fornecedor " . $dados->nome . " excluido."
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel excluir o fornecedor. Confira se o MySQL do XAMPP esta ligado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
