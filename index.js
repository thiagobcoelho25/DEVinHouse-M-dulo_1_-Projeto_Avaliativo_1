import { Artigo } from './artigo.js'

const BASE_URL = 'http://localhost:3000/resultados';

let lista_artigos = []

const save_form = document.getElementById('form-post')

const main_content = document.getElementById('main_content')

const container_cards = document.getElementsByClassName("container-cards")[0]

const form_search_elements_container = document.getElementsByClassName("search-elements-container")[0]

/* Duvida icone interferindo no bottao -> troqquei target por currentTarget
  Duvida de não poder passar para funções mais de uma vez e.currentTarget.Value -> exemplo no botao de deletar
  Duvida em criar modal para confirmação e edição
  Duvida Para trocar caminho/origem das pastas do github, por causa do conflito do json-server
  */

save_form.addEventListener('submit', async function (e) {
  e.preventDefault()

  const titulo = e.target.titulo.value;
  const linguagem_skill = e.target.linguagem_skill.value
  const categoria = e.target.categoria.value
  const descricao = e.target.descricao.value;
  const youtube_link = e.target.youtube_link.value ? e.target.youtube_link.value : null

  try {
    const dados = await enviarDados({ "titulo": titulo, "linguagem_skill": linguagem_skill, "categoria": categoria, "descricao": descricao, "youtube_link": youtube_link })
    const artigo = new Artigo(dados.id, dados.titulo, dados.linguagem_skill, dados.categoria, dados.descricao, dados.youtube_link)

    lista_artigos.push(artigo)

    atualizarTela(lista_artigos, container_cards, main_content)

    alert("SUCESSO!\n Dica cadastrada na base do conhecimento.")

  } catch (error) {
    alert(`ERROR!\n não conseguimos completar a requisição devido a:\n ${error}`)
  }

  save_form.reset();
})

form_search_elements_container.addEventListener('submit', function (e) {
  e.preventDefault()

  const search = e.target.search.value.trim();
  if (search != "") {
    const lista_artigos_filtered_by_search = lista_artigos.filter(artigo => artigo.titulo.toLowerCase().includes(search))
    atualizarTela(lista_artigos_filtered_by_search, 0, main_content)
  }

})

form_search_elements_container.addEventListener('reset', function (e) {
  atualizarTela(lista_artigos, 0, main_content)
})


async function buscarDados() {
  const resultado = await fetch(BASE_URL, {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' }
  });

  return await resultado.json();
}

async function enviarDados(data) {

  const resultado = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(data)
  })

  if (resultado.status != 201) {
    const text_error = resultado.statusText
    throw new Error(text_error);
  }

  return await resultado.json()

}

async function deletarDados(id) {

  const resultado = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  })

  return await resultado.json()

}

function criarHTMLArtigo(artigo, html_main_content) {
  const article_content = document.createElement('article')
  article_content.className = "article-content"
  article_content.id = artigo.id

  const h2_title = document.createElement('h2')
  h2_title.innerText = artigo.titulo

  article_content.appendChild(h2_title)

  const div_article_content_subtext = document.createElement('div')
  div_article_content_subtext.className = "article-content-subtext"

  const div_article_content_subtext_text_1 = document.createElement('div')
  div_article_content_subtext_text_1.className = "article-content-subtext-text"

  const div_article_content_subtext_text_2 = document.createElement('div')
  div_article_content_subtext_text_2.className = "article-content-subtext-text"

  const text_area = document.createElement('textarea')

  const h4_title_1 = document.createElement('h4')
  h4_title_1.innerText = "Linguagem/Skill:"

  const p_1 = document.createElement('p')
  p_1.innerText = artigo.linguagem_skill

  div_article_content_subtext_text_1.appendChild(h4_title_1)
  div_article_content_subtext_text_1.appendChild(p_1)

  const h4_title_2 = document.createElement('h4')
  h4_title_2.innerText = "Categoria:"

  const p_2 = document.createElement('p')
  p_2.innerText = artigo.categoria

  div_article_content_subtext_text_2.appendChild(h4_title_2)
  div_article_content_subtext_text_2.appendChild(p_2)

  text_area.innerText = artigo.descricao
  text_area.cols = "30"
  text_area.rows = "10"

  div_article_content_subtext.appendChild(div_article_content_subtext_text_1)
  div_article_content_subtext.appendChild(div_article_content_subtext_text_2)
  div_article_content_subtext.appendChild(text_area)

  article_content.appendChild(div_article_content_subtext)

  const div_article_buttons = document.createElement('div')
  div_article_buttons.className = "article-buttons"

  const button_delete = document.createElement('button')
  const i_delete = document.createElement('i')
  i_delete.className = "fa-regular fa-trash-can"
  button_delete.appendChild(i_delete)
  button_delete.id = artigo.id

  button_delete.addEventListener('click', function (e) {
    abrirModalDelecao()
  })

  const button_edit = document.createElement('button')
  const i_edit = document.createElement('i')
  i_edit.className = "fa-regular fa-pen-to-square"
  button_edit.appendChild(i_edit)

  div_article_buttons.appendChild(button_delete)
  div_article_buttons.appendChild(button_edit)

  if (artigo.youtube_link) {
    criarButtonHTMLYoutube(artigo, div_article_buttons)
  }

  article_content.appendChild(div_article_buttons)

  if (artigo.youtube_link) {
    const iframe_youtube = document.createElement('iframe')
    iframe_youtube.className = 'iframe-youtube'
    iframe_youtube.style.display = 'none'
    iframe_youtube.src = artigo.youtube_link

    article_content.appendChild(iframe_youtube)
  }

  html_main_content.appendChild(article_content)
}

function criarButtonHTMLYoutube(artigo, div_article_buttons) {
  const button_youtube = document.createElement('button')
  const i_youtube = document.createElement('i')
  button_youtube.id = artigo.id
  button_youtube.className = "youtube-button"
  i_youtube.className = "fa-brands fa-youtube"
  button_youtube.appendChild(i_youtube)

  /* button_youtube.className = 'button_youtube'
   button_youtube.name = 'close'*/

  /*button_youtube.addEventListener('click', (e) => {
    const name = e.currentTarget.name
    const id = Number.parseInt(e.currentTarget.id)
    const article_div = document.getElementById(`${id}`)

    if (name === 'close') {
      const artigo = lista_artigos.find(artigo => artigo.id === id)
      const iframe = document.createElement('iframe')
      iframe.src = artigo.youtube_link
      iframe.height = "500px"
      iframe.width = "700px"

      iframe.classList.add('box', 'new-box');
      e.currentTarget.name = 'open'

      article_div.appendChild(iframe)
    } else {
      e.currentTarget.name = 'close'
      article_div.removeChild(article_div.lastChild);
    }
  })
  */

  button_youtube.addEventListener('click', (e) => {
    const id = Number.parseInt(e.currentTarget.id)
    const iframe_div = document.getElementById(`${id}`).lastChild

    //iframe_div.className = iframe_div.className === 'iframe-youtube-none' ? 'iframe-youtube-block' : 'iframe-youtube-none'
    iframe_div.style.display = iframe_div.style.display === 'none' ? 'block' : 'none'
  })

  div_article_buttons.appendChild(button_youtube)
}

function criarHTMLQuantidadeCategoria(categoria, quantidade) {
  const container_card_categoria = document.createElement('div')
  container_card_categoria.innerText = categoria
  container_card_categoria.className = 'container-card'
  container_card_categoria.id = categoria

  const p_quantidade = document.createElement('p')
  p_quantidade.innerText = categoria = quantidade

  container_card_categoria.appendChild(p_quantidade)

  return container_card_categoria
}

function deletarArtigo(id) {
  lista_artigos = lista_artigos.filter(artigo => artigo.id != id)
  atualizarTela(lista_artigos, container_cards, main_content)
}

function popularTabelaQuantidadeCategoria(categoria, tabela_tipos) {
  tabela_tipos[categoria] += 1
  tabela_tipos.Total += 1
}

function popularHTMLQuantidadeCategorias(container_cards, tabela_tipos) {
  Object.keys(tabela_tipos).forEach(categoria => {
    container_cards.appendChild(criarHTMLQuantidadeCategoria(categoria, tabela_tipos[categoria]))
  });
}

function atualizarTela(dados, container_cards = 0, main_content) {
  main_content.innerHTML = ""

  if (container_cards === 0) {
    dados.forEach(dado => {
      criarHTMLArtigo(dado, main_content)
    });
  } else {
    container_cards.innerHTML = ""
    const tabela_tipos = {
      Total: 0,
      FrontEnd: 0,
      BackEnd: 0,
      FullStack: 0,
      SoftSkill: 0
    }

    dados.forEach(dado => {
      criarHTMLArtigo(dado, main_content)
      popularTabelaQuantidadeCategoria(dado.categoria, tabela_tipos)
    });

    popularHTMLQuantidadeCategorias(container_cards, tabela_tipos)
  }
}


/* ----------------------------------------------------------------------------------------------- */
// INICIALIZA DADOS NA TELA

(async () => {
  const dados = await buscarDados()
  lista_artigos.push(...dados)

  atualizarTela(lista_artigos, container_cards, main_content)
})()

/* funcções dos modais */

function abrirModalDelecao() {
  modal_container_delete.style.display = 'block'
  deletebtn.id = '1'
}

const modal_container_delete = document.getElementById('id01')

const span_close_modal_delete = document.getElementsByClassName('close')[0]

span_close_modal_delete.addEventListener('click', (e) => {
  modal_container_delete.style.display = 'none'
  deletebtn.removeAttribute('id')
})

const cancelbtn = document.getElementsByClassName('cancelbtn')[0]

cancelbtn.addEventListener('click', (e) => {
  modal_container_delete.style.display = 'none'
  deletebtn.removeAttribute('id')
})

const deletebtn = document.getElementsByClassName('deletebtn')[0]

deletebtn.addEventListener('click', async (e) => {
  modal_container_delete.style.display = 'none'

  const id = deletebtn.id
  await deletarDados(id)
  deletarArtigo(Number.parseInt(id))

  alert('DADOS DELETADOS COM SUCESSO!')
})

modal_container_edit = document.getElementById('id02')

function abrirModalEdicao() {

}
