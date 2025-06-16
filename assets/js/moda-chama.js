// assets/js/moda-chama.js
document.addEventListener('DOMContentLoaded', async () => {
    const modaListContainer = document.getElementById('moda-list');

    function renderModaItems(items) {
        if (!modaListContainer) return;
        modaListContainer.innerHTML = '';
        if (items.length === 0) {
            modaListContainer.innerHTML = '<p>Nenhum item de moda encontrado.</p>';
            return;
        }

        items.forEach(item => {
            const itemBox = document.createElement('div');
            itemBox.className = 'image-box';
            const preco = typeof item.preco === 'number' ? item.preco : 0;
            
            itemBox.innerHTML = `
                <img src="${item.imagem_capa_url || 'assets/img/LOGO CHAMA.png'}" alt="${item.titulo}">
                <p>${item.titulo}</p>
                <p class="price">R$ ${preco.toFixed(2).replace(',', '.')}</p>
                <button class="add-to-cart-btn"
                        data-id="${item.id}"
                        data-name="${item.titulo}">
                    Adicionar ao Carrinho
                </button>
            `;
            modaListContainer.appendChild(itemBox);
        });
    }

    async function loadModaItems() {
        try {
            const snapshot = await db.collection('produtos').where('tipo', '==', 'moda').get();
            const modaItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderModaItems(modaItems);
        } catch (error) {
            console.error("Erro ao carregar itens de moda: ", error);
            modaListContainer.innerHTML = '<p style="color: red;">Não foi possível carregar os produtos.</p>';
        }
    }

    modaListContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('add-to-cart-btn')) {
            const button = event.target;
            const productInfo = { id: button.dataset.id, name: button.dataset.name };
            addToCart(productInfo);
            alert(`${productInfo.name} foi adicionado ao carrinho!`);
        }
    });

    await loadModaItems();
});