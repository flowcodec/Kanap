//variable pour  récupérer les données du panier
let basket = JSON.parse(localStorage.getItem("basket"));

// Variable pour stocker les id de chaques articles présents dans le panier
let products = [];

// Variable qui récupère l'orderId envoyé comme réponse par le serveur lors de la requête POST
let orderId = "";

// Condition de vérification si le panier existe et ou est vide et modification texte
if (basket === null || basket.length === 0) {
 alert ("votre panier est vide")
}
// on récupère les données de l'API parapport au panier
async function getTotalProductPriceFromServer(productFromBasket) {
  const resp = await fetch(`http://localhost:3000/api/products/${productFromBasket.id}`)
  const productFromServer = await resp.json()
  const productTotalPrice = productFromBasket.quantity * productFromServer.price
  return {
    "productFromBasket": productFromBasket,
    "productFromServer": productFromServer,
    "sousTotalProductPrice": productTotalPrice
  }
}
//on insert les élément dans le DOM
function renderProductsInBasket(results) {
  results.forEach((result) => {
    const productFromBasket = result["productFromBasket"]
    const sousTotalProductPrice = result["sousTotalProductPrice"]
    const productFromServer = result["productFromServer"]

    document.querySelector(
      "#cart__items"
    ).innerHTML += `<article class="cart__item" data-id="${productFromBasket._id}" data-color="${productFromBasket.color}">
          <div class="cart__item__img">
              <img src="${productFromBasket.img}" alt="${productFromBasket.altTxt}">
          </div>
          <div class="cart__item__content">
              <div class="cart__item__content__description">
                  <h2>${productFromBasket.name}</h2>
                  <p>Couleur du produit: ${productFromBasket.color}</p>
                  <p>Prix unitaire: ${productFromServer.price}€</p>
                  <div id="PrixUnitaire" style="display:none">${productFromServer.price}</div>
          <div class="cart__item__content__settings">
              <div class="cart__item__content__settings__quantity">
                  <p id="quantité">Qté : ${productFromBasket.quantity} </p>
                  <p id="sousTotal">Prix total pour cet article: ${sousTotalProductPrice}€</p>
                  <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${productFromBasket.quantity}">
              </div>
              <div class="cart__item__content__settings__delete">
                  <p class="deleteItem">Supprimer</p>
              </div>
          </div>
          </div>
       </article>`;
  })
}
// calcul du total par produits
function computeTotal(results) {
  const reducer = (previousValue, currentValue) => previousValue + currentValue
  const listDeTotalPrices = results.map(result => result["sousTotalProductPrice"])
  const total = listDeTotalPrices.reduce(reducer)
  return total
}

//Injection de la somme totale dans le DOM
function renderTotal(total) {
  document.querySelector("#totalPrice").textContent = total;
}

async function main() {
  const results = await Promise.all(
    basket.map(
      (productFromBasket) => getTotalProductPriceFromServer(productFromBasket)
    )
  )
  renderProductsInBasket(results);
  const total = computeTotal(results);
  deleteProduct();
  reCalculate();
  renderTotal(total);
}

main()

// Fonction mise à jour du local storage products
let majLocalStorageProducts = () => {
  localStorage.setItem("basket", JSON.stringify(basket));
};

// Fonction récupération des quantités des articles et quantité totale

let addQuantFunction = () => {
  let found2 = basket.map((element) => element.quantity);

  const reducer = (previousValue, currentValue) => previousValue + currentValue;
  let quant = found2.reduce(reducer);
  return quant;
};

// Fonction récupération des prix des articles et somme totale

let addPriceFunction = () => {
  let found = basket.map((element) => element.totalPrice);

  const reducer = (previousValue, currentValue) => previousValue + currentValue;
  let somme = found.reduce(reducer);
  return somme;
};

function injectSommeQuant() {
  // Appel de la fonction addPriceFunction qui nous retourne la variable somme
  let sommeTotale = addPriceFunction();
 
  // Appel de la fonction addQuantFunction qui nous retourne la variable quant
  let quantTotale = addQuantFunction();

  //injection de la quantité des articles dans le DOM
  document.querySelector("#totalQuantity").textContent = quantTotale;
  document.querySelector("#totalPrice").textContent = sommeTotale;
  majLocalStorageProducts();
}

injectSommeQuant();

// Fonction affichant les changements et calculs des nouveaux prix et quantitées
function reCalculate(){
let itemQuantity = Array.from(document.querySelectorAll(".itemQuantity"));
let sousTotal = Array.from(document.querySelectorAll("#sousTotal"));
let screenQuantity = Array.from(document.querySelectorAll("#quantité"));
let PrixUnitaire = Array.from(document.querySelectorAll("#PrixUnitaire"));

itemQuantity.forEach(function (quantity, i) {
  quantity.addEventListener("change", (event) => {
    event.preventDefault();
    let newArticlePrice = quantity.value * PrixUnitaire[i].innerHTML
    screenQuantity[i].textContent = "Qté: " + quantity.value;
    basket[i].quantity = parseInt(quantity.value, 10);
    injectSommeQuant()
    sousTotal[i].textContent =
      "Prix total pour cet article: " + newArticlePrice + " €";
    basket[i].totalPrice = newArticlePrice;
    injectSommeQuant();
  });
});
}

/******************************** SUPPRESSION DES ARTICLES ****************************/

// Récupération de la node list des boutons supprimer et transformation en tableau avec Array.from
let supprimerSelection = Array.from(document.querySelectorAll(".deleteItem"));

// Nouveau tableau pour récupérer le tableau basket existant et contrôler les suppression
let tabControlDelete = [];

// Fonction de suppression des articles
function deleteProduct() {
    let supprimerSelection = Array.from(document.querySelectorAll(".deleteItem"));

  for (let i = 0; i < supprimerSelection.length; i++) {
    // Écoute d'évènements au click sur le tableau des boutons supprimer
    supprimerSelection[i].addEventListener("click", () => {
      // Suppression de l'article visuellement sur la page
      supprimerSelection[i].parentElement.style.display = "none";

      // Copie du tableau basket dans le tableau tabControlDelete
      tabControlDelete = basket;

      // Array.prototype.splice() supprime un élément à chaque index [i] du tableau écouté
      tabControlDelete.splice([i], 1);

      // Mise à jour du local storage
      basket = localStorage.setItem("basket", JSON.stringify(tabControlDelete));

      // Rafraîchissement de la page
      window.location.href = "cart.html";
    });
  }
}



/*************************************  LE FORMULAIRE ********************************/

// sélection du bouton Valider

const btnValidate = document.querySelector("#order");

// Écoute du bouton Valider sur le click pour pouvoir contrôler, valider et ennoyer le formulaire et les produits au back-end

btnValidate.addEventListener("click", (event) => {
  event.preventDefault();

  let contact = {
    firstName: document.querySelector("#firstName").value,
    lastName: document.querySelector("#lastName").value,
    address: document.querySelector("#address").value,
    city: document.querySelector("#city").value,
    email: document.querySelector("#email").value,
  };


  /******************************** GESTION DU FORMULAIRE ****************************/

  // Regex pour le contrôle des champs Prénom, Nom et Ville
  const regExPrenomNomVille = (value) => {
    return /^[A-Z][A-Za-z\é\è\ê\-]+$/.test(value);
  };

  // Regex pour le contrôle du champ Adresse
  const regExAdresse = (value) => {
    return /^[a-zA-Z0-9.,'-_ ]{5,50}[ ]{0,2}$/.test(value);
  };

  // Regex pour le contrôle du champ Email
  const regExEmail = (value) => {
    return /^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/.test(
      value
    );
  };

  // Fonctions de contrôle du champ Prénom:
  function firstNameControl() {
    const prenom = contact.firstName;
    let inputFirstName = document.querySelector("#firstName");
    if (regExPrenomNomVille(prenom)) {
      inputFirstName.style.backgroundColor = "green";

      document.querySelector("#firstNameErrorMsg").textContent = "";
      return true;
    } else {
      inputFirstName.style.backgroundColor = "#FF6F61";

      document.querySelector("#firstNameErrorMsg").textContent =
        "Champ Prénom de formulaire invalide, ex: Paul";
      return false;
    }
  }

  // Fonctions de contrôle du champ Nom:
  function lastNameControl() {
    const nom = contact.lastName;
    let inputLastName = document.querySelector("#lastName");
    if (regExPrenomNomVille(nom)) {
      inputLastName.style.backgroundColor = "green";

      document.querySelector("#lastNameErrorMsg").textContent = "";
      return true;
    } else {
      inputLastName.style.backgroundColor = "#FF6F61";

      document.querySelector("#lastNameErrorMsg").textContent =
        "Champ Nom de formulaire invalide, ex: Durand";
      return false;
    }
  }

  // Fonctions de contrôle du champ Adresse:
  function addressControl() {
    const adresse = contact.address;
    let inputAddress = document.querySelector("#address");
    if (regExAdresse(adresse)) {
      inputAddress.style.backgroundColor = "green";

      document.querySelector("#addressErrorMsg").textContent = "";
      return true;
    } else {
      inputAddress.style.backgroundColor = "#FF6F61";

      document.querySelector("#addressErrorMsg").textContent =
        "Champ Adresse de formulaire invalide, ex: 50 rue de la paix";
      return false;
    }
  }

  // Fonctions de contrôle du champ Ville:
  function cityControl() {
    const ville = contact.city;
    let inputCity = document.querySelector("#city");
    if (regExPrenomNomVille(ville)) {
      inputCity.style.backgroundColor = "green";

      document.querySelector("#cityErrorMsg").textContent = "";
      return true;
    } else {
      inputCity.style.backgroundColor = "#FF6F61";

      document.querySelector("#cityErrorMsg").textContent =
        "Champ Ville de formulaire invalide, ex: Paris";
      return false;
    }
  }

  // Fonctions de contrôle du champ Email:
  function mailControl() {
    const courriel = contact.email;
    let inputMail = document.querySelector("#email");
    if (regExEmail(courriel)) {
      inputMail.style.backgroundColor = "green";

      document.querySelector("#emailErrorMsg").textContent = "";
      return true;
    } else {
      inputMail.style.backgroundColor = "#FF6F61";

      document.querySelector("#emailErrorMsg").textContent =
        "Champ Email de formulaire invalide, ex: example@contact.fr";
      return false;
    }
  }

  // Contrôle validité formulaire avant de l'envoyer dans le local storage
  if (
    firstNameControl() &&
    lastNameControl() &&
    addressControl() &&
    cityControl() &&
    mailControl()
  ) {
    // Enregistrer le formulaire dans le local storage
    localStorage.setItem("contact", JSON.stringify(contact));

    document.querySelector("#order").value =
      "Articles et formulaire valide\n Passer commande !";
    sendToServer();
  } else {
    error("Veuillez bien remplir le formulaire");
  }

  /********************************FIN GESTION DU FORMULAIRE ****************************/

  /*******************************REQUÊTE DU SERVEUR ET POST DES DONNÉES ***************/
  function sendToServer() {
    const sendToServer = fetch("http://localhost:3000/api/products/order", {
      method: "POST",
      body: JSON.stringify({ contact, products }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      // Ensuite on stock la réponse de l'api (orderId)
      .then((response) => {
        return response.json();
      })
      .then((server) => {
        orderId = server.orderId;
      });
    // Si la variable orderId n'est pas une chaîne vide on redirige notre utilisateur sur la page confirmation avec la variable
    if (orderId != "") {
      location.href = "confirmation.html?id=" + orderId;
    }
  }
});

/******************************* FIN REQUÊTE DU SERVEUR ET POST DES DONNÉES ***************/

// Maintenir le contenu du localStorage dans le champs du formulaire

let dataFormulaire = JSON.parse(localStorage.getItem("contact"));

if (dataFormulaire) {
  document.querySelector("#firstName").value = dataFormulaire.firstName;
  document.querySelector("#lastName").value = dataFormulaire.lastName;
  document.querySelector("#address").value = dataFormulaire.address;
  document.querySelector("#city").value = dataFormulaire.city;
  document.querySelector("#email").value = dataFormulaire.email;
} else {
  alert("veillez complèter l'ensemble du formulaire");
}