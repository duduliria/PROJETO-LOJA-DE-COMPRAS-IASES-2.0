// Aguarda o carregamento completo da página
document.addEventListener("DOMContentLoaded", function () {
  // Codigo vai aqui dentro, embaixo
  const botaoTema = document.getElementById("botaoTema")
  const iconeTema = botaoTema.querySelector(".icone-tema")
  const temaSalvo = localStorage.getItem("tema")

  if (temaSalvo) {
    document.body.className = temaSalvo
    atualizarIcone(temaSalvo)
  }

  botaoTema.addEventListener("click", alternarTema)

  function alternarTema() {
    const temaAtual = document.body.className
    console.log(temaAtual);

    let novoTema;
    if (temaAtual === "tema-claro") {
      novoTema = "tema-escuro"
    } else {
      novoTema = "tema-claro"
    }

    botaoTema.style.transform = "rotate(360deg)"

    setTimeout(function () {
      document.body.className = novoTema

      atualizarIcone(novoTema)

      localStorage.setItem("tema", novoTema)
      botaoTema.style.transform = "rotate(0deg)"
    }, 150)
  }

  function atualizarIcone(tema) {
    if (tema === "tema-claro") {
      iconeTema.textContent = "●"
    } else {
      iconeTema.textContent = "○"
    }
  }
});