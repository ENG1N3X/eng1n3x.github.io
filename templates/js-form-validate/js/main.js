// const form = document.querySelector("#form");
const name = document.querySelector("#name");
const email = document.querySelector("#email");
const nameError = document.querySelector("#nameError");
const emailError = document.querySelector("#emailError");
const submitButton = document.querySelector("#submitButton");

submitButton.addEventListener("click", (event) => {
 event.preventDefault();

 const emailsList = ["@yandex.ru", "@gmail.com", "@mail.ru"];

 const inputName = name.value;
 let inputEmail = email.value;

 if (!inputName) return (nameError.innerHTML = "Input name must be filled.");
 if (inputName.length > 21) return (nameError.innerHTML = "Input can't be more than 21 symbols.");

 if (!inputEmail) return (emailError.innerHTML = "Input email must be filled.");
 inputEmail = inputEmail.toLowerCase();
 let searchMailStatus = false;
 emailsList.forEach((email) => {
  const searchMail = inputEmail.search(email);
  if (searchMail != -1) {
   searchMailStatus = true;
  }
 });
 if (!searchMailStatus) return (emailError.innerHTML = "Input email valid only [@mail.ru, @yandex.ru, @gmail.com]");

 alert("Form valid!");
 nameError.innerHTML = emailError.innerHTML = "";
});
