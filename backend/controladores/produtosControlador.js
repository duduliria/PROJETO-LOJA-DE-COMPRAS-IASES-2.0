// ====================================
// CONTROLADOR DE PRODUTOS
// ====================================
// Aqui ficam as funções que processam as requisições
// relacionadas aos produtos (CRUD)

const { conexao } = require('../banco/conexao');
const fs = require('fs');
const path = require('path');

// ====================================
// LISTAR TODOS OS PRODUTOS
// ====================================
// GET /api/produtos
async function listarTodos(requisicao, resposta) {
    try {
        // Busca todos os produtos do banco
        const [produtos] = await conexao.query('SELECT * FROM produtos ORDER BY id DESC');
        
        // Para cada produto, busca suas imagens
        for (let produto of produtos) {
            const [imagens] = await conexao.query(
                'SELECT * FROM imagens_produtos WHERE produto_id = ?',
                [produto.id]
            );
            produto.imagens = imagens;
        }
        
        // Retorna os produtos com suas imagens
        resposta.json(produtos);
        
    } catch (erro) {
        console.log('Erro ao listar produtos:', erro);
        resposta.status(500).json({ erro: 'Erro ao buscar produtos' });
    }
}

// ====================================
// BUSCAR UM PRODUTO PELO ID
// ====================================
// GET /api/produtos/:id
async function buscarPorId(requisicao, resposta) {
    try {
        const { id } = requisicao.params;
        
        // Busca o produto pelo ID
        const [produtos] = await conexao.query(
            'SELECT * FROM produtos WHERE id = ?',
            [id]
        );
        
        // Verifica se encontrou
        if (produtos.length === 0) {
            return resposta.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        const produto = produtos[0];
        
        // Busca as imagens do produto
        const [imagens] = await conexao.query(
            'SELECT * FROM imagens_produtos WHERE produto_id = ?',
            [id]
        );
        produto.imagens = imagens;
        
        resposta.json(produto);
        
    } catch (erro) {
        console.log('Erro ao buscar produto:', erro);
        resposta.status(500).json({ erro: 'Erro ao buscar produto' });
    }
}

// ====================================
// CRIAR NOVO PRODUTO
// ====================================
// POST /api/produtos
async function criar(requisicao, resposta) {
    try {
        const { nome, descricao, preco, estoque } = requisicao.body;
        const arquivos = requisicao.files; // Imagens enviadas
        
        // Verifica se os campos obrigatórios foram preenchidos
        if (!nome || !preco) {
            return resposta.status(400).json({ erro: 'Nome e preço são obrigatórios' });
        }
        
        // Insere o produto no banco
        const [resultado] = await conexao.query(
            'INSERT INTO produtos (nome, descricao, preco, estoque) VALUES (?, ?, ?, ?)',
            [nome, descricao || '', preco, estoque || 0]
        );
        
        const produtoId = resultado.insertId;
        
        // Se tiver imagens, salva no banco
        if (arquivos && arquivos.length > 0) {
            for (let arquivo of arquivos) {
                const caminho = `/images/${arquivo.filename}`;
                await conexao.query(
                    'INSERT INTO imagens_produtos (produto_id, caminho) VALUES (?, ?)',
                    [produtoId, caminho]
                );
            }
        }
        
        resposta.status(201).json({
            mensagem: 'Produto criado com sucesso!',
            id: produtoId
        });
        
    } catch (erro) {
        console.log('Erro ao criar produto:', erro);
        resposta.status(500).json({ erro: 'Erro ao criar produto' });
    }
}

// ====================================
// ATUALIZAR PRODUTO
// ====================================
// PUT /api/produtos/:id
async function atualizar(requisicao, resposta) {
    try {
        const { id } = requisicao.params;
        const { nome, descricao, preco, estoque, imagensRemover } = requisicao.body;
        const arquivos = requisicao.files; // Novas imagens enviadas
        
        // Verifica se o produto existe
        const [produtos] = await conexao.query('SELECT * FROM produtos WHERE id = ?', [id]);
        if (produtos.length === 0) {
            return resposta.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        // Atualiza os dados do produto
        await conexao.query(
            'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, estoque = ? WHERE id = ?',
            [nome, descricao, preco, estoque, id]
        );
        
        // Remove imagens selecionadas para exclusão
        if (imagensRemover) {
            const idsRemover = JSON.parse(imagensRemover);
            for (let imagemId of idsRemover) {
                // Busca o caminho da imagem
                const [imagens] = await conexao.query(
                    'SELECT caminho FROM imagens_produtos WHERE id = ?',
                    [imagemId]
                );
                
                if (imagens.length > 0) {
                    // Deleta o arquivo físico
                    const caminhoArquivo = path.join(__dirname, '../../frontend', imagens[0].caminho);
                    if (fs.existsSync(caminhoArquivo)) {
                        fs.unlinkSync(caminhoArquivo);
                    }
                    
                    // Remove do banco
                    await conexao.query('DELETE FROM imagens_produtos WHERE id = ?', [imagemId]);
                }
            }
        }
        
        // Adiciona novas imagens
        if (arquivos && arquivos.length > 0) {
            for (let arquivo of arquivos) {
                const caminho = `/images/${arquivo.filename}`;
                await conexao.query(
                    'INSERT INTO imagens_produtos (produto_id, caminho) VALUES (?, ?)',
                    [id, caminho]
                );
            }
        }
        
        resposta.json({ mensagem: 'Produto atualizado com sucesso!' });
        
    } catch (erro) {
        console.log('Erro ao atualizar produto:', erro);
        resposta.status(500).json({ erro: 'Erro ao atualizar produto' });
    }
}

// ====================================
// DELETAR PRODUTO
// ====================================
// DELETE /api/produtos/:id
async function deletar(requisicao, resposta) {
    try {
        const { id } = requisicao.params;
        
        // Busca as imagens do produto para deletar os arquivos
        const [imagens] = await conexao.query(
            'SELECT caminho FROM imagens_produtos WHERE produto_id = ?',
            [id]
        );
        
        // Deleta os arquivos físicos das imagens
        for (let imagem of imagens) {
            const caminhoArquivo = path.join(__dirname, '../../frontend', imagem.caminho);
            if (fs.existsSync(caminhoArquivo)) {
                fs.unlinkSync(caminhoArquivo);
            }
        }
        
        // Deleta o produto (as imagens são deletadas automaticamente pelo CASCADE)
        const [resultado] = await conexao.query('DELETE FROM produtos WHERE id = ?', [id]);
        
        if (resultado.affectedRows === 0) {
            return resposta.status(404).json({ erro: 'Produto não encontrado' });
        }
        
        resposta.json({ mensagem: 'Produto deletado com sucesso!' });
        
    } catch (erro) {
        console.log('Erro ao deletar produto:', erro);
        resposta.status(500).json({ erro: 'Erro ao deletar produto' });
    }
}

// Exporta todas as funções
module.exports = {
    listarTodos,
    buscarPorId,
    criar,
    atualizar,
    deletar
};
