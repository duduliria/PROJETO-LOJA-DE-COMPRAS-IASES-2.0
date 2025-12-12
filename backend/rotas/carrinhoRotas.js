// ====================================
// ROTAS DO CARRINHO
// ====================================
// Define os caminhos (URLs) para acessar o carrinho

const express = require('express');
const roteador = express.Router();

// Importa o controlador (funções que processam as requisições)
const carrinhoControlador = require('../controladores/carrinhoControlador');

// ====================================
// DEFINIÇÃO DAS ROTAS
// ====================================

// GET /api/carrinho/contador - Conta quantos itens tem no carrinho
// IMPORTANTE: Esta rota deve vir ANTES da rota /:id
roteador.get('/contador', carrinhoControlador.contarItens);

// GET /api/carrinho - Lista todos os itens do carrinho
roteador.get('/', carrinhoControlador.listarItens);

// POST /api/carrinho - Adiciona um item ao carrinho
roteador.post('/', carrinhoControlador.adicionar);

// PUT /api/carrinho/:id - Atualiza a quantidade de um item
roteador.put('/:id', carrinhoControlador.atualizarQuantidade);

// DELETE /api/carrinho/:id - Remove um item do carrinho
roteador.delete('/:id', carrinhoControlador.remover);

// DELETE /api/carrinho - Limpa todo o carrinho
roteador.delete('/', carrinhoControlador.limparCarrinho);

// Exporta o roteador
module.exports = roteador;
