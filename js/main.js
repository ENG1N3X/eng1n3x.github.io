// HTML Blocks
const error = document.querySelector(".error")
const loader = document.querySelector(".loader")

// Search user by login
const searchBar = document.querySelector(".search-bar")
const searchBarInput = searchBar.querySelector(".search-bar__input")
searchBarInput.addEventListener("change", function() {
  setUserData(this.value)
})

// Set HTML
async function setUserData(userDataFromSearchBar) {
  const card = document.querySelector(".card")
  const user = await fetchDataFromGithub(userDataFromSearchBar)
  if(user.message != "Not Found") {
    const cardImg = card.querySelector(".card__img")
    const cardName = card.querySelector(".card__name")
    const cardNickName = card.querySelector(".card__nickname")
    const cardBio = card.querySelector(".card__bio")
    const cardLink = card.querySelector(".card__link")

    cardImg.src = user.avatar_url
    cardImg.alt = user.login
    cardName.innerHTML = user.name
    cardNickName.innerHTML = user.login
    cardBio.innerHTML = user.bio
    cardLink.innerHTML = user.login
    cardLink.href = user.html_url
    show(card)
    hide(error)
    hide(loader)
  } else {
    hide(card)
    show(error)
    hide(loader)
  }
}

// Fetch user data from Github REST Api
async function fetchDataFromGithub(user) {
  try {
    show(loader)
    let response = await fetch(`https://api.github.com/users/${user}`)
    response = await response.json()
    return response
  } catch(e) {
    hide(loader)
    console.error(e)
  }
}

// Show/Hide user card
function show(blockToShow) {
  blockToShow.classList.remove("hide")
}
function hide(blockToHide) {
  blockToHide.classList.add("hide")
}