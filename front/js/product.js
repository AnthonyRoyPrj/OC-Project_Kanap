import {
    getParamFromUrl,
    isValueValid,
    addProductToCart
} from "./function.js";

const productId = getParamFromUrl("id");
fetch(`http://localhost:3000/api/products/${productId}`)
    .then(function (result) {
        if (result.ok) {
            return result.json();
        } else {
            return Promise.reject(result);
        }
    })
    .then(function (product) {
        document.title = product.name;
        
        document
            .getElementsByClassName("item__img")[0]
            .innerHTML = `<img src="${product.imageUrl}" alt="${product.altTxt}">`;
        document
            .getElementById("title")
            .innerText = product.name;
        document
            .getElementById("price")
            .innerText = product.price;
        document
            .getElementById("description")
            .innerText = product.description;
        
        let htmlColors = "";
        for (let color of product.colors) {
            htmlColors += `<option value="${color}">${color}</option>`;
        }
        document
            .getElementById("colors")
            .innerHTML += htmlColors;
    })
    .catch(function (error) {
        alert("Une erreur s'est produite. Veuillez réessayer ultérieurement.")
        throw error;
    });

const inputQuantity = document.getElementById("quantity");
inputQuantity.addEventListener("change", function (e) {
    if (!isValueValid(e.target.value)) {
        inputQuantity.value = 0;
        alert("Veuillez renseigner un nombre entier entre 1 et 100");
    }
});

document
    .getElementById("addToCart")
    .addEventListener("click", function () {
        const productName = document.getElementById("title").innerText;
        const productColor = document.getElementById("colors").value;
        const productQuantity = document.getElementById("quantity").value;
        const orderProduct = {
            id: productId,
            color: productColor,
            quantity: parseInt(productQuantity)
        };     
        if (orderProduct.color === "" || orderProduct.quantity === 0) {
            alert("Veuillez renseignez une couleur et une quantité.");
        } else {
            addProductToCart(orderProduct)
            alert(`Le produit ${productName} ${orderProduct.color} x${orderProduct.quantity} a été ajouté au panier.`);
        }
    });