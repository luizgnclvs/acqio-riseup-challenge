const purchaseInfo = document.getElementById("info");

purchaseInfo.addEventListener("submit", (event) => {
    event.preventDefault();
    new FormData(purchaseInfo);
});

purchaseInfo.addEventListener("formdata", (event) => {
    let data = event.formData;
    purchaseInfo.reset();
    authorizeBuy(data);
});

const authorizeBuy = async (data) => {
    let headers = new Headers();
    headers.append("Authorization", "Bearer Acqio Access Token");
    headers.append("Content-Type", "application/json");    

    
    console.log(`DateTime: ${purchaseTime}`);

    let purchaseObject = {
        datetime: purchaseTime,
        referenceId: "80df9d08-fced-4b94-ba72-3b83bee5cba2", // ? gerado aleatoriamente
        installments: data.get("installments"),
        amountE2: (data.get("amount") * 100),
        cardNumber: data.get("cardnumber"),
        cardholderName: data.get("cardholder"),
        cardExpirationDateYymm: data.get("expiration-year") + data.get("expiration-month"),
        cvv: data.get("cvv"),
        autoCapture: data.get("autocapture"),
        purchaseInfo: {
            billTo: { 
                address1: data.get("address"),
                administrativeArea: data.get("state"),
                countryCode: data.get("country"),
                city: data.get("city"),
                firstName: data.get("first-name"),
                lastName: data.get("last-name"),
                phoneNumber: data.get("phone"),
                postalCode: data.get("cep")
            },
            shippingTo: {
                address1: data.get("address"),
                address2: data.get("address-2"),
                administrativeArea: data.get("state"),
                countryCode: data.get("country"),
                city: data.get("city"),
                firstName: data.get("first-name"),
                lastName: data.get("last-name"),
                phoneNumber: data.get("phone"),
                postalCode: data.get("cep")
            },
            email: localStorage.getItem("user-email"),
            ipAddress: "127.0.0.2", // * usar alguma API que retorne o Public IP do cliente
            fingerprintSessionId: "AAAAAAAA-0000-BBBB-1111-CCC3334D-FFFFFFFF-9999",
            personalIdentification: data.get("personalId")
        }
    };

    if (data.get("installments") == 1) {
        delete purchaseObject["installments"];
    }

    if (data.get("same-address") !== "yes") { // * altera os dados caso a opcão de "usar o mesmo endereço de envio para cobrança" esteja desmarcada"
        purchaseObject.purchaseInfo.billTo.address1 = data.get("billing-address");
        purchaseObject.purchaseInfo.billTo.administrativeArea = data.get("billing-state");
        purchaseObject.purchaseInfo.billTo.countryCode = data.get("billing-country");
        purchaseObject.purchaseInfo.billTo.city = data.get("billing-city");
        purchaseObject.purchaseInfo.billTo.postalCode = data.get("billing-cep");
    }

    let raw = JSON.stringify(purchaseObject);

    let requestOptions = {
        method: 'POST',
        headers: headers,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://sandbox.acquiring.acqio.net/api/authorize", requestOptions)
        .then(response => response.text())
        .then((result) => {
            console.log(result);
            alert("Compra efetuada com sucesso")
        })
        .catch((error) => {
            console.error(`Falha ao efetuar compra. Erro de código: ${error.code} - ${error.message}`);
            alert("Erro ao efetuar compra.");
        });
};


// * funções que mexem com o style da página
const amount = document.getElementById("amount");
const showAmount = document.getElementById("show-amount");

const randomAmount = () => { // * simula a soma dos preços dos itens selecionados pelo cliente
    let r = ((Math.random() * 1000) + 1).toFixed(2);
    amount.value = r;
    showAmount.innerHTML = r;

    document.querySelectorAll(".installment").forEach((element) => {
        let value = element.id.split("-")[1];
        element.innerHTML = `${value}× R$${(amount.value / value).toFixed(2)}`;  
    });
};

const sameAddress = document.getElementById("same-address");
const billingAddress = document.getElementById("billing-address-box");
const btNext = document.getElementById("next");
const btPrevious = document.getElementById("previous");

sameAddress.onchange = () => {
    if (sameAddress.checked === true) {
        billingAddress.style.display = "none";
    } else {
        billingAddress.style.display = "inline-block";
    }
};

btNext.onclick = () => {
    document.getElementById("user-info").style.display = "none";
    document.getElementById("card-info").style.display = "block";
};

btPrevious.onclick = () => {
    document.getElementById("card-info").style.display = "none";
    document.getElementById("user-info").style.display = "block";
};

randomAmount();

document.getElementById("purchase-email").value = localStorage.getItem("user-email");