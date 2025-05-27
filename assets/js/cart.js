document.addEventListener('DOMContentLoaded', () => {
    const cartItemsDisplay = document.getElementById('cart-items-display');
    const cartTotalDisplay = document.getElementById('cart-total');
    const checkoutButton = document.getElementById('checkout-button');
    const globalCartCount = document.getElementById('cart-count'); // Para atualizar o contador no header

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function renderCartItems() {
        cartItemsDisplay.innerHTML = ''; // Limpa os itens existentes
        let total = 0;

        if (cart.length === 0) {
            cartItemsDisplay.innerHTML = '<p style="text-align: center; padding: 2rem;">Seu carrinho está vazio.</p>';
            cartTotalDisplay.textContent = 'R$ 0,00';
            checkoutButton.disabled = true;
            return;
        }

        checkoutButton.disabled = false; // Habilita o botão se houver itens

        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="assets/images/${item.id}.jpg" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Preço: R$ ${item.price.toFixed(2)}</p>
                    <div class="cart-item-quantity">
                        <button class="decrease-quantity" data-id="${item.id}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}">+</button>
                    </div>
                </div>
                <button class="remove-item-btn" data-id="${item.id}">Remover</button>
            `;
            cartItemsDisplay.appendChild(itemElement);
            total += item.price * item.quantity;
        });

        cartTotalDisplay.textContent = `R$ ${total.toFixed(2)}`;
        updateGlobalCartCount(); // Atualiza o contador no header
    }

    function updateGlobalCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        globalCartCount.textContent = totalItems;
        if (totalItems > 0) {
            globalCartCount.style.display = 'flex';
        } else {
            globalCartCount.style.display = 'none';
        }
    }

    // Lógica para aumentar/diminuir quantidade e remover
    cartItemsDisplay.addEventListener('click', (event) => {
        const target = event.target;
        const itemId = target.dataset.id;

        if (target.classList.contains('increase-quantity')) {
            const itemIndex = cart.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                cart[itemIndex].quantity += 1;
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems();
            }
        } else if (target.classList.contains('decrease-quantity')) {
            const itemIndex = cart.findIndex(item => item.id === itemId);
            if (itemIndex > -1) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    // Se a quantidade for 1 e diminuir, remove o item
                    cart = cart.filter(item => item.id !== itemId);
                }
                localStorage.setItem('cart', JSON.stringify(cart));
                renderCartItems();
            }
        } else if (target.classList.contains('remove-item-btn')) {
            cart = cart.filter(item => item.id !== itemId);
            localStorage.setItem('cart', JSON.stringify(cart));
            renderCartItems();
        }
    });

    // Evento para o botão Finalizar Compra
    checkoutButton.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Compra finalizada com sucesso! (Esta é uma simulação)');
            localStorage.removeItem('cart'); // Limpa o carrinho após a "compra"
            cart = []; // Esvazia o array do carrinho
            renderCartItems(); // Re-renderiza para mostrar o carrinho vazio
        } else {
            alert('Seu carrinho está vazio para finalizar a compra.');
        }
    });

    renderCartItems(); // Renderiza os itens do carrinho ao carregar a página
});