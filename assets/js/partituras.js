// ====== LÓGICA DO CARRINHO DE COMPRAS PARA PARTITURAS.HTML ======

// Variáveis globais para o carrinho e elementos do DOM
let cart = [];

// Elementos do DOM do carrinho (ajustados para os IDs do HTML atualizado)
const cartItemsContainer = document.getElementById('cart-items-display');
const cartTotalPriceSpan = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');
const cartIcon = document.getElementById('cart-icon');
const cartCountSpan = document.getElementById('cart-count'); // Contador no ícone do cabeçalho
const cartSection = document.getElementById('cart'); // A seção inteira do carrinho

// Chave para o localStorage
const localStorageKey = 'chamaCoralCart';

// Função para carregar o carrinho do localStorage
function loadCart() {
    const storedCart = localStorage.getItem(localStorageKey);
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
    updateCartDisplay(); // Atualiza a interface do carrinho e o contador do ícone
}

// Função para salvar o carrinho no localStorage
function saveCart() {
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
}

// Função para atualizar o contador de itens no ícone do carrinho
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountSpan.textContent = totalItems;
    if (totalItems > 0) {
        cartCountSpan.style.display = 'flex'; // Mostra o contador se houver itens
    } else {
        cartCountSpan.style.display = 'none'; // Esconde o contador se não houver itens
    }
}

// Adiciona um item ao carrinho
function addToCart(productId, productName, productPrice) {
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: parseFloat(productPrice),
            quantity: 1
        });
    }
    saveCart();
    updateCartDisplay(); // Atualiza a interface completa do carrinho
    updateCartCount(); // Garante que o contador do ícone também seja atualizado
    alert(`${productName} foi adicionado ao carrinho!`);
}

// Remove um item do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

// Atualiza a quantidade de um item no carrinho
function updateQuantity(productId, newQuantity) {
    const itemToUpdate = cart.find(item => item.id === productId);
    if (itemToUpdate) {
        const quantity = parseInt(newQuantity);
        if (quantity > 0) {
            itemToUpdate.quantity = quantity;
        } else {
            removeFromCart(productId); // Remove se a quantidade for 0 ou menos
        }
    }
    saveCart();
    updateCartDisplay();
    updateCartCount();
}

// Atualiza a exibição do carrinho no HTML
function updateCartDisplay() {
    cartItemsContainer.innerHTML = ''; // Limpa o conteúdo atual

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Seu carrinho está vazio.</p>';
        cartTotalPriceSpan.textContent = '0.00';
        checkoutButton.disabled = true; // Desabilita o botão se o carrinho estiver vazio
        return;
    }

    checkoutButton.disabled = false; // Habilita o botão se houver itens

    let total = 0;
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        // Usamos o item.id para construir o caminho da imagem, assumindo que as imagens são nomeadas como o ID.
        // Ex: id "nao-ha-outro-igual" -> imagem "assets/images/nao-ha-outro-igual.jpg"
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
            <button class="remove-from-cart-btn" data-id="${item.id}">Remover</button>
        `;
        cartItemsContainer.appendChild(itemElement);

        total += item.price * item.quantity;
    });

    cartTotalPriceSpan.textContent = total.toFixed(2);

    // Adiciona event listeners aos botões de quantidade e remover
    // Usamos delegation para evitar recriar listeners a cada renderização
    cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            removeFromCart(productId);
        });
    });

    cartItemsContainer.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            const currentItem = cart.find(item => item.id === productId);
            if (currentItem && currentItem.quantity > 1) {
                updateQuantity(productId, currentItem.quantity - 1);
            } else if (currentItem && currentItem.quantity === 1) {
                removeFromCart(productId); // Remove se for 1 e diminuir
            }
        });
    });

    cartItemsContainer.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.dataset.id;
            const currentItem = cart.find(item => item.id === productId);
            if (currentItem) {
                updateQuantity(productId, currentItem.quantity + 1);
            }
        });
    });

    // Se a seção do carrinho estiver visível, scrolla para ela
    if (cartSection.classList.contains('active')) {
        cartSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Event listener para adicionar item ao carrinho (delegation para botões dinâmicos)
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('add-to-cart-btn')) {
        const productId = event.target.dataset.id;
        const productName = event.target.dataset.name;
        const productPrice = event.target.dataset.price;
        addToCart(productId, productName, productPrice);
    }
});

// Event listener para mostrar/esconder a seção do carrinho
cartIcon.addEventListener('click', (event) => {
    event.preventDefault(); // Evita o comportamento padrão do link
    cartSection.classList.toggle('active'); // Alterna uma classe 'active'
    if (cartSection.classList.contains('active')) {
        // Se a seção está ativa, rolamos para ela
        cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// Event listener para finalizar compra (WhatsApp)
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
        return;
    }

    let whatsappMessage = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    let totalOrderPrice = 0;

    cart.forEach(item => {
        whatsappMessage += `- ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
        totalOrderPrice += item.price * item.quantity;
    });

    whatsappMessage += `\nTotal do Pedido: R$ ${totalOrderPrice.toFixed(2)}`;

    // Codifica a mensagem para a URL do WhatsApp
    const encodedMessage = encodeURIComponent(whatsappMessage);
    // Substitua '5541974023333' pelo seu número de WhatsApp com código do país (sem + ou espaços)
    const whatsappUrl = `https://wa.me/5541974023333?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank'); // Abre em nova aba
    alert('Seu pedido foi enviado para o WhatsApp! Entraremos em contato em breve.');

    // Opcional: Esvaziar o carrinho após a finalização da compra
    cart = [];
    saveCart();
    updateCartDisplay();
    updateCartCount(); // Atualiza o contador após esvaziar
});

// Carrega o carrinho e inicializa o contador ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    updateCartCount(); // Garante que o contador esteja correto desde o início
});