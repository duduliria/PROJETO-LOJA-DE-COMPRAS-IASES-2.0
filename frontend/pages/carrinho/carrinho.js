
const API_URL = 'http://localhost:3000/api';

let carrinho = [];
let formaPagamento = 'pix';

document.addEventListener('DOMContentLoaded', () => {
    carregarCarrinho();
    configurarEventos();
});

async function carregarCarrinho() {
    const listaProdutos = document.getElementById('listaProdutos');
    
    try {
        const resposta = await fetch(`${API_URL}/carrinho`);
        carrinho = await resposta.json();
        
        renderizarCarrinho();
        atualizarResumo();
        verificarBotaoFinalizar();
        
    } catch (erro) {
        console.error('Erro ao carregar carrinho:', erro);
        listaProdutos.innerHTML = `
            <div class="carrinho-vazio">
                <div class="carrinho-vazio-icone"></div>
                <h3>Erro ao carregar</h3>
                <p>Não foi possível conectar ao servidor.</p>
            </div>
        `;
    }
}


function renderizarCarrinho() {
    const listaProdutos = document.getElementById('listaProdutos');
    
    if (carrinho.length === 0) {
        listaProdutos.innerHTML = `
            <div class="carrinho-vazio">
                <div class="carrinho-vazio-icone"></div>
                <h3>Seu carrinho está vazio</h3>
                <p>Adicione produtos para começar suas compras!</p>
                <a href="../catalogo/catalogo.html" class="botao botao-primario">
                    Ver Produtos
                </a>
            </div>
        `;
        return;
    }
    
    listaProdutos.innerHTML = carrinho.map(item => {
        const precoUnitario = parseFloat(item.preco);
        const precoTotal = precoUnitario * item.quantidade;
        const imagemUrl = item.imagem 
            ? `http://localhost:3000${item.imagem}` 
            : '../../images/sem-imagem.jpg';
        
        return `
            <div class="item-carrinho" data-id="${item.id}">
                <img src="${imagemUrl}" alt="${item.nome}" class="item-imagem">
                
                <div class="item-info">
                    <h3 class="item-nome">${item.nome}</h3>
                    <p class="item-preco">R$ ${precoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    <p class="item-preco-unitario">R$ ${precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} cada</p>
                </div>
                
                <div class="item-acoes">
                    <div class="quantidade-controle">
                        <button class="btn-quantidade btn-diminuir" data-id="${item.id}" ${item.quantidade <= 1 ? 'disabled' : ''}>
                            −
                        </button>
                        <span class="quantidade-valor">${item.quantidade}</span>
                        <button class="btn-quantidade btn-aumentar" data-id="${item.id}">
                            +
                        </button>
                    </div>
                    <button class="btn-remover" data-id="${item.id}">
                        Remover
                    </button>
                </div>
            </div>
        `;
    }).join('');
    

    configurarBotoesQuantidade();
    configurarBotoesRemover();
}


function atualizarResumo() {
    const subtotalEl = document.getElementById('subtotal');
    const totalEl = document.getElementById('total');
    const parcelasSelect = document.getElementById('parcelas');
    
    const subtotal = carrinho.reduce((acc, item) => {
        return acc + (parseFloat(item.preco) * item.quantidade);
    }, 0);
    
    let total = subtotal;
    let desconto = 0;
    

    if (formaPagamento === 'pix') {
        desconto = subtotal * 0.10; 
        total = subtotal - desconto;
    } else if (formaPagamento === 'debito') {
        desconto = subtotal * 0.05; 
        total = subtotal - desconto;
    }
    
    subtotalEl.textContent = `R$ ${subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    totalEl.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    

    if (parcelasSelect) {
        parcelasSelect.innerHTML = '';
        for (let i = 1; i <= 12; i++) {
            const valorParcela = total / i;
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `${i}x de R$ ${valorParcela.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} sem juros`;
            parcelasSelect.appendChild(option);
        }
    }
}


function configurarEventos() {

    document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            formaPagamento = e.target.value;
            atualizarResumo();
            verificarBotaoFinalizar();
        });
    });
    

    document.getElementById('btnLimparCarrinho').addEventListener('click', limparCarrinho);
    

    document.getElementById('btnFinalizar').addEventListener('click', finalizarCompra);
}


function configurarBotoesQuantidade() {

    document.querySelectorAll('.btn-diminuir').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await atualizarQuantidade(id, -1);
        });
    });
    

    document.querySelectorAll('.btn-aumentar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await atualizarQuantidade(id, 1);
        });
    });
}


function configurarBotoesRemover() {
    document.querySelectorAll('.btn-remover').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            await removerItem(id);
        });
    });
}


async function atualizarQuantidade(id, delta) {
    const item = carrinho.find(i => i.id == id);
    if (!item) return;
    
    const novaQuantidade = item.quantidade + delta;
    
    if (novaQuantidade < 1) return;
    
    try {
        const resposta = await fetch(`${API_URL}/carrinho/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantidade: novaQuantidade })
        });
        
        if (resposta.ok) {
            item.quantidade = novaQuantidade;
            renderizarCarrinho();
            atualizarResumo();
            verificarBotaoFinalizar();
        }
    } catch (erro) {
        console.error('Erro ao atualizar quantidade:', erro);
    }
}



async function removerItem(id) {
    if (!confirm('Deseja remover este item do carrinho?')) return;
    
    try {
        const resposta = await fetch(`${API_URL}/carrinho/${id}`, {
            method: 'DELETE'
        });
        
        if (resposta.ok) {
            carrinho = carrinho.filter(i => i.id != id);
            renderizarCarrinho();
            atualizarResumo();
            verificarBotaoFinalizar();
        }
    } catch (erro) {
        console.error('Erro ao remover item:', erro);
    }
}


async function limparCarrinho() {
    if (carrinho.length === 0) {
        alert('O carrinho já está vazio!');
        return;
    }
    
    if (!confirm('Deseja limpar todo o carrinho?')) return;
    
    try {
        const resposta = await fetch(`${API_URL}/carrinho`, {
            method: 'DELETE'
        });
        
        if (resposta.ok) {
            carrinho = [];
            renderizarCarrinho();
            atualizarResumo();
            verificarBotaoFinalizar();
        }
    } catch (erro) {
        console.error('Erro ao limpar carrinho:', erro);
    }
}


function verificarBotaoFinalizar() {
    const btnFinalizar = document.getElementById('btnFinalizar');
    btnFinalizar.disabled = carrinho.length === 0;
}


async function finalizarCompra() {
    if (carrinho.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const subtotal = carrinho.reduce((acc, item) => {
        return acc + (parseFloat(item.preco) * item.quantidade);
    }, 0);
    
    let total = subtotal;
    let desconto = 0;
    
    if (formaPagamento === 'pix') {
        desconto = subtotal * 0.10;
        total = subtotal - desconto;
    } else if (formaPagamento === 'debito') {
        desconto = subtotal * 0.05;
        total = subtotal - desconto;
    }
    

    const btnFinalizar = document.getElementById('btnFinalizar');
    btnFinalizar.disabled = true;
    btnFinalizar.innerHTML = 'Processando...';
    

    await new Promise(resolve => setTimeout(resolve, 2000));
    

    try {
        await fetch(`${API_URL}/carrinho`, { method: 'DELETE' });
    } catch (erro) {
        console.error('Erro ao limpar carrinho:', erro);
    }
  
    const modal = document.getElementById('modalSucesso');
    const pedidoInfo = document.getElementById('pedidoInfo');
    
    const numeroPedido = Math.floor(Math.random() * 900000) + 100000;
    
    let formaPagamentoTexto = '';
    switch(formaPagamento) {
        case 'pix':
            formaPagamentoTexto = 'PIX (10% de desconto)';
            break;
        case 'credito':
            formaPagamentoTexto = 'Cartão de Crédito';
            break;
        case 'debito':
            formaPagamentoTexto = 'Cartão de Débito (5% de desconto)';
            break;
    }
    
    pedidoInfo.innerHTML = `
        <p><strong>Número do Pedido:</strong> #${numeroPedido}</p>
        <p><strong>Itens:</strong> ${carrinho.length} produto(s)</p>
        <p><strong>Forma de Pagamento:</strong> ${formaPagamentoTexto}</p>
        <p><strong>Total:</strong> R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
    `;
    
    modal.classList.add('active');

    carrinho = [];
}
