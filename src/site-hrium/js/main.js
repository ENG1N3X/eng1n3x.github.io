$(document).ready(() => {
    $("#modal__half").on("click", () => {
        $(".modal__section").addClass("modal__display");
    });
    $(".modal__section").on("click", () => {
        $(".modal__section").removeClass("modal__display");
    });
});
