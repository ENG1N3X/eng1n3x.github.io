$(document).ready(() => {
  $("#menu__toggle").on("click", () => {
    $(".navigation__mobile").toggleClass("toggle__navigation-is-active");
  });
});
