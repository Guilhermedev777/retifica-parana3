<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $sqlCategoria = "select c.id, c.nome, count(p.id) as pecas
                     from categoria c
                     left join peca p on p.categoria_id = c.id and p.ativo = 1
                     group by c.id, c.nome
                     order by c.nome";

    $consultaCategoria = $pdo->prepare($sqlCategoria);
    $consultaCategoria->execute();

    $dadosCategoria = $consultaCategoria->fetchAll(PDO::FETCH_OBJ);

    $categorias = [];
    foreach($dadosCategoria as $dados) {
        $categorias[] = [
            "id"    => (int)   $dados->id,
            "nome"  => (string)$dados->nome,
            "pecas" => (int)   $dados->pecas
        ];
    }

    echo json_encode(["ok" => true, "total" => count($categorias), "dados" => $categorias], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel ler as categorias. Confira se o MySQL do XAMPP esta ligado e se o banco retifica_parana foi importado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

