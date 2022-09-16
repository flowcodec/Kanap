// Affichage du numéro de commande
const getProductId = () => {
    return new URL(location.href).searchParams.get("id");
  };

  const orderId = getProductId();

  const idConfirmation = document.querySelector("#orderId");

  idConfirmation.innerHTML = `<p><strong>${orderId}</strong>.`;
  

  //on vide le local storage

  localStorage.clear();
