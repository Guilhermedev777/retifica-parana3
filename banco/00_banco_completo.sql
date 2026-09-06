-- Banco completo da dashboard da Retifica Parana.
-- Reune os arquivos 01 a 07 na ordem de execucao. Pode ser reimportado
-- quantas vezes for preciso sem dar erro de "ja existe".


-- =====================================================================
-- 01_schema.sql
-- =====================================================================


CREATE DATABASE IF NOT EXISTS retifica_parana
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE retifica_parana;


CREATE TABLE IF NOT EXISTS categoria (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(60) NOT NULL,
    CONSTRAINT uq_categoria_nome UNIQUE (nome)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS fornecedor (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nome        VARCHAR(120) NOT NULL,
    cnpj        VARCHAR(18)  NOT NULL,
    telefone    VARCHAR(20)      NULL,
    cidade      VARCHAR(60)      NULL,
    ativo       TINYINT(1)   NOT NULL DEFAULT 1,
    criado_em   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_fornecedor_cnpj UNIQUE (cnpj)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS peca (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    codigo             VARCHAR(20)    NOT NULL,
    nome               VARCHAR(120)   NOT NULL,
    categoria_id       INT            NOT NULL,
    fornecedor_id      INT                NULL,
    quantidade         INT            NOT NULL DEFAULT 0,
    quantidade_minima  INT            NOT NULL DEFAULT 1,
    valor_unitario     DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ativo              TINYINT(1)     NOT NULL DEFAULT 1,
    criado_em          DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em      DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_peca_codigo    UNIQUE (codigo),
    CONSTRAINT fk_peca_categoria  FOREIGN KEY (categoria_id)
        REFERENCES categoria (id),
    CONSTRAINT fk_peca_fornecedor FOREIGN KEY (fornecedor_id)
        REFERENCES fornecedor (id)
) ENGINE = InnoDB;

CREATE TABLE IF NOT EXISTS movimentacao_estoque (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    peca_id      INT          NOT NULL,
    tipo         VARCHAR(10)  NOT NULL,
    quantidade   INT          NOT NULL,
    observacao   VARCHAR(120)     NULL,
    criado_em    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_movimentacao_peca FOREIGN KEY (peca_id)
        REFERENCES peca (id)
) ENGINE = InnoDB;

-- Se o banco ja existia de uma versao anterior, a tabela peca foi criada sem a
-- coluna de fornecedor, e o CREATE TABLE IF NOT EXISTS acima nao mexe em tabela
-- que ja existe. A coluna e a chave estrangeira entram aqui, para o script
-- servir tanto para banco novo quanto para banco antigo.
ALTER TABLE peca ADD COLUMN IF NOT EXISTS fornecedor_id INT NULL AFTER categoria_id;

ALTER TABLE peca ADD CONSTRAINT fk_peca_fornecedor
    FOREIGN KEY IF NOT EXISTS (fornecedor_id) REFERENCES fornecedor (id);

CREATE INDEX IF NOT EXISTS idx_peca_categoria    ON peca (categoria_id);
CREATE INDEX IF NOT EXISTS idx_peca_fornecedor   ON peca (fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_peca_ativo        ON peca (ativo);
CREATE INDEX IF NOT EXISTS idx_movimentacao_peca ON movimentacao_estoque (peca_id);


-- =====================================================================
-- 02_dados_exemplo.sql
-- =====================================================================

USE retifica_parana;

INSERT INTO categoria (nome) VALUES
    ('Bloco'),
    ('Cabecote'),
    ('Virabrequim'),
    ('Juntas'),
    ('Bronzinas')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO fornecedor (nome, cnpj, telefone, cidade) VALUES
    ('Metalurgica Sao Jose',    '11.222.333/0001-44', '(44) 3523-1100', 'Campo Mourao'),
    ('Distribuidora Motorpar',  '22.333.444/0001-55', '(44) 3524-2200', 'Maringa'),
    ('Juntas Parana Comercio',  '33.444.555/0001-66', '(43) 3325-3300', 'Londrina')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

INSERT INTO peca (codigo, nome, categoria_id, fornecedor_id, quantidade, quantidade_minima, valor_unitario) VALUES
    ('pn-1001', '  Camisa de cilindro AP 1.8  ', 1, 1, 12,  4,  189.90),
    ('PN-1002', 'Pistao 0,50 Fire 1.0',          1, 1,  8,  6,   96.50),
    ('pn-2001', 'Valvula de admissao MWM',       2, 2, 40, 12,   38.75),
    ('PN-2002', 'Guia de valvula bronze',        2, 2,  3,  6,   22.40),
    ('PN-3001', 'Virabrequim retificado 2.8',    3, 1,  2,  2, 1450.00),
    ('pn-4001', '  Junta de cabecote AP  ',      4, 3, 25, 10,   74.00),
    ('PN-4002', 'Jogo de juntas motor 1.6',      4, 3,  0,  5,  168.30),
    ('PN-5001', 'Bronzina de biela STD',         5, 2, 18,  8,   52.90),
    ('PN-5002', 'Bronzina de mancal 0,25',       5, 2,  5,  8,   61.20),
    ('PN-1003', 'Camisa de cilindro MWM 4.10',   1, 1,  6,  3,  246.00),
    ('PN-1004', 'Pistao STD Corsa 1.0',          1, 1, 30, 10,   88.40),
    ('PN-1005', 'Anel de segmento 1.6 STD',      1, 2, 14,  6,  132.70),
    ('PN-2003', 'Valvula de escape Sprinter',    2, 2,  9,  9,   47.30),
    ('PN-2004', 'Retentor de valvula kit 16v',   2, 3, 22,  8,   65.00),
    ('PN-2005', 'Sede de valvula bronze',        2, 1,  0,  4,   31.90),
    ('PN-3002', 'Virabrequim retificado 1.6',    3, 1,  4,  2, 1180.00),
    ('PN-3003', 'Bucha de biela cobre',          3, 1, 26, 10,   28.60),
    ('PN-3004', 'Volante do motor recuperado',   3, 2,  3,  3,  540.00),
    ('PN-4003', 'Junta do carter AP',            4, 3, 33, 12,   42.10),
    ('PN-4004', 'Junta de escape 1.4 flex',      4, 3, 11,  6,   36.80),
    ('PN-4005', 'Kit juntas retifica completa',  4, 3,  2,  4,  398.00),
    ('PN-5003', 'Bronzina de mancal 0,50',       5, 2, 16,  8,   64.90),
    ('PN-5004', 'Casquilho de eixo comando',     5, 1,  7,  5,   97.30)
ON DUPLICATE KEY UPDATE
    nome          = VALUES(nome),
    categoria_id  = VALUES(categoria_id),
    fornecedor_id = VALUES(fornecedor_id);

INSERT INTO movimentacao_estoque (peca_id, tipo, quantidade, observacao)
SELECT p.id, 'ENTRADA', 10, 'Carga inicial do balcao'
FROM peca p
WHERE p.codigo IN ('PN-1001', 'PN-2001', 'PN-4001')
  AND NOT EXISTS (SELECT 1 FROM movimentacao_estoque m WHERE m.peca_id = p.id);

INSERT INTO movimentacao_estoque (peca_id, tipo, quantidade, observacao)
SELECT p.id, 'SAIDA', 2, 'Retirada para orcamento 4412'
FROM peca p
WHERE p.codigo = 'PN-2001'
  AND NOT EXISTS (SELECT 1 FROM movimentacao_estoque m
                  WHERE m.peca_id = p.id AND m.tipo = 'SAIDA');


-- =====================================================================
-- 03_views_ctes.sql
-- =====================================================================


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


-- =====================================================================
-- 04_triggers.sql
-- =====================================================================

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


-- =====================================================================
-- 05_funcoes.sql
-- =====================================================================

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


-- =====================================================================
-- 06_view_ficha_peca.sql
-- =====================================================================

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


-- =====================================================================
-- 07_procedures.sql
-- =====================================================================

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
