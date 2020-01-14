$(document).ready(() => {
  // room
  let roomIndex = 0;
  $("#room__num").html(roomIndex);
  $("#room__plus").on("click", () => {
    roomIndex += 1;
    $("#room__num").html(roomIndex);
  });
  $("#room__minus").on("click", () => {
    roomIndex -= 1;
    if (roomIndex < 0) roomIndex = 0;
    $("#room__num").html(roomIndex);
  });

  //adult
  let adultIndex = 0;
  $("#adult__num").html(adultIndex);
  $("#adult__plus").on("click", () => {
    adultIndex += 1;
    $("#adult__num").html(adultIndex);
  });
  $("#adult__minus").on("click", () => {
    adultIndex -= 1;
    if (adultIndex < 0) adultIndex = 0;
    $("#adult__num").html(adultIndex);
  });

  //child
  let childIndex = 0;
  $("#child__num").html(childIndex);
  $("#child__plus").on("click", () => {
    childIndex += 1;
    $("#child__num").html(childIndex);
  });
  $("#child__minus").on("click", () => {
    childIndex -= 1;
    if (childIndex < 0) childIndex = 0;
    $("#child__num").html(childIndex);
  });
});
