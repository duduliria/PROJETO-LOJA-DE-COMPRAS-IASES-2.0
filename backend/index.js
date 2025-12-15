// ====================================
// ARQUIVO PRINCIPAL DO SERVIDOR
// ====================================
// Este é o ponto de entrada da aplicação
// Aqui configuramos o Express e iniciamos o servidor

const express = require("express");
const cors = require("cors");
const path = require("path");

// Importa a conexão com o banco de dados
const { testarConexao } = require("./banco/conexao");

// Importa as rotas
const produtosRotas = require("./rotas/produtosRotas");
const carrinhoRotas = require("./rotas/carrinhoRotas");

// Cria a aplicação Express
const app = express();

// Porta onde o servidor vai rodar
const PORTA = 3000;

// ====================================
// MIDDLEWARES (CONFIGURAÇÕES)
// ====================================

// Permite requisições de outros domínios (CORS)
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "../frontend/images")));
app.use("/api/produtos", produtosRotas);

// Rotas do carrinho: /api/carrinho
app.use("/api/carrinho", carrinhoRotas);

// Rota de teste para verificar se a API está funcionando
app.get("/api", (requisicao, resposta) => {
  resposta.json({
    mensagem: "🛒 API da Loja de Compras está funcionando!",
    versao: "1.0.0",
    rotas: {
      produtos: "/api/produtos",
      carrinho: "/api/carrinho",
    },
  });
});

// ====================================
// INICIA O SERVIDOR
// ====================================

app.listen(PORTA, async () => {
  console.log(`Servidor rodando em http://localhost:${PORTA}`);
  await testarConexao();
});
