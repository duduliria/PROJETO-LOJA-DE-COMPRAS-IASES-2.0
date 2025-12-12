// ====================================
// CONTROLADOR DO CARRINHO
// ====================================
// Aqui ficam as funções que processam as requisições
// relacionadas ao carrinho de compras

const { conexao } = require('../banco/conexao');

// ====================================
// LISTAR ITENS DO CARRINHO
// ====================================
// GET /api/carrinho
async function listarItens(requisicao, resposta) {
    try {
        // Busca todos os itens do carrinho com informações do produto
        const [itens] = await conexao.query(`
            SELECT 
                carrinho.id,
                carrinho.quantidade,
                produtos.id as produto_id,
                produtos.nome,
                produtos.preco,
                produtos.descricao
            FROM carrinho
            INNER JOIN produtos ON carrinho.produto_id = produtos.id
            ORDER BY carrinho.id DESC
        `);
        
        // Para cada item, busca a imagem principal do produto
        for (let item of itens) {
            const [imagens] = await conexao.query(
                'SELECT caminho FROM imagens_produtos WHERE produto_id = ? LIMIT 1',
                [item.produto_id]
            );
            item.imagem = imagens.length > 0 ? imagens[0].caminho : null;
        }
        
        resposta.json(itens);
        
    } catch (erro) {
        console.log('Erro ao listar carrinho:', erro);
        resposta.status(500).json({ erro: 'Erro ao buscar carrinho' });
    }
}

// ====================================
// ADICIONAR ITEM AO CARRINHO
// ====================================
// POST /api/carrinho
async function adicionar(requisicao, resposta) {
    try {
        const { produto_id, quantidade } = requisicao.body;
        
        // Verifica se o produto existe
        const [produtos] = await conexao.query(
            'SELECT * FROM produtos WHERE id = ?',
            [produto_id]
        );
        
        if (produtos.length === 0) {
            return resposta.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        // Verifica se o produto já está no carrinho
        const [itemExistente] = await conexao.query(
            'SELECT * FROM carrinho WHERE produto_id = ?',
            [produto_id]
        );
        
        if (itemExistente.length > 0) {
            // Se já existe, aumenta a quantidade
            const novaQuantidade = itemExistente[0].quantidade + (quantidade || 1);
            await conexao.query(
                'UPDATE carrinho SET quantidade = ? WHERE produto_id = ?',
                [novaQuantidade, produto_id]
            );
            
            resposta.json({ mensagem: 'Quantidade atualizada no carrinho!' });
        } else {
            // Se não existe, adiciona novo item
            await conexao.query(
                'INSERT INTO carrinho (produto_id, quantidade) VALUES (?, ?)',
                [produto_id, quantidade || 1]
            );
            
            resposta.status(201).json({ mensagem: 'Produto adicionado ao carrinho!' });
        }
        
    } catch (erro) {
        console.log('Erro ao adicionar ao carrinho:', erro);
        resposta.status(500).json({ erro: 'Erro ao adicionar ao carrinho' });
    }
}

// ====================================
// ATUALIZAR QUANTIDADE NO CARRINHO
// ====================================
// PUT /api/carrinho/:id
async function atualizarQuantidade(requisicao, resposta) {
    try {
        const { id } = requisicao.params;
        const { quantidade } = requisicao.body;
        
        // Verifica se a quantidade é válida
        if (!quantidade || quantidade < 1) {
            return resposta.status(400).json({ erro: 'Quantidade deve ser maior que zero' });
        }
        
        // Atualiza a quantidade
        const [resultado] = await conexao.query(
            'UPDATE carrinho SET quantidade = ? WHERE id = ?',
            [quantidade, id]
        );
        
        if (resultado.affectedRows === 0) {
            return resposta.status(404).json({ erro: 'Item não encontrado no carrinho' });
        }
        
        resposta.json({ mensagem: 'Quantidade atualizada!' });
        
    } catch (erro) {
        console.log('Erro ao atualizar carrinho:', erro);
        resposta.status(500).json({ erro: 'Erro ao atualizar carrinho' });
    }
}

// ====================================
// REMOVER ITEM DO CARRINHO
// ====================================
// DELETE /api/carrinho/:id
async function remover(requisicao, resposta) {
    try {
        const { id } = requisicao.params;
        
        const [resultado] = await conexao.query(
            'DELETE FROM carrinho WHERE id = ?',
            [id]
        );
        
        if (resultado.affectedRows === 0) {
            return resposta.status(404).json({ erro: 'Item não encontrado no carrinho' });
        }
        
        resposta.json({ mensagem: 'Item removido do carrinho!' });
        
    } catch (erro) {
        console.log('Erro ao remover do carrinho:', erro);
        resposta.status(500).json({ erro: 'Erro ao remover do carrinho' });
    }
}

// ====================================
// LIMPAR TODO O CARRINHO
// ====================================
// DELETE /api/carrinho
async function limparCarrinho(requisicao, resposta) {
    try {
        await conexao.query('DELETE FROM carrinho');
        resposta.json({ mensagem: 'Carrinho limpo com sucesso!' });
        
    } catch (erro) {
        console.log('Erro ao limpar carrinho:', erro);
        resposta.status(500).json({ erro: 'Erro ao limpar carrinho' });
    }
}

// ====================================
// CONTAR ITENS NO CARRINHO
// ====================================
// GET /api/carrinho/contador
async function contarItens(requisicao, resposta) {
    try {
        const [resultado] = await conexao.query(
            'SELECT SUM(quantidade) as total FROM carrinho'
        );
        
        const total = resultado[0].total || 0;
        resposta.json({ total });
        
    } catch (erro) {
        console.log('Erro ao contar itens:', erro);
        resposta.status(500).json({ erro: 'Erro ao contar itens' });
    }
}

// Exporta todas as funções
module.exports = {
    listarItens,
    adicionar,
    atualizarQuantidade,
    remover,
    limparCarrinho,
    contarItens
};
