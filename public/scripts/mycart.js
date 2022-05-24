var productsInCart = document.getElementById("productsincart");

function getAllProducts() {
    console.log("working")
    var request = new XMLHttpRequest();
    request.open("get", "/cartproducts")
    request.send();

    request.addEventListener("load", function() {
        var products = JSON.parse(request.responseText);
        console.log(products);

        products.forEach(function(product) {
            showProductsToCart(product)
        })
    })
}
getAllProducts();

function showProductsToCart(product) {
    console.log(product);
    var productDiv = document.createElement("div");
    productsInCart.appendChild(productDiv);

    var productImg = document.createElement("img");
    var productName = document.createElement("h3");
    var productPrice = document.createElement("h5");

    productImg.setAttribute("height", "200");
    productImg.setAttribute("wifth", "200");
    productImg.setAttribute("src", product.productImg);
    productDiv.appendChild(productImg);

    productName.innerHTML = product.productName;
    productDiv.appendChild(productName);

    productPrice.innerHTML = product.productPrice;
    productDiv.appendChild(productPrice);

    var quantityDiv = document.createElement("div")
    productDiv.appendChild(quantityDiv);

    var quantityHtml = document.createElement("h3");
    var quantityCount = document.createElement("h3");
    quantityHtml.innerHTML = "Quantity : ";
    quantityCount.innerHTML = product.quantity;

    quantityDiv.appendChild(quantityHtml);
    quantityDiv.appendChild(quantityCount);

    var quantityPlus = document.createElement("button");
    quantityPlus.innerHTML = "Quantity ⬆ Plus";
    quantityDiv.appendChild(quantityPlus);

    var quantityMinus = document.createElement("button");
    quantityMinus.innerHTML = "Quantity ⬇ Minus";
    quantityDiv.appendChild(quantityMinus);

    var viewDescription = document.createElement("button");
    viewDescription.innerHTML = "Description";
    productDiv.appendChild(viewDescription);

    var removeProduct = document.createElement("button");
    removeProduct.innerHTML = "Remove";
    productDiv.appendChild(removeProduct);

    quantityPlus.addEventListener("click", function(event) {
        var quantityDisplay = event.target.parentNode.childNodes[1];
        var value = 1;

        quantityIncrementDB(product, quantityDisplay, value);
        //quantityChangeUI(quantityDisplay, value);
    })

    quantityMinus.addEventListener("click", function(event) {
        var quantityDisplay = event.target.parentNode.childNodes[1];
        var value = -1;

        if (product.quantity > 1) {
            quantityDecrementDB(product, quantityDisplay, value);
            // quantityChangeUI(quantityDisplay, value);     
        }
    })

    removeProduct.addEventListener("click", function(event) {
        var productDisplay = event.target.parentNode
        productDisplay.innerHTML = "";

        var productId = product.productId;
        removeFromDB(productId);
    })

    viewDescription.addEventListener("click", function(event) {
        viewProductDescription(product);
    })

}

function quantityIncrementDB(product, quantityDisplay, value) {
    var productId = product.productId;
    var quantity = ++product.quantity;

    var request = new XMLHttpRequest();
    request.open("post", "/quantityupdate");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({ id: productId, quantity: quantity }))

    request.addEventListener("load", function() {
        if (request.responseText == "200") {
            console.log("Quantity Incremented")
            quantityChangeUI(quantityDisplay, value)
        } else {
            alert("Product out of Stock");
        }
    })
}

function quantityDecrementDB(product, quantityDisplay, value) {
    var productId = product.productId;
    var quantity = --product.quantity;

    var request = new XMLHttpRequest();
    request.open("post", "/quantityupdate");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({ id: productId, quantity: quantity }))

    request.addEventListener("load", function() {

        console.log("Quantity Decremented")
        quantityChangeUI(quantityDisplay, value)

    })
}

function quantityChangeUI(quantityPanel, value) {
    quantityPanel.innerHTML = JSON.parse(quantityPanel.innerHTML) + value;
}

function removeFromDB(productId) {
    console.log(productId);
    var request = new XMLHttpRequest();
    request.open("post", "/removefromcart");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({ id: productId }));

    request.addEventListener("load", function() {
        console.log("Item Removed From Cart")
    })
}

function viewProductDescription(product) {
    var productId = product.productId;
    var request = new XMLHttpRequest();
    request.open("post", "/showdetails");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify({ id: productId }))

    request.addEventListener("load", function() {
        var description = request.responseText;
        document.body.innerHTML = description;
    })
}