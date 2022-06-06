const login = document.getElementById("login");

login.addEventListener("submit", (event) => {
    event.preventDefault();
    new FormData(login);
});

login.addEventListener("formdata", (event) => {
    let data = event.formData;
    login.reset();
    signIn(data);

    localStorage.setItem("user-email", data.get("client-email"))

    if (data.get("remember-me") == true) {
        localStorage.setItem("remember-user", true);
    } else {
        localStorage.setItem("remember-user", false);
    }
});

const signIn = async (data) => {
    let headers = new Headers();
    headers.append("Content-Type", "application/x-www-form-urlencoded");
    
    let urlencoded = new URLSearchParams();
    urlencoded.append("client_id", data.get("client-email"));
    urlencoded.append("client_secret", data.get("client-passphrase"));
    urlencoded.append("grant_type", "client_credentials");
    
    let requestOptions = {
      method: 'POST',
      headers: headers,
      body: urlencoded,
      redirect: 'follow'
    };
    
    fetch("https://sandbox.acquiring.acqio.net/oauth2/token", requestOptions)
        .then(response => response.text())
        .then((result) => {
            console.log(result);
            localStorage.setItem("bearer-token", result);
        })
        .then(() => location.assign("./pages/purchase-info.html"))
        .catch((error) => {
            console.error(`Falha ao autenticar cliente. Erro de código: ${error.code} - ${error.message}`);
            alert("Erro ao autenticar usuário.");
        });
};