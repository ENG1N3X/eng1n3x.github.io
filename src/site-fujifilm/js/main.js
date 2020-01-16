$(document).ready(() => {
  $("#review__slider").owlCarousel({
    loop: true,
    autoplay: true,

    responsive: {
      0: {
        items: 1,
      },
    },
  });

  $("#repair__slider").owlCarousel({
    items: 1,
    loop: false,
    autoplay: false,
    video: true,
    nav: true,

    responsive: {
      0: {
        items: 1,
      },
    },
  });
});
