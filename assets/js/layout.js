// assets/js/layout.js
document.addEventListener('DOMContentLoaded', () => {
    const headerHTML = `
        <nav class="container showtoggle">
            <a class="logo" href="index.html"><img src="assets/img/LOGO CHAMA.png" alt="Logo Chama"></a>
            <div class="menu">
                <ul class="grid">
                    <li><a class="title" href="index.html">Inicio</a></li>
                    <li><a class="title" href="partituras.html">Partituras</a></li>
                    <li><a class="title" href="chamamode.html">Moda Chama</a></li>
                    <li><a class="title" href="carrinho.html">Carrinho</a></li>
                    <li><a class="title" href="ad.html">AD</a></li>
                </ul>
            </div>
            <div class="menu-e-carrinho">
                <a href="carrinho.html" id="cart-icon" class="cart-icon">
                    <i class="icon-cart"></i> 
                    <span id="cart-count" class="cart-count">0</span> 
                </a>
                <div class="toggle icon-menu"></div>
                <div class="toggle icon-close"></div>
            </div>
        </nav>
    `;

    const footerHTML = `
    <div class="container grid">
        <div class="brand">
        </div>
        <div class="social">
            <a href="https://www.instagram.com/chamacoral/" target="_blank"><i class="icon-instagram"></i></a>
            <a href="https://open.spotify.com/intl-pt/artist/0TDC1ivOZb4LiNYWYirJ2B?si=uk7sYX4FTaeIdQwNx-JwvA" target="_blank"><i class="icon-icons8-spotify-500"></i></a>
            <a href="https://www.youtube.com/@chamacoral" target="_blank"><i class="icon-youtube"></i></a>
        </div>
    </div>
    `;

    const headerElement = document.getElementById('header');
    const footerElement = document.querySelector('footer.section');

    // Insere o Header e adiciona sua lógica
    if (headerElement) {
        headerElement.innerHTML = headerHTML;
    
        const nav = headerElement.querySelector("nav");
        const toggle = headerElement.querySelectorAll("nav .toggle");
        for (const element of toggle) {
            element.addEventListener("click", function () {
                nav.classList.toggle("show");
            });
        }
    
        // Chama a atualização do carrinho depois que o header foi criado
        // Verifica se a função loadCart existe antes de chamar
        if (typeof loadCart !== 'undefined') {
            updateGlobalCartCount(loadCart()); 
        }
    }

    // ==========================================================
    // ESTA É A PARTE QUE ESTAVA FALTANDO
    // Insere o Footer na página
    if (footerElement) {
        footerElement.innerHTML = footerHTML;
    }
    // ==========================================================

});