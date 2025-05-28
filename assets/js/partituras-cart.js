// assets/js/partituras-cart.js

// ====== FUNÇÕES GERAIS DE NAVEGAÇÃO E SCROLL ======
const nav = document.querySelector("#header nav");
const toggle = document.querySelectorAll("nav .toggle");

for (const element of toggle) {
    element.addEventListener("click", function() {
        nav.classList.toggle("show");
    });
}

const links = document.querySelectorAll("nav ul li a");
for (const link of links) {
    link.addEventListener("click", function() {
        nav.classList.remove("show");
    });
}

const header = document.querySelector("#header");
const navHeight = header.offsetHeight;

function changeHeaderWhenScroll() {
    if (window.scrollY >= navHeight) {
        header.classList.add("scroll");
    } else {
        header.classList.remove("scroll");
    }
}

const backToTopButton = document.querySelector(".back-to-top");

function backToTop() {
    if (window.scrollY >= 560) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
}

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

window.addEventListener("scroll", function() {
    changeHeaderWhenScroll();
    backToTop();
});


// ====== LÓGICA DO CARRINHO DE COMPRAS E CARREGAMENTO DINÂMICO ======

document.addEventListener('DOMContentLoaded', async () => {
    let cart = JSON.parse(localStorage.getItem('chamaCoralCart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    const partiturasListContainer = document.querySelector('.partituras-list');
    const popup = document.getElementById('add-to-cart-popup'); // Elemento do pop-up
    const popupMessage = document.getElementById('popup-message'); // Mensagem dentro do pop-up

    function updateCartCount() {
        cartCountElement.textContent = cart.length;
    }

    // Função para mostrar o pop-up
    function showPopup(message) {
        popupMessage.textContent = message;
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000); // O pop-up some após 3 segundos
    }

    function saveCart() {
        localStorage.setItem('chamaCoralCart', JSON.stringify(cart));
        updateCartCount();
    }

    // --- Nova Função: Carregar Partituras do Firestore e Renderizar ---
    const loadAndRenderPartituras = async () => {
        partiturasListContainer.innerHTML = '<p>Carregando partituras...</p>';
        try {
            // Verifica se 'db' está definido (do firebase-config.js)
            if (typeof db === 'undefined' || !db.collection) {
                console.warn("Firestore 'db' não está definido. Carregando partituras estáticas.");
                // Se Firestore não estiver disponível, mantemos os cards estáticos no HTML
                // e apenas adicionamos os listeners a eles.
                partiturasListContainer.innerHTML = ''; // Limpa a mensagem de "carregando"
                initializeStaticAddToCartButtons(); // Inicializa os botões dos cards estáticos
                return; 
            }

            // Se 'db' estiver definido, tenta carregar do Firestore
            const snapshot = await db.collection('partituras').orderBy('titulo').get();

            partiturasListContainer.innerHTML = ''; // Limpa os cards estáticos para carregar dinâmicos

            if (snapshot.empty) {
                partiturasListContainer.innerHTML = '<p>Nenhuma partitura encontrada no momento no Firestore.</p>';
                return;
            }

            snapshot.forEach(doc => {
                const partitura = doc.data();
                // Cria o elemento do card dinamicamente
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <span class="top-label">TOP</span>
                    <div class="image-container">
                        <img src="${partitura.imagem_capa_url}" alt="Partitura ${partitura.titulo}">
                    </div>
                    <div class="card-content">
                        <h3 class="title">${partitura.titulo}</h3>
                        <p class="description">${partitura.descricao}</p>
                        <p class="price">R$ ${partitura.preco.toFixed(2).replace('.', ',')}</p>
                        <button class="add-to-cart-btn"
                                data-id="${doc.id}"
                                data-name="${partitura.titulo}"
                                data-price="${partitura.preco}"
                                data-image-url="${partitura.imagem_capa_url || ''}">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                `;
                partiturasListContainer.appendChild(card);
            });

            // Adiciona event listeners aos botões dos cards carregados do Firestore
            attachAddToCartListeners();

            // Aplica ScrollReveal aos cards dinâmicos, se a biblioteca estiver carregada
            if (typeof ScrollReveal !== 'undefined' && scrollReveal) {
                scrollReveal.reveal(`#services .partituras-list .card`, { interval: 100 });
            }

        } catch (error) {
            console.error("Erro ao carregar partituras do Firestore:", error.message);
            partiturasListContainer.innerHTML = '<p style="color: red;">Não foi possível carregar as partituras. Verifique sua configuração do Firestore ou tente novamente mais tarde.</p>';
            // Em caso de erro, talvez seja útil inicializar os botões estáticos como fallback
            initializeStaticAddToCartButtons();
        }
    };

    // Função auxiliar para adicionar listeners aos botões "Adicionar ao Carrinho"
    function attachAddToCartListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                const name = event.target.dataset.name;
                const price = parseFloat(event.target.dataset.price);
                const imageUrl = event.target.dataset.imageUrl;

                const existingItem = cart.find(item => item.id === id);

                if (existingItem) {
                    existingItem.quantity++;
                } else {
                    cart.push({
                        id: id,
                        name: name,
                        price: price,
                        quantity: 1,
                        imageUrl: imageUrl
                    });
                }
                saveCart();
                showPopup(`${name} adicionado ao carrinho!`); // CHAMADA PARA MOSTRAR O POP-UP
            });
        });
    }

    // Função para inicializar botões de cards estáticos (se o Firestore não carregar)
    function initializeStaticAddToCartButtons() {
        const staticCards = document.querySelectorAll('.partituras-list .card');
        if (staticCards.length > 0) {
            // Se houver cards estáticos, adiciona os listeners a eles
            attachAddToCartListeners();
            // Aplica ScrollReveal também aos estáticos, se a biblioteca estiver carregada
            if (typeof ScrollReveal !== 'undefined' && scrollReveal) {
                scrollReveal.reveal(`#services .partituras-list .card`, { interval: 100 });
            }
        }
    }


    // Inicializa o contador do carrinho e carrega as partituras (ou usa os estáticos)
    updateCartCount();
    await loadAndRenderPartituras();
});