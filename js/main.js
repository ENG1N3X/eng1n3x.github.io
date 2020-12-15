import fetchDataFromGithub from "./fetchDataFromGithub.js"
import { show, hide } from "./visibilityState.js"

// HTML Blocks
const error = document.querySelector(".error")
const loader = document.querySelector(".loader")
const cardWrapper = document.querySelector("#card-wrapper")

// Search user by login
const searchBar = document.querySelector(".search-bar")
const searchBarInput = searchBar.querySelector(".search-bar__input")
searchBarInput.addEventListener("change", function() {
  setUserData(this.value)
})

// Set HTML
async function setUserData(login) {
  hide(error)
  show(loader)
  const data = await fetchDataFromGithub(login)
  if(data) {
    hide(loader)
    if(data.message != "Not Found") {
      hide(error)

      let cardHTML = '<div class="card">'
        cardHTML += `<img class="card__img" src="${data.avatar_url}" alt="${data.login}">`
        cardHTML += '<div class="card__content">'
          if(data.name) {
            cardHTML += `<h4 class="card__name">${data.name}</h4>`
          }
          cardHTML += `<span class="card__nickname">${data.login}</span>`
          if(data.bio) {
            cardHTML += `<p class="card__bio">${data.bio}</p>`
          }
          cardHTML += `<a class="card__link" href="${data.html_url}" target="_blank">Github: ${data.login}</a>`
        cardHTML += '</div>'
      cardHTML += '</div>'
      cardWrapper.innerHTML = cardHTML
    } else {
      cardWrapper.innerHTML = ""
      show(error, data.message)
    }
  }
}