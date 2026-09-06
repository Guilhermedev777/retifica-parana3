<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $id               = (int)($_POST["id"] ?? 0);
    $codigo           = trim($_POST["codigo"] ?? "");
    $nome             = trim($_POST["nome"] ?? "");
    $categoriaId      = (int)($_POST["categoria_id"] ?? 0);
    $fornecedorId     = (int)($_POST["fornecedor_id"] ?? 0);
    $quantidade       = (int)($_POST["quantidade"] ?? 0);
    $quantidadeMinima = (int)($_POST["quantidade_minima"] ?? 0);
    $valorUnitario    = (float)str_replace(",", ".", $_POST["valor_unitario"] ?? "0");

    if ($codigo == "") {
        echo json_encode(["ok" => false, "erro" => "Informe o codigo da peca."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($nome == "") {
        echo json_encode(["ok" => false, "erro" => "Informe o nome da peca."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($categoriaId == 0) {
        echo json_encode(["ok" => false, "erro" => "Escolha uma categoria para a peca."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sqlDuplicado = "select id from peca where codigo = ? and id <> ?";
    $consultaDuplicado = $pdo->prepare($sqlDuplicado);
    $consultaDuplicado->execute([$codigo, $id]);

    if ($consultaDuplicado->fetch(PDO::FETCH_OBJ)) {
        echo json_encode(["ok" => false, "erro" => "Ja existe uma peca com o codigo " . strtoupper($codigo) . "."], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($id == 0) {
        $sqlPeca = "insert into peca (codigo, nome, categoria_id, fornecedor_id, quantidade, quantidade_minima, valor_unitario)
                    values (?, ?, ?, ?, ?, ?, ?)";
        $consultaPeca = $pdo->prepare($sqlPeca);
        $consultaPeca->execute([$codigo, $nome, $categoriaId, ($fornecedorId > 0 ? $fornecedorId : null), $quantidade, $quantidadeMinima, $valorUnitario]);

        $mensagem = "Peca " . strtoupper($codigo) . " cadastrada.";
    } else {
        $sqlPeca = "update peca
                    set codigo = ?, nome = ?, categoria_id = ?, fornecedor_id = ?,
                        quantidade = ?, quantidade_minima = ?, valor_unitario = ?
                    where id = ?";
        $consultaPeca = $pdo->prepare($sqlPeca);
        $consultaPeca->execute([$codigo, $nome, $categoriaId, ($fornecedorId > 0 ? $fornecedorId : null), $quantidade, $quantidadeMinima, $valorUnitario, $id]);

        $mensagem = "Peca " . strtoupper($codigo) . " atualizada.";
    }

    echo json_encode(["ok" => true, "mensagem" => $mensagem], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel salvar a peca. Confira se o MySQL do XAMPP esta ligado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
