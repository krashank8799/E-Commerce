var addToCartBUtton = document.querySelectorAll(".addtocart");

addToCartBUtton.forEach(function(product) {
    product.addEventListener("click", function(event) {
        var productId = event.target.getAttribute("id")
        var productImage = event.target.parentNode.childNodes[1].getAttribute("src");
        var productName = event.target.parentNode.childNodes[3].innerHTML;
        var productPrice = event.target.parentNode.childNodes[5].innerHTML;

        var productDetails = {
            productId: productId,
            productName: productName,
            productPrice: productPrice,
            productImage: productImage
        }
        addToCart(productDetails);
    })


})

function addToCart(productDetails) {
    var request = new XMLHttpRequest();

    request.open("POST", "/addtocart");
    request.setRequestHeader("Content-type", "application/json");
    request.send(JSON.stringify(productDetails))

    request.addEventListener("load", function() {
        if (request.responseText == "401") {
            alert("Please Login First");
            window.location.href = "/home";
        } else if (request.responseText == "200") {
            console.log("Added to cart successfully")
        } else if (request.responseText == "Already in Cart") {
            alert("Product Already In Cart");
        }
    })
}