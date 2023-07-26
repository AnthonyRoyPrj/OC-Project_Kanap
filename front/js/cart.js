import {
    setTotalAmounts,
    inputValidation,
    getProductsFromCart,
    deleteConfirmation,
    deleteProduct,
    changeProductQuantity,
    isValueValid,
    isValueZero
} from "./function.js";

fetch("http://localhost:3000/api/products")
    .then(function (result) {
        if (result.ok) {
            return result.json();
        } else {
            return Promise.reject(result);
        }
    })
    .then(function (value) {
        let productHtml = "";
        const cartProducts = getProductsFromCart(value);
        for (let product of cartProducts) {
            productHtml +=
                `<article class="cart__item" data-id="${product.id}" data-color="${product.color}">
                    <div class="cart__item__img">
                        <img src="${product.imageUrl}" alt="${product.altTxt}">
                    </div>
                    <div class="cart__item__content">
                        <div class="cart__item__content__description">
                            <h2>${product.name}</h2>
                            <p>${product.color}</p>
                            <p>${product.price} €</p>
                        </div>
                        <div class="cart__item__content__settings">
                            <div class="cart__item__content__settings__quantity">
                                <p>Qté : </p>
                                <input type="number" class="itemQuantity" name="itemQuantity" min="1" max="100" value="${product.quantity}">
                            </div>
                            <div class="cart__item__content__settings__delete">
                                <p class="deleteItem">Supprimer</p>
                            </div>
                        </div>
                    </div>
                </article>`;
        }
        document
            .getElementById("cart__items")
            .innerHTML = productHtml;

        setTotalAmounts(cartProducts);

        const cartDeleteItems = document.getElementsByClassName("deleteItem");
        for (let i = 0; i < cartDeleteItems.length; i++) {
            const deleteItem = cartDeleteItems[i];
            deleteItem.addEventListener("click", function () {
                if (deleteConfirmation()) {
                    deleteProduct(deleteItem, value);
                }
            });
        }

        const cartQuantityItems = document.getElementsByClassName("itemQuantity");
        for (let i = 0; i < cartQuantityItems.length; i++) {
            const itemQuantity = cartQuantityItems[i];
            let previousItemQuantity = itemQuantity.value;
            itemQuantity.addEventListener("change", function (e) {
                if (isValueValid(e.target.value)) {
                    previousItemQuantity = itemQuantity.value;
                    changeProductQuantity(itemQuantity, value);
                } else if (isValueZero(e.target.value)) {
                    if (deleteConfirmation()) {
                        deleteProduct(itemQuantity, value)
                    } else {
                        itemQuantity.value = previousItemQuantity;
                    }
                } else {
                    itemQuantity.value = previousItemQuantity;
                    alert("Veuillez renseigner un nombre entier entre 1 et 100");
                }
            });
        }

        let contact = {};
        const submitButton = document.getElementById("order");
        submitButton.disabled = true;
        const inputList = document.querySelectorAll(".cart__order__form__question > input");
        for (let inputElement of inputList) {
            inputElement.addEventListener("change", function (event) {
                console.log(typeof event.target.value);
                if (inputValidation(event.target.value, inputElement.name)) {
                    contact[inputElement.name] = event.target.value;
                    document.getElementById(`${inputElement.name}ErrorMsg`).innerText = "";

                    if (Object.keys(contact).length === inputList.length) {
                        submitButton.disabled = false;
                    }
                } else {
                    submitButton.disabled = true;
                    delete contact[inputElement.name];
                    document.getElementById(`${inputElement.name}ErrorMsg`).innerText = "Veuillez renseigner des informations valides";
                }
            });
        }

        submitButton.addEventListener("click", function (event) {
            event.preventDefault();
            const productsToOrder = getProductsFromCart(value);
            if (!productsToOrder.length) {
                alert("Vous ne pouvez pas valider votre commande si votre panier est vide.");
            } else {
                const products = productsToOrder.map(product => product.id);
                fetch("http://localhost:3000/api/products/order", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ contact, products })
                })
                .then(function (result) {
                    if (result.ok) {
                         return result.json();
                    } else {
                        return Promise.reject(result);
                    }
                })
                .then(function (value) {
                    localStorage.clear();
                    window.location.href = `./confirmation.html?id=${value.orderId}`
                });
            }
        });

    })
    .catch(function (error) {
        alert("Une erreur s'est produite. Veuillez réessayer ultérieurement.")
        throw error;
    });