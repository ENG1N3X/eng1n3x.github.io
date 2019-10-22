$(document).ready(function() {
 $(".owl-carousel").owlCarousel({
  autoplay: true,
  autoplayTimeout: 3000,
  loop: true,
  dotsEach: true,
  margin: 60,
  responsive: {
   0: {
    items: 1
   },
   576: {
    items: 1
   },
   768: {
    items: 2
   },
   1024: {
    items: 3
   },
   1240: {
    items: 4
   }
  }
 });

 var owl = $(".owl-carousel");
 $(".slider__next").on("click", function() {
  owl.trigger("next.owl.carousel");
 });
 $(".slider__prev").on("click", function() {
  owl.trigger("prev.owl.carousel");
 });
});
