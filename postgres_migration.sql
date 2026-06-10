-- KARTER'OS - PLANO DE MIGRAÇÃO POSTGRESQL --
-- Este arquivo define a arquitetura de segurança, controle de acesso baseado em papéis (RBAC) e integridade referencial.

-- 1. Criação do tipo ENUM para as roles de usuários
CREATE TYPE user_role AS ENUM ('admin', 'mecanico', 'atendente');

-- 2. Atualização / Criação da tabela de 'usuarios'
-- O campo 'login' torna-se UNIQUE e imutável (gerenciado via trigger ou regras de aplicação).
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'atendente',
    funcionario_id INT, -- Vínculo opcional com a tabela de mecânicos/funcionários
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Criação de regra/trigger para tornar o campo 'login' IMUTÁVEL e read-only após a criação
CREATE OR REPLACE FUNCTION prevent_login_update()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.login <> OLD.login THEN
        RAISE EXCEPTION 'O campo "login" é imutável e não pode ser alterado após a criação.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_login_update ON usuarios;
CREATE TRIGGER trg_prevent_login_update
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION prevent_login_update();

-- 4. Tabela 'permissoes_usuario'
-- Mapeia quais módulos do sistema cada usuário específico pode visualizar ou editar
CREATE TABLE IF NOT EXISTS permissoes_usuario (
    id SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    modulo VARCHAR(50) NOT NULL, -- 'Clientes', 'Veículos', 'Peças', 'OS', 'Financeiro', 'Fiscal', 'Funcionários'
    visualizar BOOLEAN NOT NULL DEFAULT FALSE,
    editar BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT unique_usuario_modulo UNIQUE (usuario_id, modulo)
);

-- 5. Vínculo de Execução e integridade referencial na tabela 'ordens_servico'
-- Garante que o mecanico_id determine a propriedade técnica para histórico e comissão.
-- Assume-se que a tabela 'funcionarios' ou 'mecanicos' tenha id correspondente ao funcionario_id.
ALTER TABLE ordens_servico 
    ADD CONSTRAINT fk_ordens_servico_mecanico 
    FOREIGN KEY (mecanico_id) 
    REFERENCES funcionarios(id) 
    ON DELETE SET NULL;
