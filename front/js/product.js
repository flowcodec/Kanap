const PRODUCT_LIMIT = 100

// Sélection de l'ID colors
const colorIdSelected = document.querySelector("#colors");

// Sélection de l'ID quantity
const quantSelected = document.querySelector("#quantity");

// Sélection du bouton Ajouter au panier
const btnSend = document.querySelector("#addToCart");

const getProductId = () => {
  return new URL(location.href).searchParams.get("id");
};
const productId = getProductId();

fetch(`http://localhost:3000/api/products/${productId}`)
  .then((response) => {
    return response.json();
  })

  .then((product) => {
    productSelected(product);
    productRegistered(product);
  })
  .catch((error) => {
    alert(error);
  });

// Fonction qui récupère les données de la promesse .then(product) pour injecter les valeurs dans le fichier Html

let productSelected = (product) => {
  // Injection des données de l'objet sélectionner dans le Html
  document.querySelector("head > title").textContent = product.name;
  document.querySelector(
    ".item__img"
  ).innerHTML += `<img src="${product.imageUrl}" alt="${product.altTxt}">`;
  document.querySelector("#title").textContent += product.name;
  document.querySelector("#price").textContent += product.price;
  document.querySelector("#description").textContent += product.description;

  // Sélection de de la balise color-select dans le Html

  let colorId = document.querySelector("#colors");

  // Itération dans le tableau colors de l'objet et insertion des variables dans le Html

  for (color of product.colors) {
    let option = document.createElement("option");
    option.innerHTML = `${color}`;
    option.value = `${color}`;

    colorId.appendChild(option);
  }
};

// Fonction qui enregistre dans un objet les options de l'utilisateur au click sur le bouton ajouter au panier

let productRegistered = (product) => {

  // Écoute de l'évènement click sur le bouton ajouter
  btnSend.addEventListener("click", (event) => {
    event.preventDefault();

    //on vérifie que la couleur et le nombre ont bien été choisis 
    if (colorIdSelected.value == false) {
      confirm("Veuillez sélectionner une couleur");
    } else if (quantSelected.value == 0) {
      confirm("Veuillez sélectionner le nombre d'articles souhaités");
    } else {

      // Enregistrement des valeurs dans un objet optionProduct
      let optionProduct = {
        id: product._id,
        name: product.name,
        img: product.imageUrl,
        altTxt: product.altTxt,
        description: product.description,
        color: colorIdSelected.value,
        quantity: parseInt(quantSelected.value, 10)
      };
  
      /******************************* Le Local Storage ********************/

      //Variable contenant le local storage
      let localStorageProducts = JSON.parse(localStorage.getItem("basket"));

      // Si le local storage existe
      if (localStorageProducts) {
        // On rechercher avec la méthode find() si l'id et la couleur d'un article est déjà présent
        let item = localStorageProducts.find(
          (item) =>
            item.id == optionProduct.id && item.color == optionProduct.color
        );
        // Si oui on ajoute juste la nouvelle quantité et la mise à jour du prix à l'article
        if (item) {
          item.quantity = item.quantity + optionProduct.quantity;
          alert("Votre article va bien été ajouté au panier");
          if (item.quantity > PRODUCT_LIMIT) {
            alert("Rectification vous ne pouvez pas dépasser 100 articles du même produit")
          } else {
            localStorage.setItem("basket", JSON.stringify(localStorageProducts));
          }
          return;
        }
        // Si l'article n'est pas déjà dans le local storage alors on push le nouvel article sélectionner
        localStorageProducts.push(optionProduct);
        localStorage.setItem("basket", JSON.stringify(localStorageProducts));
      } else {
        if (optionProduct.quantity > PRODUCT_LIMIT) {
          alert("too much product")
        } else {
          //  Sinon création d'un tableau dans le lequel on push l'objet "optionProduct"
          let newTabLocalStorage = [];
          newTabLocalStorage.push(optionProduct);
          localStorage.setItem("basket", JSON.stringify(newTabLocalStorage));
          alert("Votre article va bien été ajouté au panier");
        }
        
      }
    }
  });
};