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
        for (let product of value) {
            productHtml +=
                `<a href="./product.html?id=${product._id}">
                    <article>
                        <img src="${product.imageUrl}" alt="${product.altTxt}">
                        <h3 class="productName">${product.name}</h3>
                        <p class="productDescription">${product.description}</p>
                    </article>
                </a>`;
        }
        document
            .getElementById("items")
            .innerHTML = productHtml;
    })
    .catch(function (error) {
        alert("Une erreur s'est produite. Veuillez réessayer ultérieurement.")
        throw error;
    });
