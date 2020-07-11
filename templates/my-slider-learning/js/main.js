// Slider
const slider = document.querySelector(".slider");
const slides = slider.querySelectorAll(".slide");

// Slider Buttons
const buttons = document.querySelector(".sliderButtons");
const prev = buttons.querySelector("#prev");
const next = buttons.querySelector("#next");

// Slider Buttons Events
prev.addEventListener("click", prevSlide);
next.addEventListener("click", nextSlide);

// Slides prev/next functions
function prevSlide() {
 for (i = 0; i < slides.length; i++) {
  const result = slides[i].classList.contains("active");
  if (result) {
   slides[i].classList.remove("active");
   if (i === 0) {
    slides[slides.length - 1].classList.add("active");
    return;
   } else {
    slides[i - 1].classList.add("active");
   }
  }
 }
}

function nextSlide() {
 for (i = 0; i < slides.length; i++) {
  const result = slides[i].classList.contains("active");
  if (result) {
   slides[i].classList.remove("active");
   if (i != slides.length - 1) {
    slides[i + 1].classList.add("active");
    return;
   } else {
    slides[0].classList.add("active");
   }
  }
 }
}
