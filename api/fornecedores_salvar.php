<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $id       = (int)($_POST["id"] ?? 0);
    $nome     = trim($_POST["nome"] ?? "");
    $cnpj     = trim($_POST["cnpj"] ?? "");
    $telefone = trim($_POST["telefone"] ?? "");
    $cidade   = trim($_POST["cidade"] ?? "");

    if ($nome == "") {
        echo json_encode(["ok" => false, "erro" => "Informe o nome do fornecedor."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($cnpj == "") {
        echo json_encode(["ok" => false, "erro" => "Informe o CNPJ do fornecedor."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlDuplicado = "select id from fornecedor where cnpj = ? and id <> ?";
    $consultaDuplicado = $pdo->prepare($sqlDuplicado);
    $consultaDuplicado->execute([$cnpj, $id]);

    if ($consultaDuplicado->fetch(PDO::FETCH_OBJ)) {
        echo json_encode(["ok" => false, "erro" => "Ja existe um fornecedor cadastrado com o CNPJ " . $cnpj . "."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($id == 0) {
        $sqlFornecedor = "insert into fornecedor (nome, cnpj, telefone, cidade) values (?, ?, ?, ?)";
        $consultaFornecedor = $pdo->prepare($sqlFornecedor);
        $consultaFornecedor->execute([$nome, $cnpj, $telefone, $cidade]);

        $mensagem = "Fornecedor " . $nome . " cadastrado.";
    } else {
        $sqlFornecedor = "update fornecedor set nome = ?, cnpj = ?, telefone = ?, cidade = ? where id = ?";
        $consultaFornecedor = $pdo->prepare($sqlFornecedor);
        $consultaFornecedor->execute([$nome, $cnpj, $telefone, $cidade, $id]);

        $mensagem = "Fornecedor " . $nome . " atualizado.";
    }

    echo json_encode(["ok" => true, "mensagem" => $mensagem], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel salvar o fornecedor. Confira se o MySQL do XAMPP esta ligado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
