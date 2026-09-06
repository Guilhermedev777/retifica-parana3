
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
