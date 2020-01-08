$(document).ready(() => {
  $("#modal__amateur").on("click", () => {
    $(".modal__amateur").addClass("modal__display");
    $("body").addClass("body__overflow");
  });
  $("#modal__half").on("click", () => {
    $(".modal__half").addClass("modal__display");
    $("body").addClass("body__overflow");
  });
  $("#modal__master").on("click", () => {
    $(".modal__master").addClass("modal__display");
    $("body").addClass("body__overflow");
  });

  $(".modal__section").on("click", () => {
    $(".modal__section").removeClass("modal__display");
    $("body").removeClass("body__overflow");
  });
});
