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
    #services .partituras-list .card, /* This will be re-applied after dynamic load */
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


// ====== LÓGICA DO CARRINHO DE COMPRAS E CARREGAMENTO DINÂMICO E FILTRO DE PESQUISA ======

document.addEventListener('DOMContentLoaded', async () => {
    let cart = JSON.parse(localStorage.getItem('chamaCoralCart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    const partiturasListContainer = document.querySelector('.partituras-list');
    const popup = document.getElementById('add-to-cart-popup');
    const popupMessage = document.getElementById('popup-message');

    // --- Search Filter Elements ---
    const searchInput = document.getElementById('sheet-music-search');
    const searchButton = document.getElementById('search-button');

    function updateCartCount() {
        cartCountElement.textContent = cart.length;
    }

    function showPopup(message) {
        popupMessage.textContent = message;
        popup.classList.add('show');
        setTimeout(() => {
            popup.classList.remove('show');
        }, 3000);
    }

    function saveCart() {
        localStorage.setItem('chamaCoralCart', JSON.stringify(cart));
        updateCartCount();
    }

    // --- Search Filter Function ---
    const filterSheetMusic = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        // Get all cards currently in the DOM *after* they've been loaded
        const currentCards = partiturasListContainer.querySelectorAll('.card');

        currentCards.forEach(card => {
            const titleElement = card.querySelector('.title');
            if (titleElement) { // Ensure title element exists
                const title = titleElement.textContent.toLowerCase();
                if (title.includes(searchTerm)) {
                    card.style.display = 'block'; // Show the card
                } else {
                    card.style.display = 'none'; // Hide the card
                }
            }
        });
    };

    // --- Function to Attach Search Event Listeners ---
    const attachSearchListeners = () => {
        if (searchInput && searchButton) { // Ensure elements exist
            searchButton.removeEventListener('click', filterSheetMusic); // Prevent duplicate listeners
            searchInput.removeEventListener('keyup', filterSheetMusic); // Prevent duplicate listeners

            searchButton.addEventListener('click', filterSheetMusic);
            searchInput.addEventListener('keyup', filterSheetMusic);
        }
    };


    // --- Nova Função: Carregar Partituras do Firestore e Renderizar ---
    const loadAndRenderPartituras = async () => {
        partiturasListContainer.innerHTML = '<p>Carregando partituras...</p>';
        try {
            if (typeof db === 'undefined' || !db.collection) {
                console.warn("Firestore 'db' não está definido. Carregando partituras estáticas.");
                partiturasListContainer.innerHTML = '';
                initializeStaticAddToCartButtons();
                attachSearchListeners(); // Attach search listeners even for static cards
                return;
            }

            const snapshot = await db.collection('partituras').orderBy('titulo').get();

            partiturasListContainer.innerHTML = '';

            if (snapshot.empty) {
                partiturasListContainer.innerHTML = '<p>Nenhuma partitura encontrada no momento no Firestore.</p>';
                attachSearchListeners(); // Attach search listeners even if no results
                return;
            }

            snapshot.forEach(doc => {
                const partitura = doc.data();
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

            attachAddToCartListeners();
            attachSearchListeners(); // Crucial: Attach search listeners *after* dynamic cards are added

            if (typeof ScrollReveal !== 'undefined' && scrollReveal) {
                scrollReveal.reveal(`#services .partituras-list .card`, { interval: 100 });
            }

        } catch (error) {
            console.error("Erro ao carregar partituras do Firestore:", error.message);
            partiturasListContainer.innerHTML = '<p style="color: red;">Não foi possível carregar as partituras. Verifique sua configuração do Firestore ou tente novamente mais tarde.</p>';
            initializeStaticAddToCartButtons();
            attachSearchListeners(); // Attach search listeners even on error/fallback
        }
    };

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
                showPopup(`${name} adicionado ao carrinho!`);
            });
        });
    }

    function initializeStaticAddToCartButtons() {
        const staticCards = document.querySelectorAll('.partituras-list .card');
        if (staticCards.length > 0) {
            attachAddToCartListeners();
            if (typeof ScrollReveal !== 'undefined' && scrollReveal) {
                scrollReveal.reveal(`#services .partituras-list .card`, { interval: 100 });
            }
        }
    }

    updateCartCount();
    await loadAndRenderPartituras(); // This call now handles attaching search listeners
});