$(document).ready(function() {
 $("#demo__title").hover(function() {
  $(this).toggleClass("demo__title-hover");
 });
 $("#btn__info").hover(function() {
  $("#demo__desc").toggleClass("demo__desc-upr");
 });
});
