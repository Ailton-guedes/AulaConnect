
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

CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(50) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 2. RESPONSAVEIS
-- =====================================================

CREATE TABLE responsaveis (
    id_responsavel INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(25),
    email VARCHAR(100),
    cpf VARCHAR(11),
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- 3. ALUNOS
-- =====================================================

CREATE TABLE alunos (
    id_aluno INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    sexo VARCHAR(20),
    observacoes TEXT,
    id_responsavel INT,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    endereco VARCHAR(200),
    bairro VARCHAR(100),
    cidade VARCHAR(100),

    FOREIGN KEY (id_responsavel)
        REFERENCES responsaveis(id_responsavel)
) ENGINE=InnoDB;

-- =====================================================
-- 4. AULAS
-- =====================================================

CREATE TABLE aulas (
    id_aula INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    dia_semana VARCHAR(30) NOT NULL,
    horario TIME NOT NULL,
    duracao INT,
    capacidade INT,
    observacoes TEXT
) ENGINE=InnoDB;

-- =====================================================
-- 5. PLANOS
-- =====================================================

CREATE TABLE planos (
    id_plano INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    duracao_meses INT NOT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- =====================================================
-- 6. CONTRATOS
-- =====================================================

CREATE TABLE contratos (
    id_contrato INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_plano INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    valor_mensal DECIMAL(10,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ativo',
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_aluno)
        REFERENCES alunos(id_aluno),

    FOREIGN KEY (id_plano)
        REFERENCES planos(id_plano)
) ENGINE=InnoDB;

-- =====================================================
-- 7. HORARIOS DO CONTRATO
-- =====================================================

CREATE TABLE horarios_contrato (
    id_horario INT AUTO_INCREMENT PRIMARY KEY,
    id_contrato INT NOT NULL,
    id_aula INT,
    dia_semana INT NOT NULL,
    horario_inicio TIME NOT NULL,

    UNIQUE KEY uq_horario_contrato (
        id_contrato,
        dia_semana,
        horario_inicio
    ),

    FOREIGN KEY (id_contrato)
        REFERENCES contratos(id_contrato),

    FOREIGN KEY (id_aula)
        REFERENCES aulas(id_aula),

    CONSTRAINT chk_dia_semana
        CHECK (dia_semana BETWEEN 0 AND 6)
) ENGINE=InnoDB;

-- =====================================================
-- 8. AGENDAMENTOS E FREQUENCIA
-- =====================================================

CREATE TABLE agendamentos (
    id_agendamento INT AUTO_INCREMENT PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_aula INT,
    data_aula DATE NOT NULL,
    status VARCHAR(30) NOT NULL,
    presenca VARCHAR(20),
    id_contrato INT,
    horario_inicio TIME,
    tipo_agendamento VARCHAR(30)
        NOT NULL DEFAULT 'regular',

    FOREIGN KEY (id_aluno)
        REFERENCES alunos(id_aluno),

    FOREIGN KEY (id_aula)
        REFERENCES aulas(id_aula),

    FOREIGN KEY (id_contrato)
        REFERENCES contratos(id_contrato)
) ENGINE=InnoDB;

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
