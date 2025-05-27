const nav = document.querySelector("#header nav")
const toggle = document.querySelectorAll ("nav .toggle")

for(const element of toggle){
  element.addEventListener("click", function(){
    nav.classList.toggle("show")
  })
}
/*----Menu esconder quando clicar nos itens */
const links = document.querySelectorAll("nav ul li a")

for(const link of links){
link.addEventListener("click",function(){
  nav.classList.remove("show")
})
}

const header = document.querySelector("#header")
const navHeight = header.offsetHeight

window.addEventListener("scroll", function(){
  if(window.scrollY >= navHeight){
header.classList.add("scroll")
  } else{
    header.classList.remove("scroll")
  }
})

/*----CAROUSEL----- */

const swiper = new Swiper('.partituras-swiper', {
  slidesPerView: 3,
  spaceBetween: 30,
  loop: true,
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 2,
    },
    1024: {
      slidesPerView: 3,
    },
    1080: {
      slidesPerView: 4,
    },
    2000: {
      slidesPerView: 5,
    },
  },
});



/*----Button back to up----- */
const backToTopButton = document.querySelector(".back-to-top")
window.addEventListener('scroll',function(){
  if(window.scrollY >=560){
    backToTopButton.classList.add('show')
  } else{
    backToTopButton.classList.remove('show')
  }

})

// ====== LÓGICA DO CARRINHO DE COMPRAS ======

// Array para armazenar os itens do carrinho
let cart = [];

// Elementos do DOM do carrinho
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPriceSpan = document.getElementById('total-price');
const checkoutButton = document.getElementById('checkout-btn');

// Carrega o carrinho do localStorage ao iniciar
function loadCart() {
  const storedCart = localStorage.getItem('chamaCoralCart');
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCartDisplay(); // Atualiza a interface do carrinho com os itens carregados
  }
}

// Salva o carrinho no localStorage
function saveCart() {
  localStorage.setItem('chamaCoralCart', JSON.stringify(cart));
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
  updateCartDisplay();
  alert(`${productName} foi adicionado ao carrinho!`);
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
    cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    cartTotalPriceSpan.textContent = '0.00';
    return;
  }

  let total = 0;
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.innerHTML = `
      <span>${item.name} (R$ ${item.price.toFixed(2)})</span>
      <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-id="${item.id}">
      <button class="remove-from-cart-btn" data-id="${item.id}">Remover</button>
    `;
    cartItemsContainer.appendChild(itemElement);

    total += item.price * item.quantity;
  });

  cartTotalPriceSpan.textContent = total.toFixed(2);

  // Adiciona event listeners aos novos elementos criados
  document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
    button.addEventListener('click', (event) => {
      const productId = event.target.dataset.id;
      removeFromCart(productId);
    });
  });

  document.querySelectorAll('.item-quantity').forEach(input => {
    input.addEventListener('change', (event) => {
      const productId = event.target.dataset.id;
      const newQuantity = event.target.value;
      updateQuantity(productId, newQuantity);
    });
  });
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
});

// Carrega o carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', loadCart);