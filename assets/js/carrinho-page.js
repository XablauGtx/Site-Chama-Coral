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

// NEW: Referência para o modal e o botão de fechar
const paymentModal = document.getElementById('payment-modal');
const closeModalButton = document.getElementById('close-modal');
const paymentOptionsContent = document.getElementById('payment-options-content'); // NEW: Para exibir as opções de pagamento dinamicamente

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

// NOVO: Função para construir a mensagem detalhada do WhatsApp
function buildWhatsappOrderMessage(total) {
    let message = "Olá! Gostaria de fazer o seguinte pedido:\n\n";
    cart.forEach(item => {
        message += `- ${item.name} (x${item.quantity}) - R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });
    message += `\nTotal do Pedido: R$ ${total.toFixed(2).replace('.', ',')}`;
    return encodeURIComponent(message);
}


// NEW: Função para exibir as opções de pagamento no modal
function displayPaymentOptions(total) {
    const encodedOrderMessage = buildWhatsappOrderMessage(total); // Constrói a mensagem do pedido

    paymentOptionsContent.innerHTML = `
        <h3>Total a Pagar: R$ ${total.toFixed(2).replace('.', ',')}</h3>
        <p>Por favor, escolha uma das opções de pagamento:</p>
        
        <div class="payment-option">
           <img src="assets/img/pix.png" alt="Pix Logo">
            <div>
                <h4>Pagamento via Pix</h4>
                <p>Chave Pix: <strong>seuchamacoral@email.com</strong> (e-mail)</p>
                <p>Você pode copiar a chave Pix e fazer o pagamento diretamente no seu aplicativo bancário.</p>
                <div class="button-group">
                    <button class="copy-pix-btn" data-pix-key="seuchamacoral@email.com">Copiar Chave Pix</button>
                </div>
                <p>Após o pagamento, envie o comprovante para nosso WhatsApp.</p>
                <a href="https://wa.me/5541974023333?text=${encodedOrderMessage + encodeURIComponent('\n\n(Comprovante de pagamento via Pix)')}" target="_blank" class="whatsapp-link">Enviar Comprovante e Pedido (WhatsApp)</a>
            </div>
        </div>

        <div class="payment-option">
            <img src="assets/img/Boleto.png" alt="Boleto Bancário Logo">
            <div>
                <h4>Boleto Bancário</h4>
                <p>Para gerar o boleto, por favor, clique no botão abaixo.</p>
                <div class="button-group">
                    <button class="generate-boleto-btn" data-order-message="${encodedOrderMessage}">Gerar Boleto</button>
                </div>
                <p>O boleto pode levar até 3 dias úteis para ser compensado.</p>
                <p>Após a compensação, você receberá a confirmação por e-mail.</p>
            </div>
        </div>

        <div class="payment-option">
            <img src="assets/img/Cartao.png" alt="Cartão de Crédito Logo">
            <div>
                <h4>Cartão de Crédito/Débito</h4>
                <p>Para pagamentos com cartão, utilizaremos uma plataforma segura. Por favor, entre em contato via WhatsApp para receber o link de pagamento.</p>
                <a href="https://wa.me/5541974023333?text=${encodedOrderMessage + encodeURIComponent('\n\n(Solicitação de link de pagamento com Cartão)')}" target="_blank" class="whatsapp-link">Solicitar Link e Pedido (WhatsApp)</a>
            </div>
        </div>
    `;

    // Add event listeners for dynamic buttons inside the modal
    document.querySelectorAll('.copy-pix-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const pixKey = event.target.dataset.pixKey;
            navigator.clipboard.writeText(pixKey).then(() => {
                alert('Chave Pix copiada: ' + pixKey);
            }).catch(err => {
                console.error('Erro ao copiar a chave Pix: ', err);
                alert('Não foi possível copiar a chave Pix. Por favor, copie manualmente: ' + pixKey);
            });
        });
    });

    document.querySelectorAll('.generate-boleto-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const orderMessage = event.target.dataset.orderMessage; // Pega a mensagem do pedido
            alert('A geração de boleto é uma funcionalidade que requer integração com um gateway de pagamento. Por favor, entre em contato via WhatsApp para obter seu boleto.');
            // Redireciona para o WhatsApp com a mensagem do pedido
            window.open(`https://wa.me/5541974023333?text=${orderMessage + encodeURIComponent('\n\n(Solicitação de boleto)')}`, '_blank');
        });
    });
}


// MODIFIED: Event listener para finalizar compra
checkoutButton.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.');
        return;
    }

    // Calcula o total do pedido
    let totalOrderPrice = 0;
    cart.forEach(item => {
        totalOrderPrice += item.price * item.quantity;
    });

    // Exibe as opções de pagamento no modal
    displayPaymentOptions(totalOrderPrice);

    // Abre o modal
    paymentModal.style.display = 'flex'; // Usar 'flex' para centralização via CSS

    // Opcional: Limpar o carrinho após a exibição das opções, ou após a confirmação do pagamento
    // Para este exemplo, manteremos os itens no carrinho até que o usuário confirme o pagamento.
    // cart = [];
    // saveCart();
    // updateCartDisplay();
});

// NEW: Event listener para fechar o modal
closeModalButton.addEventListener('click', () => {
    paymentModal.style.display = 'none';
    // Opcional: Limpar o carrinho quando o modal é fechado, se a compra for "concluída"
    // ou se você quiser que o usuário recomece. No seu caso, o ideal é limpar APÓS o pagamento.
    // Aqui, mantemos os itens para que o usuário possa voltar e finalizar.
});

// NEW: Fechar o modal clicando fora dele
window.addEventListener('click', (event) => {
    if (event.target == paymentModal) {
        paymentModal.style.display = 'none';
    }
});


// Carrega o carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', loadCart);