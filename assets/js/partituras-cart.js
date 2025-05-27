// ====== FUNÇÕES GERAIS DE NAVEGAÇÃO E SCROLL ======

// HEAD E NAVEGAÇÃO (Menu Hambúrguer)
const nav = document.querySelector("#header nav");
const toggle = document.querySelectorAll("nav .toggle"); // Seleciona ambos os toggles de menu/fechar

// Adiciona evento de clique para cada toggle para abrir/fechar o menu
for (const element of toggle) {
    element.addEventListener("click", function() {
        nav.classList.toggle("show");
    });
}

// Esconde o menu quando um item da lista é clicado (para navegação em SPA ou rolagem)
const links = document.querySelectorAll("nav ul li a");
for (const link of links) {
    link.addEventListener("click", function() {
        nav.classList.remove("show"); // Fecha o menu
    });
}

// Adiciona ou remove a classe 'scroll' no header ao rolar a página
const header = document.querySelector("#header");
const navHeight = header.offsetHeight; // Altura inicial do header

function changeHeaderWhenScroll() {
    if (window.scrollY >= navHeight) {
        header.classList.add("scroll");
    } else {
        header.classList.remove("scroll");
    }
}

// Botão "Voltar ao Topo"
const backToTopButton = document.querySelector(".back-to-top");

function backToTop() {
    // Mostra o botão quando a rolagem ultrapassa 560px
    if (window.scrollY >= 560) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
}

// SCROLL REVEAL (Verifique se você tem a biblioteca ScrollReveal incluída no HTML)
// Se você não for usar o ScrollReveal, pode remover este bloco.
const scrollReveal = ScrollReveal({
    origin: 'top',
    distance: '30px',
    duration: 700,
    reset: true
});

scrollReveal.reveal(
    `#home .image-box,
    #services header,
    #services .partituras-list .card,
    #testimonials header,
    #testimonials .testimonials,
    #contact .text,
    #contact .links,
    footer .brand,
    footer .social`,
    { interval: 100 }
);


// Adiciona um único event listener para o evento 'scroll' da janela
// Chamando as funções de mudança de header e do botão back-to-top
window.addEventListener("scroll", function() {
    changeHeaderWhenScroll();
    backToTop();
});


// ====== LÓGICA DO CARRINHO DE COMPRAS ======

// Espera o DOM ser completamente carregado antes de inicializar o carrinho
document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('chamaCoralCart')) || []; // Usando a mesma chave do seu script
    const cartCountElement = document.getElementById('cart-count');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const popup = document.getElementById('add-to-cart-popup'); // Elemento do popup de confirmação
    const popupMessage = document.getElementById('popup-message'); // Mensagem dentro do popup

    // Função para atualizar o contador de itens no ícone do carrinho
    function updateCartCount() {
        cartCountElement.textContent = cart.length; // Conta o número de itens únicos no carrinho
    }

    // Exibe o popup de confirmação
    function showPopup(message) {
        popupMessage.textContent = message;
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000); // Popup desaparece após 3 segundos
    }

    // Salva o carrinho no localStorage
    function saveCart() {
        localStorage.setItem('chamaCoralCart', JSON.stringify(cart));
        updateCartCount(); // Garante que o contador seja atualizado após salvar
    }

    // Adiciona um item ao carrinho
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const id = event.target.dataset.id;
            const name = event.target.dataset.name;
            const price = parseFloat(event.target.dataset.price);

            // Verifica se o item já está no carrinho
            const existingItem = cart.find(item => item.id === id);

            if (existingItem) {
                // Se o item já existe, incrementa a quantidade
                existingItem.quantity++;
            } else {
                // Se o item não existe, adiciona como novo item
                cart.push({
                    id: id,
                    name: name,
                    price: price,
                    quantity: 1
                });
            }
            saveCart(); // Salva no localStorage e atualiza o contador
            showPopup(`${name} adicionado ao carrinho!`); // Exibe o popup
        });
    });

    // Inicializa o contador do carrinho ao carregar a página
    updateCartCount();
});