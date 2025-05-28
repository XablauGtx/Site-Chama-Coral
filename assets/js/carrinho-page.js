// assets/js/carrinho-page.js

const nav = document.querySelector("#header nav");
const toggle = document.querySelectorAll("nav .toggle");

for (const element of toggle) {
    element.addEventListener("click", function() {
        nav.classList.toggle("show");
    });
}
/*----Menu esconder quando clicar nos itens */
const links = document.querySelectorAll("nav ul li a");

for (const link of links) {
    link.addEventListener("click", function() {
        nav.classList.remove("show");
    });
}

const header = document.querySelector("#header");
const navHeight = header.offsetHeight;

window.addEventListener("scroll", function() {
    if (window.scrollY >= navHeight) {
        header.classList.add("scroll");
    } else {
        header.classList.remove("scroll");
    }
});

// ====== LÓGICA DO CARRINHO DE COMPRAS PARA CARRINHO.HTML ======

// Variáveis globais para o carrinho e elementos do DOM
let cart = [];

// Elementos do DOM do carrinho na página carrinho.html
const cartItemsContainer = document.getElementById('cart-items-display');
const cartTotalPriceSpan = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');

// Chave para o localStorage (deve ser a mesma usada em partituras-cart.js)
const localStorageKey = 'chamaCoralCart';

// Função para carregar o carrinho do localStorage
function loadCart() {
    const storedCart = localStorage.getItem(localStorageKey);
    if (storedCart) {
        cart = JSON.parse(storedCart);
    }
    updateCartDisplay(); // Atualiza a interface do carrinho com os itens carregados
}

// Função para salvar o carrinho no localStorage
function saveCart() {
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
}

// Remove um item do carrinho
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartDisplay();
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
}

// Atualiza a exibição do carrinho no HTML
function updateCartDisplay() {
    cartItemsContainer.innerHTML = ''; // Limpa o conteúdo atual

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Seu carrinho está vazio.</p>';
        cartTotalPriceSpan.textContent = '0,00';
        checkoutButton.disabled = true; // Desabilita o botão se o carrinho estiver vazio
        return;
    }

    checkoutButton.disabled = false; // Habilita o botão se houver itens

    let total = 0;
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('cart-item');
        
        itemElement.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>Preço: R$ ${item.price.toFixed(2).replace('.', ',')}</p>
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

    cartTotalPriceSpan.textContent = total.toFixed(2).replace('.', ',');

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
}

// Event listener para finalizar compra (WhatsApp)
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
        return;
    }

    let whatsappMessage = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    let totalOrderPrice = 0;

    cart.forEach(item => {
        whatsappMessage += `- ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        totalOrderPrice += item.price * item.quantity;
    });

    whatsappMessage += `\nTotal do Pedido: R$ ${totalOrderPrice.toFixed(2).replace('.', ',')}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/5541974023333?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    alert('Seu pedido foi enviado para o WhatsApp! Entraremos em contato em breve.');

    cart = [];
    saveCart();
    updateCartDisplay();
});

// Carrega o carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', loadCart);