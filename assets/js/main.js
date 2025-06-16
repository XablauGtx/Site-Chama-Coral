/*=============== main.js ===============*/
/* Lógica exclusiva da Página Inicial */

/*--------------- ANIMAÇÕES DE SCROLL ---------------*/

/* Adiciona sombra ao header quando a página é rolada para baixo */
function changeHeaderWhenScroll() {
  const header = document.querySelector("#header");
  if (!header) return; // Garante que não dê erro se o header não existir

  const navHeight = header.offsetHeight;

  if (window.scrollY >= navHeight) {
      header.classList.add("scroll");
  } else {
      header.classList.remove("scroll");
  }
}

/* Mostra o botão "Voltar ao Topo" quando a página é rolada para baixo */
function backToTop() {
  const backToTopButton = document.querySelector(".back-to-top");
  if (!backToTopButton) return;

  if (window.scrollY >= 560) {
      backToTopButton.classList.add("show");
  } else {
      backToTopButton.classList.remove("show");
  }
}

/* Adiciona os listeners de evento para o scroll */
window.addEventListener("scroll", function () {
  changeHeaderWhenScroll();
  backToTop();
});


/*--------------- SWIPER (CARROSSÉIS) ---------------*/

// Inicializa o carrossel de Partituras da página inicial
new Swiper('.partituras-swiper', {
  slidesPerView: 1, // Começa com 1 slide visível
  spaceBetween: 30,
  loop: true,
  breakpoints: {
      768: { slidesPerView: 2 }, // 2 slides para telas a partir de 768px
      1024: { slidesPerView: 3 }, // 3 slides para telas a partir de 1024px
      1200: { slidesPerView: 4 }  // 4 slides para telas a partir de 1200px
  },
});

// Inicializa o carrossel de Depoimentos (Testimonials)
new Swiper('.testimonials.swiper-container', {
  slidesPerView: 1,
  spaceBetween: 30,
  loop: true,
  pagination: {
      el: '.swiper-pagination',
      clickable: true,
  },
});


/*--------------- SCROLLREVEAL (ANIMAÇÃO DE ELEMENTOS) ---------------*/

// Verifica se a biblioteca ScrollReveal foi carregada
if (typeof ScrollReveal !== 'undefined') {
  const scrollReveal = ScrollReveal({
      origin: 'top',
      distance: '30px',
      duration: 700,
      reset: true
  });

  scrollReveal.reveal(
      `#home .image, #home .text,
       #services .container,
       #testimonials header, #testimonials .testimonials,
       #contact .text, #contact .links,
       footer .brand, footer .social`,
      { interval: 100 }
  );
}