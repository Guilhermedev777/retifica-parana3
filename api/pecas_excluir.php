<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $id = (int)($_POST["id"] ?? 0);

    $sqlPeca = "select upper(trim(codigo)) as codigo, quantidade from peca where id = ? and ativo = 1";
    $consultaPeca = $pdo->prepare($sqlPeca);
    $consultaPeca->execute([$id]);

    $dados = $consultaPeca->fetch(PDO::FETCH_OBJ);

    if (!$dados) {
        echo json_encode(["ok" => false, "erro" => "Esta peca ja foi excluida ou nunca existiu."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($dados->quantidade > 0) {
        echo json_encode([
            "ok"   => false,
            "erro" => "Ainda ha " . $dados->quantidade . " unidade(s) de " . $dados->codigo . " no estoque. Zere a quantidade antes de excluir."
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlExcluir = "update peca set ativo = 0 where id = ?";
    $consultaExcluir = $pdo->prepare($sqlExcluir);
    $consultaExcluir->execute([$id]);

    echo json_encode([
        "ok"       => true,
        "mensagem" => "Peca " . $dados->codigo . " excluida. O historico de movimentacao foi mantido."
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel excluir a peca. Confira se o MySQL do XAMPP esta ligado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
