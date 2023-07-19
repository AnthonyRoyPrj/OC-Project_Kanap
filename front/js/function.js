export function getParamFromUrl(param) {
    // Gets the value of the wanted parameter in the URL
    return new URL(window.location.href).searchParams.get(param);
}

function setLocalStorage(localStorageObject) {
    // Saves cart in the Local Storage
    localStorage.setItem('cart', JSON.stringify(localStorageObject));
}

export function addProductToCart(orderProduct) {
    // Adds product to the cart
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

export function getProductsFromCart(productsFromApi) {
    // Gets an array of cart products with centralized data
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
    })
    return completeCart;
}

function getTotalQuantity(completeProductWithId) {
    // Provides the total quantity of cart products
    if (completeProductWithId !== []) {
        const quantityMap = completeProductWithId.map(product => product.quantity);
        return quantityMap.reduce((somme, valeur) => somme + valeur, 0);
    } else {
        return 0;
    }
}

function getTotalPrice(completeProductWithId) {
    // Provides the total quantity of cart products
    if (completeProductWithId !== []) {
        const priceMap = completeProductWithId.map(product => [product.quantity, product.price]);
        return priceMap.reduce((somme, valeur) => somme + (valeur[0] * valeur[1]), 0);
    } else {
        return 0;
    }
}

function setTotalQuantity(totalQuantity) {
    // Sets the total quantity of cart products
    document
        .getElementById("totalQuantity")
        .innerText = totalQuantity;
}

function setTotalPrice(totalPrice) {
    // Sets the total price of cart products
    document
        .getElementById("totalPrice")
        .innerText = totalPrice;
}

export function setTotalAmounts(completeProductWithId) {
    // Calculates and sets the total price and quantity of cart products
    const totalQuantity = getTotalQuantity(completeProductWithId);
    const totalPrice = getTotalPrice(completeProductWithId);
    setTotalQuantity(totalQuantity);
    setTotalPrice(totalPrice);
}

export function deleteConfirmation() {
    // Asks the user to confirm the removal of a product from the cart
    return window.confirm("Voulez-vous vraiment supprimer ce produit du panier ?");
}

function getProductInfo(product) {
    // Gets the data from the HTML product
    const elementWithProductInfo = product.closest(".cart__item");
    return {
        element: elementWithProductInfo,
        id: elementWithProductInfo.dataset.id,
        color: elementWithProductInfo.dataset.color
    };
}

function createLocalStorageObject(productObject) {
    // Creates a valid object to be saved in the cart
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

export function deleteProduct(productToDelete, apiValue) {
    // Removes a product from the cart
    const itemToDelete = getProductInfo(productToDelete);
    const newCartProducts = getProductsFromCart(apiValue).filter(product => product.id !== itemToDelete.id || product.color !== itemToDelete.color);
    const newLocalStorageCartProducts = createLocalStorageObject(newCartProducts);
    setLocalStorage(newLocalStorageCartProducts);
    document
        .getElementById("cart__items")
        .removeChild(itemToDelete.element);
    setTotalAmounts(newCartProducts);
}

export function changeProductQuantity(productToChangeQuantity, apiValue) {
    // Changes the quantity of a product in the cart
    const itemToChangeQuantity = getProductInfo(productToChangeQuantity);
    const newCartProducts = getProductsFromCart(apiValue)
    const itemWithChangedQuantity = newCartProducts.find(product => product.id === itemToChangeQuantity.id && product.color === itemToChangeQuantity.color);
    itemWithChangedQuantity.quantity = parseInt(productToChangeQuantity.value);
    const newLocalStorageCartProducts = createLocalStorageObject(newCartProducts);
    setLocalStorage(newLocalStorageCartProducts);
    setTotalAmounts(newCartProducts);
}

export function isValueZero(e) {
    // Checks if the value is 0
    return +e.target.value === 0
}

export function isValueValid(e) {
    // Checks if the value is an integer between 1 and 100
    if (isNaN(e.target.value) || (+e.target.value < 1 || +e.target.value > 100)) {
        return false
    }
    return true
}

export function inputValidation(value, name) {
    // Checks the values in the order form
    switch (name) {
        case "email":
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
        case "address":
            return /^[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+([\-\s\']?|(\,\s)?[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+)*$/.test(value);
        default:
            return /^[a-zA-ZáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+([\-\s\']?[\wáàâäãåçéèêëíìîïñóòôöõúùûüýÿæœÁÀÂÄÃÅÇÉÈÊËÍÌÎÏÑÓÒÔÖÕÚÙÛÜÝŸÆŒ]+)*$/.test(value);
    }
}