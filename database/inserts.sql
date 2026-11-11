
-- =====================================================
-- AULACONNECT
-- Dados ficticios para testes
-- Executar somente em um banco novo e vazio
-- =====================================================

USE aulaconnect;

-- =====================================================
-- 1. RESPONSAVEIS
-- =====================================================

INSERT INTO responsaveis
(nome, telefone, email, cpf)
VALUES
('Mariana Oliveira', '11900000001',
 'mariana@example.com', NULL),

('Carlos Ferreira', '11900000002',
 'carlos@example.com', NULL),

('Juliana Santos', '11900000003',
 'juliana@example.com', NULL);


-- =====================================================
-- 2. ALUNOS
-- =====================================================

INSERT INTO alunos
(nome, data_nascimento, sexo, endereco,
 bairro, cidade, observacoes, id_responsavel)
VALUES
('Pedro Oliveira', '2018-05-12', 'Masculino',
 'Rua Exemplo, 100', 'Centro', 'Sao Paulo',
 'Aluno iniciante', 1),

('Ana Ferreira', '2017-08-20', 'Feminino',
 'Rua Exemplo, 200', 'Centro', 'Sao Paulo',
 'Nivel intermediario', 2),

('Lucas Santos', '2019-03-15', 'Masculino',
 'Rua Exemplo, 300', 'Centro', 'Sao Paulo',
 'Adaptacao ao meio aquatico', 3);


-- =====================================================
-- 3. AULAS
-- =====================================================

INSERT INTO aulas
(descricao, dia_semana, horario,
 duracao, capacidade, observacoes)
VALUES
('Natacao Infantil - Iniciante',
 'Segunda-feira', '09:00:00', 45, 5,
 'Turma iniciante'),

('Natacao Infantil - Intermediario',
 'Quarta-feira', '10:00:00', 45, 5,
 'Turma intermediaria'),

('Natacao Infantil - Adaptacao',
 'Sexta-feira', '14:00:00', 40, 4,
 'Adaptacao ao meio aquatico');


-- =====================================================
-- 4. PLANOS
-- =====================================================

INSERT INTO planos
(nome, duracao_meses, valor_mensal, ativo)
VALUES
('Mensal', 1, 180.00, TRUE),
('Trimestral', 3, 170.00, TRUE),
('Semestral', 6, 160.00, TRUE);


-- =====================================================
-- 5. CONTRATOS
-- =====================================================

INSERT INTO contratos
(id_aluno, id_plano, data_inicio,
 data_fim, valor_mensal, status)
VALUES
(1, 1, '2026-11-01', '2026-11-30',
 180.00, 'ativo'),

(2, 2, '2026-11-01', '2027-01-31',
 170.00, 'ativo'),

(3, 3, '2026-11-01', '2027-04-30',
 160.00, 'ativo');


-- =====================================================
-- 6. HORARIOS DOS CONTRATOS
-- dia_semana: 0 = segunda, 6 = domingo
-- =====================================================

INSERT INTO horarios_contrato
(id_contrato, id_aula, dia_semana, horario_inicio)
VALUES
(1, 1, 0, '09:00:00'),
(2, 2, 2, '10:00:00'),
(3, 3, 4, '14:00:00');


-- =====================================================
-- 7. AGENDAMENTOS E FREQUENCIA
-- =====================================================

INSERT INTO agendamentos
(id_aluno, id_aula, data_aula, status,
 presenca, id_contrato, horario_inicio,
 tipo_agendamento)
VALUES
(1, 1, '2026-11-09', 'realizado',
 'presente', 1, '09:00:00', 'regular'),

(2, 2, '2026-11-11', 'agendado',
 NULL, 2, '10:00:00', 'regular'),

(3, 3, '2026-11-13', 'agendado',
 NULL, 3, '14:00:00', 'regular'),

(1, 1, '2026-11-16', 'agendado',
 NULL, 1, '09:00:00', 'regular');


-- =====================================================
-- 8. PAGAMENTOS
-- =====================================================

INSERT INTO pagamentos
(id_aluno, valor, data_vencimento,
 data_pagamento, status, forma_pagamento)
VALUES
(1, 180.00, '2026-11-10',
 '2026-11-09', 'pago', 'pix'),

(2, 170.00, '2026-11-15',
 NULL, 'pendente', NULL),

(3, 160.00, '2026-11-20',
 NULL, 'pendente', NULL);


-- =====================================================
-- 9. EVOLUCOES
-- =====================================================

INSERT INTO evolucoes
(id_aluno, data_avaliacao, descricao, observacoes)
VALUES
(1, '2026-11-09',
 'Melhora na respiracao e flutuacao.',
 'Continuar exercicios de respiracao.'),

(2, '2026-11-09',
 'Boa coordenacao de bracos e pernas.',
 'Trabalhar resistencia.'),

(3, '2026-11-09',
 'Inicio da adaptacao ao meio aquatico.',
 'Manter atividades ludicas.');


-- =====================================================
-- FIM DOS DADOS DE TESTE
-- =====================================================
