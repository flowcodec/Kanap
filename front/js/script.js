//Requête HTTP de type GET vers l'api

fetch("http://localhost:3000/api/products")
  .then((response) => {return response.json();})
  .then((products) => {
    // Boucle For Of qui itère dans les products et les affichent sur la page avec innerHTML
    for (data of products) {
      document.getElementById(
        "items"
      ).innerHTML += `<a href="./product.html?id=${data._id}">
              <article>
               <img
                     src="${data.imageUrl}"
                     alt="${data.altTxt}"/>
                 <h3 class="productName"> ${data.name}</h3>
                 <p class="productDescription"> ${data.description}</p>
             </article>
         </a>`;
    }
  }) //utilisation ici du templèting/gabarie de litauraux
  .catch((error) => {
    alert(error);
  });
