// assets/js/carrinho-page.js
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-display');
    const cartTotalPriceSpan = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const paymentModal = document.getElementById('payment-modal');
    const closeModalButton = document.getElementById('close-modal');
    const paymentOptionsContent = document.getElementById('payment-options-content');

    const WHATSAPP_NUMBER = '5541974023333';
    const PIX_KEY = 'seuchamacoral@email.com';

    async function renderCartPage() {
        const cart = loadCart();
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Carregando seu carrinho...</p>';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Seu carrinho está vazio.</p>';
            cartTotalPriceSpan.textContent = 'R$ 0,00';
            if (checkoutButton) checkoutButton.disabled = true;
            return;
        }

        try {
            const productIds = cart.map(item => item.id);
            if (productIds.length === 0) {
                 renderCartPage(); // Re-renderiza para mostrar carrinho vazio
                 return;
            }

            // Busca os produtos das coleções 'partituras' e 'produtos' (para moda)
            // NOTA: Firestore não suporta query 'in' em múltiplas coleções. Faremos duas buscas.
            const productsSnapshot = await db.collection('produtos').where(firebase.firestore.FieldPath.documentId(), 'in', productIds).get();
            // Assumindo que os itens de moda estarão em uma coleção 'produtos'
            // const modaSnapshot = await db.collection('produtos').where(firebase.firestore.FieldPath.documentId(), 'in', productIds).get();

            const productsData = {};
            partiturasSnapshot.forEach(doc => {
                productsData[doc.id] = doc.data();
            });
            // modaSnapshot.forEach(doc => {
            //     productsData[doc.id] = doc.data();
            // });

            cartItemsContainer.innerHTML = '';
            let totalSeguro = 0;

            cart.forEach(itemInCart => {
                const product = productsData[itemInCart.id];
                if (product) {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('cart-item');
                    
                    const preco = typeof product.preco === 'number' ? product.preco : 0;
                    const quantidade = itemInCart.quantity;
                    const titulo = product.titulo || product.name; // Usa 'titulo' ou 'name'
                    const imagem = product.imagem_capa_url || product.imageUrl;

                    itemElement.innerHTML = `
                        <img src="${imagem || 'assets/img/LOGO CHAMA.png'}" alt="${titulo}" class="cart-item-image">
                        <div class="cart-item-details">
                            <h4>${titulo}</h4>
                            <p>Preço: R$ ${preco.toFixed(2).replace('.', ',')}</p>
                            <div class="cart-item-quantity">
                                <button class="decrease-quantity" data-id="${itemInCart.id}">-</button>
                                <span>${quantidade}</span>
                                <button class="increase-quantity" data-id="${itemInCart.id}">+</button>
                            </div>
                        </div>
                        <button class="remove-from-cart-btn" data-id="${itemInCart.id}">Remover</button>
                    `;
                    cartItemsContainer.appendChild(itemElement);
                    totalSeguro += preco * quantidade;
                }
            });

            cartTotalPriceSpan.textContent = `R$ ${totalSeguro.toFixed(2).replace('.', ',')}`;
            if (checkoutButton) checkoutButton.disabled = false;

        } catch (error) {
            console.error("Erro ao buscar dados dos produtos:", error);
            cartItemsContainer.innerHTML = '<p style="color: red;">Erro ao carregar os itens do carrinho. Tente novamente.</p>';
        }
    }

    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const productId = target.dataset.id;
        if (!productId) return;

        const cart = loadCart();
        const item = cart.find(i => i.id === productId);

        if (target.classList.contains('increase-quantity')) {
            if (item) updateQuantity(productId, item.quantity + 1);
        } else if (target.classList.contains('decrease-quantity')) {
            if (item) updateQuantity(productId, item.quantity - 1);
        } else if (target.classList.contains('remove-from-cart-btn')) {
            removeFromCart(productId);
        }
        
        renderCartPage();
    });
    
    // Lógica do Modal de Pagamento
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            renderCartPage().then(() => { // Garante que o total está atualizado
                const totalText = cartTotalPriceSpan.textContent;
                displayPaymentOptions(totalText);
                if(paymentModal) paymentModal.style.display = 'flex';
            });
        });
    }

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            if(paymentModal) paymentModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (event) => {
        if (event.target == paymentModal) {
            if(paymentModal) paymentModal.style.display = 'none';
        }
    });

    function displayPaymentOptions(totalText) {
        if (!paymentOptionsContent) return;
        
        // ... (código para montar a mensagem do WhatsApp e o HTML do modal) ...
        paymentOptionsContent.innerHTML = `
            <h3>Total a Pagar: ${totalText}</h3>
            <p>Por favor, escolha uma das opções de pagamento:</p>
            
            <div class="payment-option">
               <img src="assets/img/pix.png" alt="Pix Logo" style="width: 50px; height: 50px;">
                <div>
                    <h4>Pagamento via Pix</h4>
                    <p>Chave Pix (E-mail): <strong>${PIX_KEY}</strong></p>
                    <p>Após o pagamento, envie o comprovante para nosso WhatsApp.</p>
                    <a href="https://wa.me/${WHATSAPP_NUMBER}" target="_blank" class="button">Enviar Comprovante</a>
                </div>
            </div>
        `;
    }

    // Chama a função principal para renderizar o carrinho ao carregar a página
    renderCartPage();
});