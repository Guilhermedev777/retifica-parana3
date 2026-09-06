
USE retifica_parana;

DROP PROCEDURE IF EXISTS sp_listar_pecas;
DROP PROCEDURE IF EXISTS sp_contar_pecas;
DROP PROCEDURE IF EXISTS sp_resumo_dashboard;
DROP PROCEDURE IF EXISTS sp_movimentar_estoque;

DELIMITER $$

-- Busca, filtro e paginacao em uma chamada so. O PHP nao monta mais SQL:
-- ele executa CALL sp_listar_pecas(?,?,?,?,?).
CREATE PROCEDURE sp_listar_pecas(
    IN p_busca        VARCHAR(120),
    IN p_categoria_id INT,
    IN p_situacao     VARCHAR(20),
    IN p_limite       INT,
    IN p_offset       INT
)
BEGIN
    SET p_busca        = COALESCE(TRIM(p_busca), '');
    SET p_categoria_id = COALESCE(p_categoria_id, 0);
    SET p_situacao     = COALESCE(TRIM(p_situacao), '');
    SET p_limite       = IF(COALESCE(p_limite, 0) <= 0, 50, p_limite);
    SET p_offset       = IF(COALESCE(p_offset, 0) <  0,  0, p_offset);

    SELECT
        id,
        codigo,
        nome,
        categoria_id,
        categoria,
        fornecedor_id,
        fornecedor,
        quantidade,
        quantidade_minima,
        valor_unitario,
        valor_em_estoque,
        situacao,
        atualizado_em
    FROM vw_pecas_dashboard
    WHERE (p_busca = ''
           OR codigo LIKE CONCAT('%', p_busca, '%')
           OR nome   LIKE CONCAT('%', p_busca, '%'))
      AND (p_categoria_id = 0 OR categoria_id = p_categoria_id)
      AND (p_situacao = ''    OR situacao     = p_situacao)
    ORDER BY nome
    LIMIT p_limite OFFSET p_offset;
END$$

-- Mesmo filtro da listagem, so que devolvendo o total. E o que permite a tela
-- saber quantas paginas existem sem trazer todas as linhas.
CREATE PROCEDURE sp_contar_pecas(
    IN p_busca        VARCHAR(120),
    IN p_categoria_id INT,
    IN p_situacao     VARCHAR(20)
)
BEGIN
    SET p_busca        = COALESCE(TRIM(p_busca), '');
    SET p_categoria_id = COALESCE(p_categoria_id, 0);
    SET p_situacao     = COALESCE(TRIM(p_situacao), '');

    SELECT COUNT(*) AS total
    FROM vw_pecas_dashboard
    WHERE (p_busca = ''
           OR codigo LIKE CONCAT('%', p_busca, '%')
           OR nome   LIKE CONCAT('%', p_busca, '%'))
      AND (p_categoria_id = 0 OR categoria_id = p_categoria_id)
      AND (p_situacao = ''    OR situacao     = p_situacao);
END$$

-- Indicadores do topo calculados dentro do banco, para conferir com o reduce
-- que o TypeScript faz no front.
CREATE PROCEDURE sp_resumo_dashboard()
BEGIN
    SELECT
        COUNT(*)                                            AS itens_distintos,
        COALESCE(SUM(quantidade), 0)                        AS pecas_em_estoque,
        COALESCE(ROUND(SUM(valor_em_estoque), 2), 0)        AS valor_imobilizado,
        COALESCE(SUM(IF(situacao <> 'OK', 1, 0)), 0)        AS itens_para_repor
    FROM vw_pecas_dashboard;
END$$

-- Entrada e baixa de estoque: grava o historico e ajusta a peca na mesma
-- chamada, para as duas coisas nunca sairem de sincronia.
CREATE PROCEDURE sp_movimentar_estoque(
    IN p_peca_id    INT,
    IN p_tipo       VARCHAR(10),
    IN p_quantidade INT,
    IN p_observacao VARCHAR(120)
)
BEGIN
    DECLARE v_quantidade INT;

    SET p_tipo       = UPPER(COALESCE(TRIM(p_tipo), 'ENTRADA'));
    SET p_quantidade = ABS(COALESCE(p_quantidade, 0));

    SELECT quantidade INTO v_quantidade
    FROM peca
    WHERE id = p_peca_id;

    IF p_tipo = 'SAIDA' THEN
        SET v_quantidade = v_quantidade - p_quantidade;
    ELSE
        SET v_quantidade = v_quantidade + p_quantidade;
    END IF;

    -- sem esse piso a baixa maior que o saldo deixaria a quantidade negativa,
    -- e a trigger de padronizacao gravaria o valor positivo, inflando o estoque
    IF v_quantidade < 0 THEN
        SET v_quantidade = 0;
    END IF;

    UPDATE peca
    SET quantidade = v_quantidade
    WHERE id = p_peca_id;

    INSERT INTO movimentacao_estoque (peca_id, tipo, quantidade, observacao)
    VALUES (p_peca_id, p_tipo, p_quantidade, p_observacao);
END$$

DELIMITER ;

-- CALL sp_listar_pecas('bronzina', 0, '', 10, 0);
-- CALL sp_contar_pecas('', 0, 'CRITICO');
-- CALL sp_resumo_dashboard();
-- CALL sp_movimentar_estoque(1, 'ENTRADA', 5, 'Compra do fornecedor');
