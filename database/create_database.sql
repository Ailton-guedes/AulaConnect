
-- =====================================================
-- AULACONNECT
-- Script de criacao do banco de dados
-- =====================================================

CREATE DATABASE IF NOT EXISTS aulaconnect
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE aulaconnect;

-- =====================================================
-- 1. USUARIOS
-- =====================================================

-- Armazena os usuários e seus perfis de acesso
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL,

    -- Organização à qual o usuário pertence
    id_organizacao INT NULL,

    -- Data de cadastro do usuário
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Relacionamento entre usuário e organização
    CONSTRAINT fk_usuario_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao)
);

-- =====================================================
-- 2. RESPONSAVEIS
-- =====================================================

-- Armazena os responsáveis pelos alunos
CREATE TABLE responsaveis (
    id_responsavel INT AUTO_INCREMENT PRIMARY KEY,

    -- Organização à qual o responsável pertence
    id_organizacao INT NULL,

    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(25),
    email VARCHAR(100),
    cpf VARCHAR(11),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Relacionamento com a organização
    CONSTRAINT fk_responsavel_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao)
);

-- =====================================================
-- 3. ALUNOS
-- =====================================================

-- Armazena os alunos cadastrados
CREATE TABLE alunos (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,

    -- Organização à qual o aluno pertence
    id_organizacao INT NULL,

    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    sexo VARCHAR(20),
    observacoes TEXT,
    id_responsavel INT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Endereço do aluno
    endereco VARCHAR(200),
    bairro VARCHAR(100),
    cidade VARCHAR(100),

    -- Relacionamento com o responsável
    CONSTRAINT alunos_ibfk_1
        FOREIGN KEY (id_responsavel)
        REFERENCES responsaveis(id_responsavel),

    -- Relacionamento com a organização
    CONSTRAINT fk_aluno_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao)
);

-- =====================================================
-- 4. AULAS
-- =====================================================

-- Tabela responsável pelo cadastro das aulas
CREATE TABLE aulas (
    id_aula INT AUTO_INCREMENT PRIMARY KEY,

    -- Organização proprietária da aula
    id_organizacao INT NULL,

    descricao VARCHAR(100) NOT NULL,
    dia_semana VARCHAR(30) NOT NULL,
    horario TIME NOT NULL,
    duracao INT DEFAULT NULL,
    capacidade INT DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,

    -- Relacionamento com a organização
    CONSTRAINT fk_aula_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao)
);

-- 5. TABELA: PLANOS
-- Tabela responsável pelos planos de aulas
CREATE TABLE planos (
    id_plano INT AUTO_INCREMENT PRIMARY KEY,

    -- Organização proprietária do plano
    id_organizacao INT NULL,

    nome VARCHAR(50) NOT NULL,
    duracao_meses INT NOT NULL,
    aulas_por_semana INT DEFAULT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL,
    descricao TEXT DEFAULT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Relacionamento com a organização
    CONSTRAINT fk_plano_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao)
);

-- 6. CONTRATOS
-- Tabela responsável pelos contratos dos alunos
CREATE TABLE contratos (
    id_contrato INT AUTO_INCREMENT PRIMARY KEY,

    -- Organização proprietária do contrato
    id_organizacao INT NULL,

    -- Identificação do aluno e do plano contratado
    id_aluno INT NOT NULL,
    id_plano INT NOT NULL,

    -- Período de vigência do contrato
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,

    -- Informações financeiras
    valor_mensal DECIMAL(10,2) NOT NULL,

    -- Situação do contrato
    status VARCHAR(30) NOT NULL DEFAULT 'ativo',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Professor responsável pelo contrato
    id_professor INT DEFAULT NULL,

    -- Relacionamento com o aluno
    CONSTRAINT contratos_ibfk_1
        FOREIGN KEY (id_aluno)
        REFERENCES alunos(id_aluno),

    -- Relacionamento com o plano
    CONSTRAINT contratos_ibfk_2
        FOREIGN KEY (id_plano)
        REFERENCES planos(id_plano),

    -- Relacionamento com o professor
    CONSTRAINT fk_contratos_professor
        FOREIGN KEY (id_professor)
        REFERENCES usuarios(id_usuario),

    -- Relacionamento com a organização
    CONSTRAINT fk_contrato_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao)
);
-- =====================================================
-- 7. HORARIOS DO CONTRATO
-- =====================================================

-- Tabela responsável pelos horários dos contratos
CREATE TABLE horarios_contrato (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,

    -- Organização proprietária do horário
    id_organizacao INT NULL,

    -- Contrato e aula vinculados
    id_contrato INT NOT NULL,
    id_aula INT DEFAULT NULL,

    -- Configuração do horário
    dia_semana INT NOT NULL,
    horario_inicio TIME NOT NULL,
    duracao_minutos INT DEFAULT NULL,
    deslocamento_minutos INT NOT NULL DEFAULT 30,

    -- Impede horários duplicados no mesmo contrato
    UNIQUE KEY id_contrato (
        id_contrato,
        dia_semana,
        horario_inicio
    ),

    -- Relacionamento com o contrato
    CONSTRAINT horarios_contrato_ibfk_1
        FOREIGN KEY (id_contrato)
        REFERENCES contratos(id_contrato),

    -- Relacionamento opcional com a aula
    CONSTRAINT horarios_contrato_ibfk_2
        FOREIGN KEY (id_aula)
        REFERENCES aulas(id_aula),

    -- Relacionamento com a organização
    CONSTRAINT fk_horario_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao),

    -- Validação dos dias da semana
    CONSTRAINT CONSTRAINT_1
        CHECK (dia_semana BETWEEN 0 AND 6)
);
-- =====================================================
-- 8. AGENDAMENTOS E FREQUENCIA
-- =====================================================

-- Tabela responsável pelos agendamentos das aulas
CREATE TABLE agendamentos (
    id_agendamento INT AUTO_INCREMENT PRIMARY KEY,

    -- Organização proprietária do agendamento
    id_organizacao INT NULL,

    -- Aluno e aula vinculados
    id_aluno INT NOT NULL,
    id_aula INT DEFAULT NULL,

    -- Informações do agendamento
    data_aula DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    presenca VARCHAR(20) DEFAULT NULL,

    -- Contrato vinculado
    id_contrato INT DEFAULT NULL,

    -- Configuração do horário
    horario_inicio TIME DEFAULT NULL,
    tipo_agendamento VARCHAR(30) NOT NULL DEFAULT 'regular',
    id_horario INT DEFAULT NULL,

    -- Relacionamento com o aluno
    CONSTRAINT agendamentos_ibfk_1
        FOREIGN KEY (id_aluno)
        REFERENCES alunos(id_aluno),

    -- Relacionamento com a aula
    CONSTRAINT agendamentos_ibfk_2
        FOREIGN KEY (id_aula)
        REFERENCES aulas(id_aula),

    -- Relacionamento com o contrato
    CONSTRAINT fk_agendamento_contrato
        FOREIGN KEY (id_contrato)
        REFERENCES contratos(id_contrato),

    -- Relacionamento com o horário do contrato
    CONSTRAINT fk_agendamentos_horario
        FOREIGN KEY (id_horario)
        REFERENCES horarios_contrato(id_horario),

    -- Relacionamento com a organização
    CONSTRAINT fk_agendamento_organizacao
        FOREIGN KEY (id_organizacao)
        REFERENCES organizacoes(id_organizacao)
);
-- =====================================================
-- 9. PAGAMENTOS
-- =====================================================

CREATE TABLE pagamentos (
    id_pagamento INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    data_pagamento DATE,
    status VARCHAR(30) NOT NULL,
    forma_pagamento VARCHAR(30),

    FOREIGN KEY (id_aluno)
        REFERENCES alunos(id_aluno)
) ENGINE=InnoDB;

-- =====================================================
-- 10. EVOLUCOES
-- =====================================================

CREATE TABLE evolucoes (
    id_evolucao INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    data_avaliacao DATE NOT NULL,
    descricao TEXT NOT NULL,
    observacoes TEXT,

    FOREIGN KEY (id_aluno)
        REFERENCES alunos(id_aluno)
) ENGINE=InnoDB;

-- =====================================================
-- 11. NOTIFICACOES
-- =====================================================

CREATE TABLE notificacoes (
    id_notificacao INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    titulo VARCHAR(100) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(30),
    lida BOOLEAN DEFAULT FALSE,
    data_envio DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario)
        REFERENCES usuarios(id_usuario)
) ENGINE=InnoDB;

-- =====================================================
-- FIM DO SCRIPT - AULACONNECT
-- =====================================================



-- Armazena as organizações cadastradas no AulaConnect
CREATE TABLE organizacoes (

    -- Identificador único da organização
    id_organizacao INT AUTO_INCREMENT PRIMARY KEY,

    -- Nome do negócio do professor
    nome VARCHAR(150) NOT NULL,

    -- Situação da organização
    status VARCHAR(20) NOT NULL DEFAULT 'ATIVA',

    -- Data de criação da organização
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);