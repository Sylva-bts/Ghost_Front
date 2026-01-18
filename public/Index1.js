document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("", {
        method: "POST",
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();

    if (response.ok) {
        document.getElementById("welcome").innerText = "Bienvenue, " + data.user.username + "!";
    }
});
