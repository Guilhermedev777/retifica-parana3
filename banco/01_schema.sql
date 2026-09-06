

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
