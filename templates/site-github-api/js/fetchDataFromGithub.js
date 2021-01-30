// Fetch user data from Github REST Api
export default async function(user) {
    try {
        let response = await fetch(`https://api.github.com/users/${user}`)
        response = await response.json()
        return response
    } catch(e) {
        alert(e.message)
        console.error(e)
    }
}