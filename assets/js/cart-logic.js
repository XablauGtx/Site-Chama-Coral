// assets/js/cart-logic.js
const localStorageKey = 'chamaCoralCart';

// Carrega o carrinho do localStorage
const loadCart = () => {
    const storedCart = localStorage.getItem(localStorageKey);
    return storedCart ? JSON.parse(storedCart) : [];
};

// Salva o carrinho e atualiza o contador global
const saveCart = (cart) => {
    localStorage.setItem(localStorageKey, JSON.stringify(cart));
    updateGlobalCartCount(cart);
};

// Adiciona um item ao carrinho
const addToCart = (product) => {
    const cart = loadCart();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart(cart);
};

// Remove um item do carrinho
const removeFromCart = (productId) => {
    let cart = loadCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    return cart;
};

// Atualiza a quantidade de um item
const updateQuantity = (productId, newQuantity) => {
    let cart = loadCart();
    const itemToUpdate = cart.find(item => item.id === productId);

    if (itemToUpdate) {
        const quantity = parseInt(newQuantity, 10);
        if (quantity > 0) {
            itemToUpdate.quantity = quantity;
        } else {
            cart = cart.filter(item => item.id !== productId);
        }
    }
    saveCart(cart);
    return cart;
};

// Atualiza o contador de itens no ícone do cabeçalho
const updateGlobalCartCount = (cart) => {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
};
const clearCart = () => {
    // Pede confirmação ao usuário para evitar cliques acidentais
    if (confirm('Tem certeza de que deseja esvaziar seu carrinho?')) {
        const emptyCart = [];
        saveCart(emptyCart); // Salva um carrinho vazio, o que também atualiza o contador global
        return true; // Retorna true para indicar que a limpeza foi confirmada
    }
    return false; // Retorna false se o usuário cancelar
};
