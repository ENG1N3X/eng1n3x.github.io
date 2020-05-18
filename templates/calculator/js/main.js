$(document).ready(() => {
  let number = "";

  $("#nine").on("click", () => {
    number += $("#nine").val();
    setParams();
  });
  $("#eight").on("click", () => {
    number += $("#eight").val();
    setParams();
  });
  $("#seven").on("click", () => {
    number += $("#seven").val();
    setParams();
  });
  $("#six").on("click", () => {
    number += $("#six").val();
    setParams();
  });
  $("#five").on("click", () => {
    number += $("#five").val();
    setParams();
  });
  $("#four").on("click", () => {
    number += $("#four").val();
    setParams();
  });
  $("#three").on("click", () => {
    number += $("#three").val();
    setParams();
  });
  $("#two").on("click", () => {
    number += $("#two").val();
    setParams();
  });
  $("#one").on("click", () => {
    number += $("#one").val();
    setParams();
  });
  $("#zero").on("click", () => {
    number += $("#zero").val();
    setParams();
  });

  // / * - +
  $("#multiply").on("click", () => {
    number += $("#multiply").val();
    setParams();
  });
  $("#share").on("click", () => {
    number += $("#share").val();
    setParams();
  });
  $("#plus").on("click", () => {
    number += $("#plus").val();
    setParams();
  });
  $("#minus").on("click", () => {
    number += $("#minus").val();
    setParams();
  });

  // =
  $("#equally").on("click", () => {
    number = parseFloat(eval(number));
    $("#input").val(number);
    $("#input2").val("empty");
  });

  // C
  $("#clear").on("click", () => {
    number = "";
    $("#input").val(number);
    $("#input2").val("empty");
  });

  setParams = () => {
    $("#input2").val(number);
  };
});
