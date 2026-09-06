<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $id   = (int)($_POST["id"] ?? 0);
    $nome = trim($_POST["nome"] ?? "");

    if ($nome == "") {
        echo json_encode(["ok" => false, "erro" => "Informe o nome da categoria."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlDuplicado = "select id from categoria where nome = ? and id <> ?";
    $consultaDuplicado = $pdo->prepare($sqlDuplicado);
    $consultaDuplicado->execute([$nome, $id]);

    if ($consultaDuplicado->fetch(PDO::FETCH_OBJ)) {
        echo json_encode(["ok" => false, "erro" => "Ja existe uma categoria chamada " . $nome . "."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($id == 0) {
        $sqlCategoria = "insert into categoria (nome) values (?)";
        $consultaCategoria = $pdo->prepare($sqlCategoria);
        $consultaCategoria->execute([$nome]);

        $mensagem = "Categoria " . $nome . " cadastrada.";
    } else {
        $sqlCategoria = "update categoria set nome = ? where id = ?";
        $consultaCategoria = $pdo->prepare($sqlCategoria);
        $consultaCategoria->execute([$nome, $id]);

        $mensagem = "Categoria " . $nome . " atualizada.";
    }

    echo json_encode(["ok" => true, "mensagem" => $mensagem], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel salvar a categoria. Confira se o MySQL do XAMPP esta ligado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
