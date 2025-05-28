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

    // Create the suggestions container dynamically
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.classList.add("suggestions-list");
    // Insert the suggestions container right after the search input
    searchInput.parentNode.insertBefore(suggestionsContainer, searchInput.nextSibling);

    let allPartituras = []; // This will store all partituras fetched from Firestore

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

    /**
     * Renders sheet music cards into the DOM.
     * @param {Array} sheetMusicArray - An array of sheet music objects to display.
     */
    function renderSheetMusicCards(sheetMusicArray) {
        partiturasListContainer.innerHTML = ''; // Clear existing cards

        if (sheetMusicArray.length === 0) {
            partiturasListContainer.innerHTML = '<p style="text-align: center; width: 100%; margin-top: 20px;">Nenhuma partitura encontrada.</p>';
            return;
        }

        sheetMusicArray.forEach(music => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <span class="top-label">TOP</span>
                <div class="image-container">
                    <img src="${music.imagem_capa_url || 'assets/img/LOGO CHAMA.png'}" alt="Partitura ${music.titulo}">
                </div>
                <div class="card-content">
                    <h3 class="title">${music.titulo}</h3>
                    <p class="description">${music.descricao}</p>
                    <p class="price">R$ ${music.preco.toFixed(2).replace('.', ',')}</p>
                    <button class="add-to-cart-btn"
                            data-id="${music.id}"
                            data-name="${music.titulo}"
                            data-price="${music.preco}"
                            data-image-url="${music.imagem_capa_url || ''}">
                        Adicionar ao Carrinho
                    </button>
                </div>
            `;
            partiturasListContainer.appendChild(card);
        });

        // Re-attach event listeners for "Add to Cart" buttons after rendering
        attachAddToCartListeners();

        // Re-apply ScrollReveal to newly rendered cards
        if (typeof ScrollReveal !== 'undefined' && scrollReveal) {
            scrollReveal.reveal(`#services .partituras-list .card`, { interval: 100 });
        }
    }


    // --- Search Filter Logic (with Suggestions) ---
    const filterAndSuggest = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        suggestionsContainer.innerHTML = ''; // Clear previous suggestions

        if (searchTerm.length === 0) {
            suggestionsContainer.style.display = 'none';
            renderSheetMusicCards(allPartituras); // Show all partituras if search is empty
            return;
        }

        const filteredResults = allPartituras.filter(music =>
            music.titulo.toLowerCase().includes(searchTerm) ||
            music.descricao.toLowerCase().includes(searchTerm)
        );

        const matchingSuggestions = allPartituras.filter(music =>
            music.titulo.toLowerCase().includes(searchTerm)
        );

        if (matchingSuggestions.length > 0) {
            suggestionsContainer.style.display = 'block';
            matchingSuggestions.forEach(music => {
                const suggestionItem = document.createElement("div");
                suggestionItem.classList.add("suggestion-item");
                suggestionItem.textContent = music.titulo;
                suggestionItem.addEventListener("click", () => {
                    searchInput.value = music.titulo; // Populate input with suggestion
                    suggestionsContainer.innerHTML = '';
                    suggestionsContainer.style.display = 'none';
                    renderSheetMusicCards([music]); // Display only the selected partitura
                });
                suggestionsContainer.appendChild(suggestionItem);
            });
        } else {
            suggestionsContainer.style.display = 'none';
        }

        // Always filter and render the main list based on the search term, even if no suggestions
        renderSheetMusicCards(filteredResults);
    };

    // --- Attach Search Event Listeners ---
    const attachSearchListeners = () => {
        if (searchInput && searchButton) { // Ensure elements exist
            searchInput.addEventListener('input', filterAndSuggest); // Use 'input' for real-time suggestions
            searchButton.addEventListener('click', filterAndSuggest);

            // Optional: allow pressing Enter to trigger search
            searchInput.addEventListener("keypress", function(event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    filterAndSuggest();
                    suggestionsContainer.style.display = 'none'; // Hide suggestions on Enter
                }
            });
        }
    };

    // Hide suggestions when clicking outside
    document.addEventListener("click", function(event) {
        if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = 'none';
        }
    });


    // --- Load Partituras from Firestore and Render ---
    const loadAndRenderPartituras = async () => {
        partiturasListContainer.innerHTML = '<p>Carregando partituras...</p>';
        try {
            if (typeof db === 'undefined' || !db.collection) {
                console.warn("Firestore 'db' não está definido. Verifique a configuração do Firebase.");
                partiturasListContainer.innerHTML = '<p style="color: red;">Não foi possível conectar ao Firestore. Verifique a configuração do Firebase.</p>';
                // In a production scenario, you might want to load static data here as a fallback
                return;
            }

            const snapshot = await db.collection('partituras').orderBy('titulo').get();

            allPartituras = []; // Clear previous data
            if (snapshot.empty) {
                partiturasListContainer.innerHTML = '<p>Nenhuma partitura encontrada no momento no Firestore.</p>';
            } else {
                snapshot.forEach(doc => {
                    allPartituras.push({ id: doc.id, ...doc.data() });
                });
                renderSheetMusicCards(allPartituras); // Render all fetched partituras
            }

            attachSearchListeners(); // Crucial: Attach search listeners *after* dynamic cards are added and data is loaded

        } catch (error) {
            console.error("Erro ao carregar partituras do Firestore:", error.message);
            partiturasListContainer.innerHTML = '<p style="color: red;">Não foi possível carregar as partituras. Verifique sua configuração do Firestore ou tente novamente mais tarde.</p>';
            // Even on error, ensure search listeners are attached so user can still type
            attachSearchListeners();
        }
    };

    function attachAddToCartListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.removeEventListener('click', handleAddToCartClick); // Prevent duplicate listeners
            button.addEventListener('click', handleAddToCartClick);
        });
    }

    function handleAddToCartClick(event) {
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
    }

    // Initial load and setup
    updateCartCount();
    await loadAndRenderPartituras();
});