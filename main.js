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