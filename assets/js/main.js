// assets/js/main.js
function changeHeaderWhenScroll() {
    const header = document.querySelector("#header");
    if (!header) return;
    if (window.scrollY >= header.offsetHeight) {
        header.classList.add("scroll");
    } else {
        header.classList.remove("scroll");
    }
}

function backToTop() {
    const backToTopButton = document.querySelector(".back-to-top");
    if (!backToTopButton) return;
    if (window.scrollY >= 560) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
}

window.addEventListener("scroll", () => {
    changeHeaderWhenScroll();
    backToTop();
});

// Inicialização dos Carrosséis
new Swiper('.partituras-swiper', { slidesPerView: 1, spaceBetween: 30, loop: true, pagination: { el: '.swiper-pagination', clickable: true }, breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } } });
new Swiper('.testimonials.swiper-container', { slidesPerView: 1, spaceBetween: 30, loop: true, pagination: { el: '.swiper-pagination', clickable: true } });

// Animações de Scroll
if (typeof ScrollReveal !== 'undefined') {
    const scrollReveal = ScrollReveal({ origin: 'top', distance: '30px', duration: 700, reset: true });
    scrollReveal.reveal(`#home .image, #home .text, #services .container, #testimonials header, #testimonials .testimonials, #contact .text, #contact .links, footer .brand, footer .social`, { interval: 100 });
}

// --- Funções para Conteúdo Dinâmico ---
async function loadHomepageContent() {
    try {
        const configDoc = await db.collection('config').doc('homepage').get();
        if (configDoc.exists) {
            const destaquesIds = configDoc.data().destaques || [];
            if (destaquesIds.length > 0) {
                const produtosSnapshot = await db.collection('produtos').where(firebase.firestore.FieldPath.documentId(), 'in', destaquesIds).get();
                const partiturasDestaque = produtosSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
                renderPartiturasDestaque(partiturasDestaque);
            }
        }

        const depoimentosSnapshot = await db.collection('depoimentos').get();
        const depoimentos = depoimentosSnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        renderDepoimentos(depoimentos);
    } catch (error) {
        console.error("Erro ao carregar conteúdo da homepage:", error);
    }
}

function renderPartiturasDestaque(partituras) {
    const container = document.querySelector('.partituras-swiper .swiper-wrapper');
    if (!container) return;
    container.innerHTML = '';
    partituras.forEach(p => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide card';
        slide.innerHTML = `<a href="partituras.html" class="card-link"><i class="icon-partitura"></i><h3 class="title">${p.titulo}</h3><p>${p.descricao.substring(0, 50)}...</p></a>`;
        container.appendChild(slide);
    });
}

function renderDepoimentos(depoimentos) {
    const container = document.querySelector('.testimonials.swiper-container .swiper-wrapper');
    if (!container) return;
    container.innerHTML = '';
    depoimentos.forEach(d => {
        const slide = document.createElement('div');
        slide.className = 'testimonial swiper-slide';
        slide.innerHTML = `<blockquote><p><span>&ldquo;</span>${d.texto}</p><cite><img src="${d.imagem_url || 'assets/img/LOGO CHAMA.png'}" alt="Foto de ${d.autor}"> ${d.autor}</cite></blockquote>`;
        container.appendChild(slide);
    });
}

document.addEventListener('DOMContentLoaded', loadHomepageContent);