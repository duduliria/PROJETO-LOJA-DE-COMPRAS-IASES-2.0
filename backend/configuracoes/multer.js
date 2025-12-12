// ====================================
// CONFIGURAÇÃO DO MULTER (UPLOAD DE FOTOS)
// ====================================

const multer = require('multer');
const path = require('path');

// Pasta onde as imagens serão salvas
const pastaImagens = path.join(__dirname, '../../frontend/images/produtos');

// Configuração do armazenamento
const armazenamento = multer.diskStorage({
    
    // Define a pasta de destino das imagens
    destination: function(requisicao, arquivo, callback) {
        callback(null, pastaImagens);
    },
    
    // Define o nome do arquivo
    // Formato: timestamp_nomeoriginal.extensao
    // Exemplo: 1702405200000_foto.jpg
    filename: function(requisicao, arquivo, callback) {
        const timestamp = Date.now(); // Pega o horário atual em milissegundos
        const nomeOriginal = arquivo.originalname;
        const nomeArquivo = `${timestamp}_${nomeOriginal}`;
        callback(null, nomeArquivo);
    }
});

// Filtro para aceitar apenas imagens
const filtroImagens = function(requisicao, arquivo, callback) {
    // Tipos de arquivo permitidos
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (tiposPermitidos.includes(arquivo.mimetype)) {
        // Arquivo permitido
        callback(null, true);
    } else {
        // Arquivo não permitido
        callback(new Error('Tipo de arquivo não permitido. Use: JPG, PNG, GIF ou WEBP'), false);
    }
};

// Cria o middleware do Multer
const upload = multer({
    storage: armazenamento,      // Usa nossa configuração de armazenamento
    fileFilter: filtroImagens,   // Usa nosso filtro de tipos
    limits: {
        fileSize: 5 * 1024 * 1024  // Tamanho máximo: 5MB por arquivo
    }
});

// Exporta o upload configurado
module.exports = upload;
