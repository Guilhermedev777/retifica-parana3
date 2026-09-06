
USE retifica_parana;

DROP FUNCTION IF EXISTS fn_situacao_estoque;
DROP FUNCTION IF EXISTS fn_valor_estoque;

DELIMITER $$

CREATE FUNCTION fn_situacao_estoque(p_quantidade INT, p_quantidade_minima INT)
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
    IF COALESCE(p_quantidade, 0) = 0 THEN
        RETURN 'SEM_ESTOQUE';
    END IF;

    IF COALESCE(p_quantidade, 0) <= COALESCE(p_quantidade_minima, 0) THEN
        RETURN 'CRITICO';
    END IF;

    RETURN 'OK';
END$$

CREATE FUNCTION fn_valor_estoque(p_quantidade INT, p_valor_unitario DECIMAL(10, 2))
RETURNS DECIMAL(12, 2)
DETERMINISTIC
BEGIN
    RETURN ROUND(ABS(COALESCE(p_quantidade, 0)) * ABS(COALESCE(p_valor_unitario, 0)), 2);
END$$

DELIMITER ;

-- A regra de situacao e o calculo do valor nasceram escritos a mao dentro da view,
-- em 03_views_ctes.sql. Agora que viraram funcao, a view e reescrita chamando as
-- duas: a regra passa a existir em um lugar so e e reaproveitada pela view
-- centralizadora (06) e pelas procedures (07).
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
        fn_valor_estoque(pl.quantidade, pl.valor_unitario)          AS valor_em_estoque,
        fn_situacao_estoque(pl.quantidade, pl.quantidade_minima)    AS situacao,
        pl.atualizado_em
    FROM peca_limpa pl
    LEFT JOIN categoria  c ON c.id = pl.categoria_id
    LEFT JOIN fornecedor f ON f.id = pl.fornecedor_id
)
SELECT *
FROM peca_consolidada;

-- SELECT fn_situacao_estoque(0, 5), fn_situacao_estoque(3, 6), fn_situacao_estoque(40, 12);
-- SELECT fn_valor_estoque(12, 189.90);
