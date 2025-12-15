const express = require('express');
const roteador = express.Router();
const carrinhoControlador = require('../controladores/carrinhoControlador');
roteador.get('/contador', carrinhoControlador.contarItens);
roteador.get('/', carrinhoControlador.listarItens);
roteador.post('/', carrinhoControlador.adicionar);
roteador.put('/:id', carrinhoControlador.atualizarQuantidade);
roteador.delete('/:id', carrinhoControlador.remover);
roteador.delete('/', carrinhoControlador.limparCarrinho);

module.exports = roteador;
