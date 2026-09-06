
USE retifica_parana;

-- View centralizadora: junta quatro tabelas distintas (peca, categoria,
-- fornecedor e movimentacao_estoque) em uma consulta so, para o balcao ver a
-- ficha completa da peca sem abrir tabela por tabela.
CREATE OR REPLACE VIEW vw_ficha_peca AS
-- O desempate e pelo maior id, e nao pelo maior criado_em: duas movimentacoes
-- gravadas no mesmo segundo empatariam na data e a peca apareceria duas vezes.
WITH ultima_movimentacao AS (
    SELECT
        m.peca_id,
        MAX(m.id) AS movimentacao_id
    FROM movimentacao_estoque m
    GROUP BY m.peca_id
),
movimentacao_detalhada AS (
    SELECT
        m.peca_id,
        m.tipo,
        m.quantidade,
        m.observacao,
        m.criado_em
    FROM movimentacao_estoque m
    INNER JOIN ultima_movimentacao u
        ON u.movimentacao_id = m.id
)
SELECT
    p.id,
    UPPER(TRIM(p.codigo))                                     AS codigo,
    TRIM(p.nome)                                              AS nome,
    COALESCE(TRIM(c.nome), 'SEM CATEGORIA')                   AS categoria,
    COALESCE(TRIM(f.nome), 'SEM FORNECEDOR')                  AS fornecedor,
    COALESCE(f.cidade, '-')                                   AS fornecedor_cidade,
    COALESCE(f.telefone, '-')                                 AS fornecedor_telefone,
    p.quantidade,
    p.quantidade_minima,
    p.valor_unitario,
    fn_valor_estoque(p.quantidade, p.valor_unitario)          AS valor_em_estoque,
    fn_situacao_estoque(p.quantidade, p.quantidade_minima)    AS situacao,
    COALESCE(md.tipo, 'SEM MOVIMENTO')                        AS ultima_movimentacao_tipo,
    COALESCE(md.quantidade, 0)                                AS ultima_movimentacao_quantidade,
    COALESCE(md.observacao, '-')                              AS ultima_movimentacao_observacao,
    md.criado_em                                              AS ultima_movimentacao_em
FROM peca p
LEFT JOIN categoria             c  ON c.id = p.categoria_id
LEFT JOIN fornecedor            f  ON f.id = p.fornecedor_id
LEFT JOIN movimentacao_detalhada md ON md.peca_id = p.id
WHERE p.ativo = 1;

-- SELECT * FROM vw_ficha_peca;
