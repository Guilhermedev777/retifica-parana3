
USE retifica_parana;

DROP TRIGGER IF EXISTS trg_peca_before_update;
DROP TRIGGER IF EXISTS trg_peca_before_insert;

DELIMITER $$

CREATE TRIGGER trg_peca_before_update
BEFORE UPDATE ON peca
FOR EACH ROW
BEGIN
    SET NEW.quantidade        = ABS(COALESCE(NEW.quantidade, 0));
    SET NEW.quantidade_minima = ABS(COALESCE(NEW.quantidade_minima, 0));
    SET NEW.valor_unitario    = ABS(COALESCE(NEW.valor_unitario, 0));
    SET NEW.codigo            = UPPER(TRIM(NEW.codigo));
    SET NEW.nome              = TRIM(NEW.nome);
    SET NEW.atualizado_em     = NOW();
END$$

CREATE TRIGGER trg_peca_before_insert
BEFORE INSERT ON peca
FOR EACH ROW
BEGIN
    SET NEW.quantidade        = ABS(COALESCE(NEW.quantidade, 0));
    SET NEW.quantidade_minima = ABS(COALESCE(NEW.quantidade_minima, 0));
    SET NEW.valor_unitario    = ABS(COALESCE(NEW.valor_unitario, 0));
    SET NEW.codigo            = UPPER(TRIM(NEW.codigo));
    SET NEW.nome              = TRIM(NEW.nome);
END$$

DELIMITER ;
