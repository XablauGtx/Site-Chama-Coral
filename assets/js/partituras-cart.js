// assets/js/partituras-cart.js
document.addEventListener('DOMContentLoaded', async () => {
    const partiturasListContainer = document.querySelector('.partituras-list');
    const popup = document.getElementById('add-to-cart-popup');
    const popupMessage = document.getElementById('popup-message');
    const searchInput = document.getElementById('sheet-music-search');
    const searchButton = document.getElementById('search-button');
    let allPartituras = [];

    function showPopup(message) {
        if (popupMessage && popup) {
            popupMessage.textContent = message;
            popup.classList.add('show');
            setTimeout(() => popup.classList.remove('show'), 3000);
        }
    }

    function renderSheetMusicCards(sheetMusicArray) {
        if (!partiturasListContainer) return;
        partiturasListContainer.innerHTML = '';

        if (sheetMusicArray.length === 0) {
            partiturasListContainer.innerHTML = '<p style="text-align: center; width: 100%; margin-top: 20px;">Nenhuma partitura encontrada.</p>';
            return;
        }

        sheetMusicArray.forEach(music => {
            const card = document.createElement('div');
            card.classList.add('card');
            const preco = typeof music.preco === 'number' ? music.preco : 0;

            card.innerHTML = `
                <span class="top-label">TOP</span>
                <div class="image-container">
                    <img src="${music.imagem_capa_url || 'assets/img/LOGO CHAMA.png'}" alt="Partitura ${music.titulo}">
                </div>
                <div class="card-content">
                    <h3 class="title">${music.titulo}</h3>
                    <p class="description">${music.descricao}</p>
                    <p class="price">R$ ${preco.toFixed(2).replace('.', ',')}</p>
                    <button class="add-to-cart-btn" data-id="${music.id}" data-name="${music.titulo}">Adicionar ao Carrinho</button>
                </div>
            `;
            partiturasListContainer.appendChild(card);
        });
    }

    if (partiturasListContainer) {
        partiturasListContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-btn')) {
                const button = event.target;
                const productInfo = {
                    id: button.dataset.id,
                    name: button.dataset.name 
                };
                // Chama a função global do cart-logic.js (versão segura)
                addToCart(productInfo);
                showPopup(`${productInfo.name} foi adicionado ao carrinho!`);
            }
        });
    }

    const filterPartituras = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const filteredResults = allPartituras.filter(music =>
            music.titulo.toLowerCase().includes(searchTerm) ||
            (music.descricao && music.descricao.toLowerCase().includes(searchTerm))
        );
        renderSheetMusicCards(filteredResults);
    };

    const loadAndRenderPartituras = async () => {
        if (!partiturasListContainer) return;
        partiturasListContainer.innerHTML = '<p>Carregando partituras...</p>';
        try {
            const snapshot = await db.collection('produtos').where('tipo', '==', 'partitura').orderBy('titulo').get();
            allPartituras = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderSheetMusicCards(allPartituras);
            
            if (searchButton && searchInput) {
                searchButton.addEventListener('click', filterPartituras);
                searchInput.addEventListener('input', filterPartituras);
            }
        } catch (error) {
            console.error("Erro ao carregar partituras do Firestore:", error.message);
            partiturasListContainer.innerHTML = '<p style="color: red;">Não foi possível carregar as partituras. Tente novamente mais tarde.</p>';
        }
    };

    await loadAndRenderPartituras();
});