

USE retifica_parana;

CREATE OR REPLACE VIEW vw_pecas_dashboard AS
WITH peca_limpa AS (
    SELECT
        p.id,
        UPPER(TRIM(p.codigo))                     AS codigo,
        TRIM(p.nome)                              AS nome,
        p.categoria_id,
        p.fornecedor_id,
        ABS(COALESCE(p.quantidade, 0))            AS quantidade,
        ABS(COALESCE(p.quantidade_minima, 0))     AS quantidade_minima,
        ABS(COALESCE(p.valor_unitario, 0))        AS valor_unitario,
        p.atualizado_em
    FROM peca p
    WHERE p.ativo = 1
),
peca_consolidada AS (
    SELECT
        pl.id,
        pl.codigo,
        pl.nome,
        pl.categoria_id,
        COALESCE(TRIM(c.nome), 'SEM CATEGORIA')   AS categoria,
        pl.fornecedor_id,
        COALESCE(TRIM(f.nome), 'SEM FORNECEDOR')  AS fornecedor,
        pl.quantidade,
        pl.quantidade_minima,
        pl.valor_unitario,
        ROUND(pl.quantidade * pl.valor_unitario, 2) AS valor_em_estoque,
        CASE
            WHEN pl.quantidade = 0                      THEN 'SEM_ESTOQUE'
            WHEN pl.quantidade <= pl.quantidade_minima  THEN 'CRITICO'
            ELSE 'OK'
        END                                        AS situacao,
        pl.atualizado_em
    FROM peca_limpa pl
    LEFT JOIN categoria  c ON c.id = pl.categoria_id
    LEFT JOIN fornecedor f ON f.id = pl.fornecedor_id
)
SELECT *
FROM peca_consolidada;

-- resumo por categoria, usado para conferir os totais da tela
CREATE OR REPLACE VIEW vw_resumo_categoria AS
WITH base AS (
    SELECT categoria, quantidade, valor_em_estoque, situacao
    FROM vw_pecas_dashboard
)
SELECT
    categoria,
    COUNT(*)                                                AS itens_distintos,
    SUM(quantidade)                                         AS pecas_em_estoque,
    ROUND(SUM(valor_em_estoque), 2)                         AS valor_imobilizado,
    SUM(CASE WHEN situacao <> 'OK' THEN 1 ELSE 0 END)       AS itens_para_repor
FROM base
GROUP BY categoria;

-- SELECT * FROM vw_pecas_dashboard;
-- SELECT * FROM vw_resumo_categoria;
