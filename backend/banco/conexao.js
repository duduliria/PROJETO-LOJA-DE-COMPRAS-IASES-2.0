// ====================================
// CONEXÃO COM O BANCO DE DADOS MySQL
// ====================================

const mysql = require('mysql2/promise');

// Configurações do banco de dados
// Altere conforme sua configuração local
const configuracaoBanco = {
    host: 'localhost',           // Endereço do servidor (localhost = seu computador)
    user: 'root',                // Seu usuário do MySQL (geralmente é 'root')
    password: 'root',                // Sua senha do MySQL (deixe vazio se não tiver)
    database: 'loja_compras',    // Nome do banco de dados
    port: 3306                   // Porta padrão do MySQL
};

// Cria a conexão com o banco de dados
const conexao = mysql.createPool(configuracaoBanco);

// Testa se a conexão está funcionando
async function testarConexao() {
    try {
        const conectado = await conexao.getConnection();
        console.log('✅ Conectado ao banco de dados MySQL!');
        conectado.release(); // Libera a conexão
    } catch (erro) {
        console.log('1. Verifique se o MySQL está rodando');
    }
}

// Exporta a conexão e a função de teste
module.exports = { conexao, testarConexao };
