let status = true;

document.querySelector("img").onclick = function () {
 if (status) {
  document.body.classList.add("bg-000");
  document.querySelector(".mainTitle").classList.add("color-fff");
  document.querySelector(".clickText").classList.add("color-fff");
  status = false;
 } else {
  document.body.classList.remove("bg-000");
  document.querySelector(".mainTitle").classList.remove("color-fff");
  document.querySelector(".clickText").classList.remove("color-fff");
  status = true;
 }
};
