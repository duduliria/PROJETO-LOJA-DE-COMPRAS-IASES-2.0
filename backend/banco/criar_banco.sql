-- ====================================
-- SCRIPT PARA CRIAR O BANCO DE DADOS
-- ====================================
-- Execute este script no MySQL Workbench ou phpMyAdmin
-- para criar o banco de dados e as tabelas

-- Cria o banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS loja_compras;

-- Seleciona o banco de dados para usar
USE loja_compras;



CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- Código único do produto (gerado automaticamente)
    nome VARCHAR(100) NOT NULL,            -- Nome do produto (obrigatório)
    descricao TEXT,                        -- Descrição do produto
    preco DECIMAL(10, 2) NOT NULL,         -- Preço do produto (ex: 99.90)
    estoque INT DEFAULT 0,                 -- Quantidade em estoque
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Data de cadastro (automático)
);

CREATE TABLE IF NOT EXISTS imagens_produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- Código único da imagem
    produto_id INT NOT NULL,               -- Código do produto (relacionamento)
    caminho VARCHAR(255) NOT NULL,         -- Caminho do arquivo da imagem
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Cria a ligação entre imagem e produto
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- ====================================
-- TABELA DE ITENS DO CARRINHO
-- ====================================
-- Guarda os produtos adicionados ao carrinho

CREATE TABLE IF NOT EXISTS carrinho (
    id INT AUTO_INCREMENT PRIMARY KEY,     -- Código único do item no carrinho
    produto_id INT NOT NULL,               -- Código do produto
    quantidade INT DEFAULT 1,              -- Quantidade do produto
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Cria a ligação entre carrinho e produto
    FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE CASCADE
);

-- ====================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- ====================================
-- Descomente as linhas abaixo para inserir produtos de teste

-- INSERT INTO produtos (nome, descricao, preco, estoque) VALUES
-- ('Camiseta Básica', 'Camiseta 100% algodão, cor branca', 49.90, 50),
-- ('Calça Jeans', 'Calça jeans azul escuro, corte reto', 129.90, 30),
-- ('Tênis Esportivo', 'Tênis confortável para corrida', 199.90, 20);

-- ====================================
-- COMANDOS ÚTEIS
-- ====================================
-- Ver todos os produtos: SELECT * FROM produtos;
-- Ver todas as imagens: SELECT * FROM imagens_produtos;
-- Ver o carrinho: SELECT * FROM carrinho;
-- Apagar tudo do carrinho: DELETE FROM carrinho;
