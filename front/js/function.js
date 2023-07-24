/**
 * Gets the value of the wanted parameter in the URL
 * @param { String } param 
 * @returns { String }
 */
export function getParamFromUrl(param) {
    return new URL(window.location.href).searchParams.get(param);
}

/**
 * Saves cart in the Local Storage
 * @param { Object.<id: String, color: String, quantity: Integer> } localStorageObject 
 */
function setLocalStorage(localStorageObject) {
    localStorage.setItem('cart', JSON.stringify(localStorageObject));
}

/**
 * Adds product to the cart
 * @param { Object.<id: String, color: String, quantity: Integer> } orderProduct 
 */
export function addProductToCart(orderProduct) {
    const cart = localStorage.getItem('cart');
    if (cart) {
        const parsedCart = JSON.parse(cart);
        const existingProduct = parsedCart.products.find(product => product.id === orderProduct.id && product.color === orderProduct.color);

        if (existingProduct) {
            existingProduct.quantity += orderProduct.quantity;
        } else {
            parsedCart.products.push(orderProduct);
        }            
        setLocalStorage(parsedCart);          
    } else {
        const newCart = {
            products: [orderProduct]
        };
        setLocalStorage(newCart);
    }
}

/**
 * Gets an array of cart products with centralized data
 * @param { Array.<Object> } productsFromApi 
 * @returns { Array.<Object> }
 */
export function getProductsFromCart(productsFromApi) {
    const cart = localStorage.getItem('cart');
    if (!cart) {
        return [];
    }

    const productsFromApiMap = {}
    for (let product of productsFromApi) {
        productsFromApiMap[product._id] = product
    }

    const productsFromCart = JSON.parse(cart).products
    const completeCart = productsFromCart.map((product) => {
        const matchingProductFromApi = productsFromApiMap[product.id]
        return {
            ...product,
            name: matchingProductFromApi.name,
            price: matchingProductFromApi.price,
            imageUrl: matchingProductFromApi.imageUrl,
            description: matchingProductFromApi.description,
            altTxt: matchingProductFromApi.altTxt
        };
    });
    return completeCart;
}

/**
 * Provides the total quantity of cart products
 * @param { Array.<Object> } completeProductWithId 
 * @returns { Integer }
 */
function getTotalQuantity(completeProductWithId) {
    if (completeProductWithId !== []) {
        const quantityMap = completeProductWithId.map(product => product.quantity);
        return quantityMap.reduce((somme, valeur) => somme + valeur, 0);
    } else {
        return 0;
    }
}

/**
 * Provides the total quantity of cart products
 * @param { Array.<Object> } completeProductWithId 
 * @returns { Integer }
 */
function getTotalPrice(completeProductWithId) {
    if (completeProductWithId !== []) {
        const priceMap = completeProductWithId.map(product => [product.quantity, product.price]);
        return priceMap.reduce((somme, valeur) => somme + (valeur[0] * valeur[1]), 0);
    } else {
        return 0;
    }
}

/**
 * Sets the total quantity of cart products
 * @param { Integer } totalQuantity 
 */
function setTotalQuantity(totalQuantity) {
    document
        .getElementById("totalQuantity")
        .innerText = totalQuantity;
}

/**
 * Sets the total price of cart products
 * @param { Integer } totalPrice 
 */
function setTotalPrice(totalPrice) {
    document
        .getElementById("totalPrice")
        .innerText = totalPrice;
}

/**
 * Calculates and sets the total price and quantity of cart products
 * @param { Array.<Object> } completeProductWithId 
 */
export function setTotalAmounts(completeProductWithId) {
    const totalQuantity = getTotalQuantity(completeProductWithId);
    const totalPrice = getTotalPrice(completeProductWithId);
    setTotalQuantity(totalQuantity);
    setTotalPrice(totalPrice);
}

/**
 * Asks the user to confirm the removal of a product from the cart
 * @returns { Boolean }
 */
export function deleteConfirmation() {
    return window.confirm("Voulez-vous vraiment supprimer ce produit du panier ?");
}

/**
 * Gets the data stored in the HTML element
 * @param { HTMLElement } product 
 * @returns { Object }
 */
function getProductInfo(product) {
    const elementWithProductInfo = product.closest(".cart__item");
    return {
        element: elementWithProductInfo,
        id: elementWithProductInfo.dataset.id,
        color: elementWithProductInfo.dataset.color
    };
}

/**
 * Creates a valid object to be saved in the cart
 * @param { Object } productObject 
 * @returns { Object }
 */
function createLocalStorageObject(productObject) {
    return {
        products: productObject.map(product => {
            return {
                id: product.id,
                color: product.color,
                quantity: product.quantity
            };
        })
    };
}

/**
 * Removes a product from the cart
 * @param { HTMLElement } productToDelete 
 * @param { Promise } apiValue 
 */
export function deleteProduct(productToDelete, apiValue) {
    const itemToDelete = getProductInfo(productToDelete);
    const newCartProducts = getProductsFromCart(apiValue).filter(product => product.id !== itemToDelete.id || product.color !== itemToDelete.color);
    const newLocalStorageCartProducts = createLocalStorageObject(newCartProducts);
    setLocalStorage(newLocalStorageCartProducts);
    document
        .getElementById("cart__items")
        .removeChild(itemToDelete.element);
    setTotalAmounts(newCartProducts);
}

/**
 * Changes the quantity of a product in the cart
 * @param { HTMLElement } productToChangeQuantity 
 * @param { Promise } apiValue 
 */
export function changeProductQuantity(productToChangeQuantity, apiValue) {
    const itemToChangeQuantity = getProductInfo(productToChangeQuantity);
    const newCartProducts = getProductsFromCart(apiValue)
    const itemWithChangedQuantity = newCartProducts.find(product => product.id === itemToChangeQuantity.id && product.color === itemToChangeQuantity.color);
    itemWithChangedQuantity.quantity = parseInt(productToChangeQuantity.value);
    const newLocalStorageCartProducts = createLocalStorageObject(newCartProducts);
    setLocalStorage(newLocalStorageCartProducts);
    setTotalAmounts(newCartProducts);
}

/**
 * Checks if the value is 0
 * @param { String } value 
 * @returns { Boolean }
 */
export function isValueZero(value) {
    return +value === 0
}

/**
 * Checks if the value is an integer between 1 and 100
 * @param { String } value 
 * @returns { Boolean }
 */
export function isValueValid(value) {
    if (isNaN(value) || (+value < 1 || +value > 100)) {
        return false
    }
    return true
}

/**
 * Checks the values of the associate input in the order form
 * @param { String } value 
 * @param { String } name 
 * @returns { Boolean }
 */
export function inputValidation(value, name) {
    switch (name) {
        case "email":
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        case "address":
            return /^[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+([\-\s\']?|(\,\s)?[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+)*$/.test(value);
        default:
            return /^[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+([\-\s\']?[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+)*$/.test(value);
    }
}