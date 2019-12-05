$(document).ready(() => {
  $(".owl-carousel").owlCarousel({
    loop: true,
    autoplay: true,
    margin: 20,
    items: 3,
    responsive: {
      // breakpoint from 480 up
      0: {
        items: 1
      },
      // breakpoint from 480 up
      480: {
        items: 2
      },
      // breakpoint from 768 up
      768: {
        items: 3
      }
    }
  });
});
