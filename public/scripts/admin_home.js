var productDiv = document.getElementById("showproducts")

function getAllProductsFromDB() {
    var request = new XMLHttpRequest();
    request.open("GET", "/admin/addproduct");
    request.send();

    request.addEventListener("load", function() {

        var products = JSON.parse(request.responseText);
        console.log("working")
            //console.log(products);

        products.forEach(function(product) {

            showProductsToPanel(product);
        })
    })
}
getAllProductsFromDB();

function showProductsToPanel(product) {
    console.log(product);
    var div = document.createElement("div");
    div.setAttribute("id", product._id);
    productDiv.appendChild(div);

    var productImg = document.createElement("img");
    productImg.setAttribute("src", product.filename);
    productImg.setAttribute("width", "200");
    productImg.setAttribute("height", "200");
    div.appendChild(productImg);

    var nameLabel = document.createElement("label");
    nameLabel.innerHTML = "Product Name ";
    div.appendChild(nameLabel);

    var nameInput = document.createElement("input");
    nameInput.value = product.name;
    nameLabel.appendChild(nameInput);

    var descriptionLabel = document.createElement("label");
    descriptionLabel.innerHTML = "Product Description ";
    div.appendChild(descriptionLabel);

    var descriptionInput = document.createElement("input");
    descriptionInput.value = product.description;
    descriptionLabel.appendChild(descriptionInput);

    var priceLabel = document.createElement("label");
    priceLabel.innerHTML = "Product Price ";
    div.appendChild(priceLabel);

    var priceInput = document.createElement("input");
    priceInput.value = product.price;
    priceLabel.appendChild(priceInput);

    var quantityLabel = document.createElement("label");
    quantityLabel.innerHTML = "Product Quantity ";
    div.appendChild(quantityLabel);

    var quantityInput = document.createElement("input");
    quantityInput.value = product.stock;
    quantityLabel.appendChild(quantityInput);

    var deleteButton = document.createElement("button");
    deleteButton.innerHTML = "Remove Product";
    div.appendChild(deleteButton);

    var updateButton = document.createElement("button");
    updateButton.innerHTML = "Update Data";
    div.appendChild(updateButton);

    deleteButton.addEventListener("click", function(event) {
        var productDisplay = event.target.parentNode;
        productDisplay.innerHTML = "";
        console.log(productDisplay);
        deletefromDB(product);
    })

    updateButton.addEventListener("click", function(event) {
        var updatedProduct = {
            name: nameInput.value,
            price: priceInput.value,
            description: descriptionInput.value,
            stock: quantityInput.value,
            id: product._id,
        }
        updateDataInDB(updatedProduct);
    })
}

function deletefromDB(product) {
    console.log(product._id)
    var id = { id: product._id }
    var temp = JSON.stringify(id)
    console.log(temp);
    var request = new XMLHttpRequest();
    request.open("post", "/admin/deleteproduct")
    request.setRequestHeader("Content-type", "application/json");
    request.send(temp)

    request.addEventListener("load", function() {
        console.log("Product Removed from DB")
    })
}

function updateDataInDB(updatedProduct) {
    var request = new XMLHttpRequest();
    request.open("put", "/admin/addproduct")
    request.setRequestHeader("Content-type", "application/json")
    request.send(JSON.stringify(updatedProduct));

    request.addEventListener("load", function() {
        if (request.responseText == "Updated") {
            alert("Product Updated Successfully")
            console.log("updated");

        }
    })
}