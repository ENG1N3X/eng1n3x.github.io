$(() => {
  const owlReview = $("#review__slider");
  const owlRepair = $("#repair__slider");

  owlReview.owlCarousel({
    loop: true,
    autoplay: true,
    center: true,
    nav: false,
    dots: true,
    responsive: {
      0: {
        items: 1,
      },
    },
  });

  owlRepair.owlCarousel({
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
