$(document).ready(() => {
  // activate choice block
  $("#number__button").on("click", () => {
    $(".number__items").toggleClass("number-active");
  });

  // Init temp`s
  let roomIndex = 0;
  let adultIndex = 0;
  let childIndex = 0;

  //Set temp`s for span`s
  $("#room__num").html(roomIndex);
  $("#adult__num").html(adultIndex);
  $("#child__num").html(childIndex);
  $("#number__text").html(roomIndex + " номер " + "- " + adultIndex + " взрослых " + "- " + childIndex + " детей");

  let changeNumberText = () => {
    $("#number__text").html(roomIndex + " номер " + "- " + adultIndex + " взрослых " + "- " + childIndex + " детей");
  };

  // room
  $("#room__plus").on("click", () => {
    roomIndex += 1;
    $("#room__num").html(roomIndex);
    changeNumberText();
  });
  $("#room__minus").on("click", () => {
    roomIndex -= 1;
    if (roomIndex < 0) roomIndex = 0;
    $("#room__num").html(roomIndex);
    changeNumberText();
  });

  //adult
  $("#adult__plus").on("click", () => {
    adultIndex += 1;
    $("#adult__num").html(adultIndex);
    changeNumberText();
  });
  $("#adult__minus").on("click", () => {
    adultIndex -= 1;
    if (adultIndex < 0) adultIndex = 0;
    $("#adult__num").html(adultIndex);
    changeNumberText();
  });

  //child
  $("#child__plus").on("click", () => {
    childIndex += 1;
    $("#child__num").html(childIndex);
    changeNumberText();
  });
  $("#child__minus").on("click", () => {
    childIndex -= 1;
    if (childIndex < 0) childIndex = 0;
    $("#child__num").html(childIndex);
    changeNumberText();
  });
});
