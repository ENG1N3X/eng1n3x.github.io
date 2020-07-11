const form = document.querySelector("#form");
const name = form.querySelector("#name");
const email = form.querySelector("#email");
const password = form.querySelector("#password");
const nameError = form.querySelector("#nameError");
const emailError = form.querySelector("#emailError");
const passwordError = form.querySelector("#passwordError");

form.addEventListener("submit", (event) => {
 event.preventDefault();

 const emailsList = ["@yandex.ru", "@gmail.com", "@mail.ru"];

 const inputName = name.value;
 const inputEmail = email.value.toLowerCase();
 const inputPassword = password.value;

 if (!inputName) return (nameError.innerHTML = "Input name must be filled.");
 if (inputName.length > 21) return (nameError.innerHTML = "Input can't be more than 21 symbols.");

 if (!inputEmail) return (emailError.innerHTML = "Input email must be filled.");
 let searchMailStatus = false;
 emailsList.forEach((email) => {
  const searchMail = inputEmail.search(email);
  if (searchMail != -1) {
   searchMailStatus = true;
  }
 });
 if (!searchMailStatus) return (emailError.innerHTML = "Input email valid only [@mail.ru, @yandex.ru, @gmail.com]");

 if (!inputPassword) return (passwordError.innerHTML = "Input password must be filled.");
 if (inputPassword.length > 21) return (passwordError.innerHTML = "Input can't be more than 21 symbols.");

 alert("Form valid!");
 nameError.innerHTML = emailError.innerHTML = passwordError.innerHTML = "";
});
