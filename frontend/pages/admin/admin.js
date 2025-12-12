const API_URL = 'http://localhost:3000/api';

// Carregar produtos da API
async function carregarProdutos() {
    const gradeProdutos = document.getElementById("gradeProdutos");
    
    try {
        const resposta = await fetch(`${API_URL}/produtos`);
        const produtos = await resposta.json();
        
        gradeProdutos.innerHTML = "";
        
        if (produtos.length === 0) {
            gradeProdutos.innerHTML = '<p class="sem-produtos">Nenhum produto cadastrado ainda.</p>';
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
                    <div class="acoes-produto">
                        ${listaImagens ? `
                        <button class="botao botao-secundario botao-ver" data-imagens="${listaImagens}">
                            <span class="icone">👁️</span> Ver
                        </button>` : ''}
                        <button class="botao botao-secundario botao-editar" data-id="${produto.id}">
                            <span class="icone">✏️</span> Editar
                        </button>
                        <button class="botao botao-excluir" title="Excluir" data-id="${produto.id}">
                            <span class="icone">🗑️</span>
                        </button>
                    </div>
                </div>
            `;
            gradeProdutos.appendChild(card);
        });
    } catch (erro) {
        console.error("Erro ao carregar produtos:", erro);
    }
}

// Carregar produtos ao iniciar a página
document.addEventListener("DOMContentLoaded", carregarProdutos);

// Modal de Galeria
(function () {
    const modalGaleria = document.querySelector(".modal[aria-label='Galeria de imagens do produto']");
    if (!modalGaleria) return;

    const modalCaixa = modalGaleria.querySelector(".modal-caixa");
    const listaItens = document.getElementById("listaItens");
    const thumb = document.getElementById("thumb");
    const botaoFechar = modalCaixa.querySelector(".modal-fechar");

    function fecharModal() {
        modalGaleria.classList.remove("active");
        if (listaItens) listaItens.innerHTML = "";
        if (thumb) thumb.style.backgroundImage = "";
    }

    function itemSelecionado(elementoSelecionado) {
        const cardItem = listaItens.querySelectorAll(".item-card");
        cardItem.forEach((item) => item.classList.remove("active"));
        elementoSelecionado.classList.add("active");
    }

    function mostrarNaThumb(index, imagens) {
        if (imagens[index]) {
            thumb.style.backgroundImage = `url(${imagens[index]})`;
        }
    }

    window.abrirModalComImagens = function(imagens) {
        if (!Array.isArray(imagens) || imagens.length === 0) return;
        thumb.style.backgroundImage = `url(${imagens[0]})`;
        listaItens.innerHTML = "";
        imagens.forEach((src, index) => {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "item-card";
            item.style.backgroundImage = `url(${src})`;
            if (index === 0) item.classList.add("active");
            item.addEventListener("mouseover", () => {
                itemSelecionado(item);
                mostrarNaThumb(index, imagens);
            });
            item.addEventListener("click", () => {
                itemSelecionado(item);
                mostrarNaThumb(index, imagens);
            });
            listaItens.appendChild(item);
        });
        modalGaleria.classList.add("active");
    }

    window.addEventListener("keyup", (event) => {
        if (event.key === "Escape" && modalGaleria.classList.contains("active")) fecharModal();
    });

    modalGaleria.addEventListener("click", function (event) {
        if (event.target === this) fecharModal();
    });

    if (botaoFechar) botaoFechar.addEventListener("click", fecharModal);

    document.addEventListener('click', (e) => {
        if (e.target.closest('.botao-ver')) {
            e.preventDefault();
            const botao = e.target.closest('.botao-ver');
            const lista = (botao.getAttribute("data-imagens") || "").split("|").filter(Boolean);
            abrirModalComImagens(lista);
        }
    });
}());

// Modal Novo/Editar Produto
const modalNovoProduto = document.getElementById("modalNovoProduto");
const abrirNovoProduto = document.getElementById("abrirNovoProduto");
const fecharNovoProduto = document.getElementById("fecharNovoProduto");
const cancelarProduto = document.getElementById("cancelarProduto");
const formProduto = document.getElementById("formProduto");
const tituloModal = document.getElementById("tituloModal");
const btnSubmit = document.getElementById("btnSubmit");
const produtoIdInput = document.getElementById("produtoId");

let modoEdicao = false;
let imagensParaRemover = [];

function abrirModalNovoProduto() {
    modoEdicao = false;
    produtoIdInput.value = "";
    formProduto.reset();
    tituloModal.textContent = "Novo Produto";
    btnSubmit.textContent = "Criar";
    document.getElementById("previewImagens").innerHTML = "";
    imagensParaRemover = [];
    modalNovoProduto.classList.add("active");
}

function fecharModalNovoProduto() {
    modalNovoProduto.classList.remove("active");
    formProduto.reset();
    document.getElementById("previewImagens").innerHTML = "";
    imagensParaRemover = [];
}

function abrirModalEditarProduto(produto) {
    modoEdicao = true;
    produtoIdInput.value = produto.id;
    document.getElementById("nomeProduto").value = produto.nome;
    document.getElementById("precoProduto").value = produto.preco;
    document.getElementById("descProduto").value = produto.descricao;
    tituloModal.textContent = "Editar Produto";
    btnSubmit.textContent = "Salvar";
    imagensParaRemover = [];
    
    const previewContainer = document.getElementById("previewImagens");
    previewContainer.innerHTML = "";
    
    if (produto.imagens && produto.imagens.length > 0) {
        produto.imagens.forEach(img => {
            const div = document.createElement("div");
            div.className = "preview-item";
            div.innerHTML = `
                <img src="http://localhost:3000${img.caminho}" alt="Preview">
                <button type="button" class="btn-remover-preview" data-id="${img.id}">&times;</button>
            `;
            previewContainer.appendChild(div);
        });
    }
    
    modalNovoProduto.classList.add("active");
}

if (abrirNovoProduto) abrirNovoProduto.addEventListener("click", abrirModalNovoProduto);
if (fecharNovoProduto) fecharNovoProduto.addEventListener("click", fecharModalNovoProduto);
if (cancelarProduto) cancelarProduto.addEventListener("click", fecharModalNovoProduto);

window.addEventListener("keyup", (event) => {
    if (event.key === "Escape" && modalNovoProduto.classList.contains("active")) fecharModalNovoProduto();
});

if (modalNovoProduto) {
    modalNovoProduto.addEventListener("click", function (event) {
        if (event.target === this) fecharModalNovoProduto();
    });
}

// Preview de imagens selecionadas
document.getElementById("imagensProduto").addEventListener("change", function(e) {
    const previewContainer = document.getElementById("previewImagens");
    const arquivos = e.target.files;
    
    for (let arquivo of arquivos) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const div = document.createElement("div");
            div.className = "preview-item preview-novo";
            div.innerHTML = `
                <img src="${event.target.result}" alt="Preview">
                <span class="badge-novo">Nova</span>
            `;
            previewContainer.appendChild(div);
        };
        reader.readAsDataURL(arquivo);
    }
});

// Remover imagem existente
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-remover-preview")) {
        const imagemId = e.target.dataset.id;
        if (imagemId) {
            imagensParaRemover.push(parseInt(imagemId));
        }
        e.target.parentElement.remove();
    }
});

// Submit do formulário
formProduto.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("nome", document.getElementById("nomeProduto").value);
    formData.append("preco", document.getElementById("precoProduto").value);
    formData.append("descricao", document.getElementById("descProduto").value);
    
    const arquivos = document.getElementById("imagensProduto").files;
    for (let arquivo of arquivos) {
        formData.append("imagens", arquivo);
    }
    
    if (imagensParaRemover.length > 0) {
        formData.append("imagensRemover", JSON.stringify(imagensParaRemover));
    }
    
    try {
        let url = `${API_URL}/produtos`;
        let metodo = "POST";
        
        if (modoEdicao) {
            url = `${API_URL}/produtos/${produtoIdInput.value}`;
            metodo = "PUT";
        }
        
        const resposta = await fetch(url, {
            method: metodo,
            body: formData
        });
        
        if (resposta.ok) {
            alert(modoEdicao ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
            fecharModalNovoProduto();
            carregarProdutos();
        } else {
            alert("Erro ao salvar produto");
        }
    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao salvar produto");
    }
});

// Editar produto
document.addEventListener("click", async (e) => {
    if (e.target.closest(".botao-editar")) {
        const botao = e.target.closest(".botao-editar");
        const id = botao.dataset.id;
        
        if (id) {
            try {
                const resposta = await fetch(`${API_URL}/produtos/${id}`);
                const produto = await resposta.json();
                abrirModalEditarProduto(produto);
            } catch (erro) {
                const produto = {
                    id: id,
                    nome: botao.dataset.nome,
                    preco: botao.dataset.preco,
                    descricao: botao.dataset.descricao,
                    imagens: []
                };
                abrirModalEditarProduto(produto);
            }
        }
    }
});

// Excluir produto
document.addEventListener("click", async (e) => {
    if (e.target.closest(".botao-excluir")) {
        const botao = e.target.closest(".botao-excluir");
        const id = botao.dataset.id;
        
        if (id && confirm("Deseja realmente excluir este produto?")) {
            try {
                const resposta = await fetch(`${API_URL}/produtos/${id}`, {
                    method: "DELETE"
                });
                
                if (resposta.ok) {
                    alert("Produto excluído com sucesso!");
                    carregarProdutos();
                } else {
                    alert("Erro ao excluir produto");
                }
            } catch (erro) {
                console.error("Erro:", erro);
                alert("Erro ao excluir produto");
            }
        }
    }
});