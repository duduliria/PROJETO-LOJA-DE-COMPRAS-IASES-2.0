const API_URL = 'http://localhost:3000/api';

// Carregar produtos da API
async function carregarProdutosCatalogo() {
    const gradeProdutos = document.getElementById("gradeProdutos");
    
    try {
        const resposta = await fetch(`${API_URL}/produtos`);
        const produtos = await resposta.json();
        
        gradeProdutos.innerHTML = "";
        
        if (produtos.length === 0) {
            gradeProdutos.innerHTML = '<p class="sem-produtos">Nenhum produto disponível no momento.</p>';
            return;
        }
        
        produtos.forEach(produto => {
            const imagemPrincipal = produto.imagens && produto.imagens.length > 0 
                ? `http://localhost:3000${produto.imagens[0].caminho}` 
                : '../../images/sem-imagem.jpg';
            
            const listaImagens = produto.imagens && produto.imagens.length > 0
                ? produto.imagens.map(img => `http://localhost:3000${img.caminho}`).join('|')
                : '';
            
            const qtdFotos = produto.imagens ? produto.imagens.length : 0;
            
            const card = document.createElement("article");
            card.className = "produto-card";
            card.innerHTML = `
                <div class="imagem-wrapper">
                    <img src="${imagemPrincipal}" alt="${produto.nome}">
                    ${qtdFotos > 1 ? `<span class="badge-fotos">+${qtdFotos} fotos</span>` : ''}
                </div>
                <div class="produto-conteudo">
                    <h3 class="produto-titulo">${produto.nome}</h3>
                    <p class="produto-preco">R$ ${parseFloat(produto.preco).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    <p class="produto-descricao">${produto.descricao}</p>
                    <div class="acoes-catalogo">
                        ${listaImagens ? `
                        <a href="#" class="botao botao-secundario botao-detalhes" data-imagens="${listaImagens}">
                            Ver Fotos
                        </a>` : ''}
                        <button class="botao botao-primario botao-adicionar-carrinho"
                            data-id="${produto.id}"
                            data-nome="${produto.nome}"
                            data-preco="${produto.preco}"
                            data-imagem="${imagemPrincipal}">
                            Adicionar
                        </button>
                    </div>
                </div>
            `;
            gradeProdutos.appendChild(card);
        });
        
        configurarBotoesDetalhes();
        configurarBotoesCarrinho();
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}

(function () {
  const modal = document.querySelector(".modal")
  const modalCaixa = document.querySelector(".modal-caixa")
  const listaItens = document.getElementById("listaItens")
  const thumb = document.getElementById("thumb")
  const botaoFechar = document.querySelector(".modal-fechar")

  function fecharModal() {
    modal.classList.remove("active")
    listaItens.innerHTML = ""
    thumb.style.backgroundImage = ""
  }

  function itemSelecionado(elementoSelecionado){
    const cardItem = listaItens.querySelectorAll(".item-card")
    cardItem.forEach((item) => item.classList.remove("active"))
    elementoSelecionado.classList.add("active")
  }

  function mostrarNaThumb(index, imagens) {
      if (imagens[index]){
        thumb.style.backgroundImage = `url('${imagens[index]}')`
      }
  }

  window.abrirModalComImagens = function(imagens) {
    console.log('Imagens recebidas:', imagens);
    if (!Array.isArray(imagens) || imagens.length === 0) return

    thumb.style.backgroundImage = `url('${imagens[0]}')`

    listaItens.innerHTML = ""
    imagens.forEach((src, index) => {
      console.log('Carregando imagem:', src);
      const item = document.createElement("button")
      item.type = "button"
      item.className = "item-card"
      item.style.backgroundImage = `url('${src}')`
      if (index === 0) item.classList.add("active")

        item.addEventListener("mouseover", () => {
          itemSelecionado(item)
          mostrarNaThumb(index, imagens)
        })

        item.addEventListener("click", () => {
          itemSelecionado(item)
          mostrarNaThumb(index, imagens)
        })
        listaItens.appendChild(item)
    })
    modal.classList.add("active")
  }

  window.addEventListener("keyup", (event) => {
    if (event.key === "Escape") fecharModal()
  })

  modal.addEventListener("click", function (event) {
    if (event.target === this) fecharModal()
  });

  botaoFechar.addEventListener("click", fecharModal)
})();

function configurarBotoesDetalhes() {
    document.querySelectorAll(".botao-detalhes").forEach((botao) => {
        botao.addEventListener("click", (e) => {
            e.preventDefault()
            const lista = (botao.getAttribute("data-imagens") || "")
                .split("|")
                .filter(Boolean)
            abrirModalComImagens(lista)
        })
    })
}

document.addEventListener('DOMContentLoaded', () => {
    carregarProdutosCatalogo();
    atualizarContadorCarrinho();
});

function configurarBotoesCarrinho() {
    document.querySelectorAll('.botao-adicionar-carrinho').forEach(botao => {
        botao.addEventListener('click', async () => {
            const produto = {
                produto_id: parseInt(botao.dataset.id),
                quantidade: 1
            };
            await adicionarAoCarrinho(produto);
        });
    });
}

async function adicionarAoCarrinho(produto) {
    try {
        const resposta = await fetch(`${API_URL}/carrinho`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produto)
        });
        
        if (resposta.ok) {
            alert('Produto adicionado ao carrinho!');
            atualizarContadorCarrinho();
        } else {
            const erro = await resposta.json();
            alert('Erro: ' + erro.erro);
        }
    } catch (erro) {
        console.error('Erro ao adicionar ao carrinho:', erro);
        alert('Erro ao conectar com o servidor');
    }
}

async function atualizarContadorCarrinho() {
    try {
        const resposta = await fetch(`${API_URL}/carrinho`);
        const carrinho = await resposta.json();
        const total = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
        document.getElementById('contadorCarrinho').textContent = total;
    } catch (erro) {
        document.getElementById('contadorCarrinho').textContent = '0';
    }
}
