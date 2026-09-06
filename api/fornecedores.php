<?php
header("Content-Type: application/json; charset=utf-8");
header("Cache-Control: no-store");

try {
    include "config/conexao.php";

    $sqlFornecedor = "select f.id, f.nome, f.cnpj, f.telefone, f.cidade, count(p.id) as pecas
                      from fornecedor f
                      left join peca p on p.fornecedor_id = f.id and p.ativo = 1
                      where f.ativo = 1
                      group by f.id, f.nome, f.cnpj, f.telefone, f.cidade
                      order by f.nome";

    $consultaFornecedor = $pdo->prepare($sqlFornecedor);
    $consultaFornecedor->execute();

    $dadosFornecedor = $consultaFornecedor->fetchAll(PDO::FETCH_OBJ);

    $fornecedores = [];
    foreach($dadosFornecedor as $dados) {
        $fornecedores[] = [
            "id"       => (int)   $dados->id,
            "nome"     => (string)$dados->nome,
            "cnpj"     => (string)$dados->cnpj,
            "telefone" => (string)($dados->telefone ?? ""),
            "cidade"   => (string)($dados->cidade ?? ""),
            "pecas"    => (int)   $dados->pecas
        ];
    }

    echo json_encode(["ok" => true, "total" => count($fornecedores), "dados" => $fornecedores], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        "ok"      => false,
        "erro"    => "Nao foi possivel ler os fornecedores. Confira se o MySQL do XAMPP esta ligado e se o banco retifica_parana foi importado.",
        "detalhe" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
