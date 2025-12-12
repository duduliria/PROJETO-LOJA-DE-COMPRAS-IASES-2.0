// ====================================
// ROTAS DE PRODUTOS
// ====================================
// Define os caminhos (URLs) para acessar os produtos

const express = require('express');
const roteador = express.Router();

// Importa o controlador (funções que processam as requisições)
const produtosControlador = require('../controladores/produtosControlador');

// Importa o multer configurado (para upload de imagens)
const upload = require('../configuracoes/multer');

// ====================================
// DEFINIÇÃO DAS ROTAS
// ====================================

// GET /api/produtos - Lista todos os produtos
roteador.get('/', produtosControlador.listarTodos);

// GET /api/produtos/:id - Busca um produto pelo ID
roteador.get('/:id', produtosControlador.buscarPorId);

// POST /api/produtos - Cria um novo produto
// upload.array('imagens', 10) permite enviar até 10 imagens
roteador.post('/', upload.array('imagens', 10), produtosControlador.criar);

// PUT /api/produtos/:id - Atualiza um produto
roteador.put('/:id', upload.array('imagens', 10), produtosControlador.atualizar);

// DELETE /api/produtos/:id - Deleta um produto
roteador.delete('/:id', produtosControlador.deletar);

// Exporta o roteador
module.exports = roteador;
