$(document).ready(() => {
  $("#review__slider").owlCarousel({
    loop: true,
    autoplay: false,
    nav: false,

    responsive: {
      0: {
        items: 1,
      },
    },
  });
});
