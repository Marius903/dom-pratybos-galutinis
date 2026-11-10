console.log("================================");
console.log("PRODUCT MANAGEMENT SYSTEM");
console.log("APPLICATION STARTED");
console.log("================================");


// ========================================
// 1. LOCAL STORAGE DATA
// ========================================

function loadData(key) {

    try {

        const data = JSON.parse(localStorage.getItem(key));

        return Array.isArray(data) ? data : [];

    } catch (error) {

        console.warn("Could not load data:", key);

        return [];

    }

}


let products = loadData("cartList");
let cart = loadData("shoppingCart");


// ========================================
// 2. HTML ELEMENTS
// ========================================

const productForm = document.getElementById("productForm");

const productId = document.getElementById("productId");
const productName = document.getElementById("productName");
const productQuantity = document.getElementById("productQuantity");

const message = document.getElementById("message");

const productTable = document.getElementById("productTable");
const productTableContainer = document.getElementById("productTableContainer");
const emptyProducts = document.getElementById("emptyProducts");

const searchId = document.getElementById("searchId");
const searchBtn = document.getElementById("searchBtn");
const searchTable = document.getElementById("searchTable");
const searchTableContainer = document.getElementById("searchTableContainer");
const searchMessage = document.getElementById("searchMessage");

const cartTable = document.getElementById("cartTable");
const cartTableContainer = document.getElementById("cartTableContainer");
const emptyCart = document.getElementById("emptyCart");

const editBtn = document.getElementById("editBtn");
const deleteBtn = document.getElementById("deleteBtn");
const clearBtn = document.getElementById("clearBtn");


// Editing product ID
let editingId = null;


// ========================================
// 3. SAVE DATA
// ========================================

function saveProducts() {

    localStorage.setItem(
        "cartList",
        JSON.stringify(products)
    );

    console.log("Products saved to LocalStorage.");

}


function saveCart() {

    localStorage.setItem(
        "shoppingCart",
        JSON.stringify(cart)
    );

    console.log("Shopping cart saved to LocalStorage.");

}


// ========================================
// 4. SHOW MESSAGES
// ========================================

function showMessage(text, color = "green") {

    message.textContent = text;
    message.style.color = color;

}


function showSearchMessage(text, color = "green") {

    searchMessage.textContent = text;
    searchMessage.style.color = color;

}


// ========================================
// 5. VALIDATE PRODUCT
// ========================================

function validateProduct() {

    const id = productId.value.trim();
    const name = productName.value.trim();
    const quantity = productQuantity.value.trim();

    if (id === "" || name === "" || quantity === "") {

        showMessage("Please fill in all fields!", "red");

        return false;

    }

    if (
        !Number.isSafeInteger(Number(id)) ||
        Number(id) <= 0
    ) {

        showMessage(
            "Product code must be a positive integer!",
            "red"
        );

        return false;

    }

    if (
        !Number.isSafeInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {

        showMessage(
            "Quantity must be a positive integer!",
            "red"
        );

        return false;

    }

    return true;

}


// ========================================
// 6. CLEAR FORM
// ========================================

function clearForm() {

    productForm.reset();

    editingId = null;

    productId.disabled = false;

    showMessage("Form cleared.", "blue");

}


// ========================================
// 7. CREATE TABLE CELL
// ========================================

function createCell(row, value) {

    const cell = document.createElement("td");

    cell.textContent = value;

    row.appendChild(cell);

    return cell;

}


// ========================================
// 8. INSERT NEW PRODUCT
// ========================================

function insertProduct() {

    if (!validateProduct()) return;

    const id = productId.value.trim();

    const existingProduct = products.find(
        product => String(product.id) === id
    );

    if (existingProduct) {

        showMessage(
            "This product already exists!",
            "red"
        );

        return;

    }

    const newProduct = {

        id: id,

        name: productName.value.trim(),

        quantity: Number(productQuantity.value)

    };

    products.push(newProduct);

    saveProducts();

    renderProducts();

    showMessage(
        "Product successfully inserted!",
        "green"
    );

    console.log("New product:");
    console.table([newProduct]);

    clearForm();

}


// ========================================
// 9. RENDER PRODUCTS TABLE
// ========================================

function renderProducts() {

    productTable.innerHTML = "";

    if (products.length === 0) {

        productTableContainer.hidden = true;

        emptyProducts.hidden = false;

        return;

    }

    productTableContainer.hidden = false;

    emptyProducts.hidden = true;

    products.forEach(product => {

        const row = document.createElement("tr");

        createCell(row, product.id);

        createCell(row, product.name);

        createCell(row, product.quantity);


        const actions = document.createElement("td");


        // EDIT BUTTON

        const selectButton = document.createElement("button");

        selectButton.textContent = "Edit";

        selectButton.className = "edit-btn";

        selectButton.addEventListener("click", function () {

            selectProduct(product.id);

        });


        // ADD TO CART BUTTON

        const cartButton = document.createElement("button");

        cartButton.textContent = "Add to cart";

        cartButton.className = "cart-btn";

        cartButton.addEventListener("click", function () {

            addToCart(product.id);

        });


        actions.appendChild(selectButton);

        actions.appendChild(cartButton);

        row.appendChild(actions);

        productTable.appendChild(row);

    });


    console.log("Products table:");

    console.table(products);

}


// ========================================
// 10. SELECT PRODUCT FOR EDITING
// ========================================

function selectProduct(id) {

    const product = products.find(
        item => String(item.id) === String(id)
    );

    if (!product) {

        showMessage("Product not found!", "red");

        return;

    }

    productId.value = product.id;

    productName.value = product.name;

    productQuantity.value = product.quantity;


    // Remember which product is being edited

    editingId = String(product.id);

    // Do not allow changing ID during editing

    productId.disabled = true;


    showMessage(
        "Product selected. You can edit its information.",
        "blue"
    );

    console.log("Selected product:");

    console.table([product]);

}


// ========================================
// 11. UPDATE PRODUCT
// ========================================

function updateProduct() {

    if (editingId === null) {

        showMessage(
            "Select a product from the table first!",
            "red"
        );

        return;

    }

    if (!validateProduct()) return;

    const index = products.findIndex(
        product => String(product.id) === editingId
    );

    if (index === -1) {

        showMessage("Product not found!", "red");

        return;

    }


    const oldProduct = products[index];

    products[index].name = productName.value.trim();

    products[index].quantity = Number(productQuantity.value);


    // Update information in shopping cart

    cart = cart.map(item => {

        if (String(item.id) === editingId) {

            return {

                ...item,

                name: products[index].name,

                quantity: Math.min(
                    item.quantity,
                    products[index].quantity
                )

            };

        }

        return item;

    }).filter(item => item.quantity > 0);


    saveProducts();

    saveCart();

    renderProducts();

    renderCart();


    showMessage(
        "Product successfully updated!",
        "green"
    );

    console.log("Updated product:");

    console.table([products[index]]);

    clearForm();

}


// ========================================
// 12. DELETE PRODUCT BY ID
// ========================================

function deleteProduct() {

    const id = editingId !== null
        ? editingId
        : productId.value.trim();


    if (id === "") {

        showMessage("Enter product code!", "red");

        return;

    }


    const product = products.find(
        item => String(item.id) === String(id)
    );


    if (!product) {

        showMessage("Product not found!", "red");

        return;

    }


    // Delete from inventory

    products = products.filter(
        item => String(item.id) !== String(id)
    );


    // Delete from shopping cart too

    cart = cart.filter(
        item => String(item.id) !== String(id)
    );


    saveProducts();

    saveCart();

    renderProducts();

    renderCart();

    clearSearch();

    clearForm();


    showMessage(
        "Product successfully deleted!",
        "green"
    );


    console.log("Deleted product:");

    console.table([product]);

}


// ========================================
// 13. FIND PRODUCT BY ID
// ========================================

function findProduct() {

    const id = searchId.value.trim();

    searchTable.innerHTML = "";

    searchTableContainer.hidden = true;


    if (id === "") {

        showSearchMessage(
            "Enter product code!",
            "red"
        );

        return;

    }


    const product = products.find(
        item => String(item.id) === id
    );


    if (!product) {

        showSearchMessage(
            "Product not found!",
            "red"
        );

        console.warn("Product not found:", id);

        return;

    }


    const row = document.createElement("tr");

    createCell(row, product.id);

    createCell(row, product.name);

    createCell(row, product.quantity);


    searchTable.appendChild(row);

    searchTableContainer.hidden = false;


    showSearchMessage(
        "Product found successfully!",
        "green"
    );


    console.log("Search result:");

    console.table([product]);

}


// ========================================
// 14. CLEAR SEARCH
// ========================================

function clearSearch() {

    searchId.value = "";

    searchTable.innerHTML = "";

    searchTableContainer.hidden = true;

    searchMessage.textContent = "";

}


// ========================================
// 15. ADD PRODUCT TO CART
// ========================================

function addToCart(id) {

    const product = products.find(
        item => String(item.id) === String(id)
    );


    if (!product) {

        console.warn("Product not found.");

        return;

    }


    const existingItem = cart.find(
        item => String(item.id) === String(id)
    );


    if (existingItem) {

        if (existingItem.quantity >= product.quantity) {

            alert("Not enough products in stock!");

            return;

        }

        existingItem.quantity++;

    } else {

        cart.push({

            id: product.id,

            name: product.name,

            quantity: 1

        });

    }


    saveCart();

    renderCart();


    console.log("Product added to cart:");

    console.table([product]);

}


// ========================================
// 16. RENDER SHOPPING CART
// ========================================

function renderCart() {

    cartTable.innerHTML = "";


    if (cart.length === 0) {

        cartTableContainer.hidden = true;

        emptyCart.hidden = false;

        return;

    }


    cartTableContainer.hidden = false;

    emptyCart.hidden = true;


    cart.forEach(product => {

        const row = document.createElement("tr");

        createCell(row, product.id);

        createCell(row, product.name);

        createCell(row, product.quantity);


        const actions = document.createElement("td");

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Remove";

        deleteButton.className = "remove-btn";


        deleteButton.addEventListener("click", function () {

            removeFromCart(product.id);

        });


        actions.appendChild(deleteButton);

        row.appendChild(actions);

        cartTable.appendChild(row);

    });


    console.log("Shopping cart:");

    console.table(cart);

}


// ========================================
// 17. REMOVE PRODUCT FROM CART
// ========================================

function removeFromCart(id) {

    const existingItem = cart.find(
        item => String(item.id) === String(id)
    );

    if (!existingItem) {

        console.warn("Product not found in cart.");

        return;

    }


    cart = cart.filter(
        item => String(item.id) !== String(id)
    );


    saveCart();

    renderCart();


    console.log(
        "Product removed from cart:",
        id
    );

}


// ========================================
// 18. CHANGE TEXT STYLE
// ========================================

const paragraph = document.querySelector("#myParagraph");

const styleButton = document.querySelector("#changeStyle");


styleButton.addEventListener("click", function () {

    paragraph.style.color = "red";

    paragraph.style.backgroundColor = "black";

    paragraph.style.fontSize = "24px";

    paragraph.style.padding = "10px";

    paragraph.style.borderRadius = "5px";


    console.log("Text style successfully changed.");

});


// ========================================
// 19. BUTTON EVENTS
// ========================================


// INSERT NEW PRODUCT

productForm.addEventListener("submit", function (event) {

    event.preventDefault();

    insertProduct();

});


// EDIT PRODUCT

editBtn.addEventListener("click", function () {

    updateProduct();

});


// DELETE PRODUCT

deleteBtn.addEventListener("click", function () {

    deleteProduct();

});


// CLEAR FORM

clearBtn.addEventListener("click", function () {

    clearForm();

});


// SEARCH PRODUCT

searchBtn.addEventListener("click", function () {

    findProduct();

});


// SEARCH USING ENTER

searchId.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        findProduct();

    }

});


// ========================================
// 20. INITIALIZE APPLICATION
// ========================================

function initializeApp() {

    console.log("================================");

    console.log("PRODUCT SYSTEM STARTED");

    console.log("================================");


    renderProducts();

    renderCart();


    console.log("LocalStorage products:");

    console.table(products);


    console.log("LocalStorage shopping cart:");

    console.table(cart);


    console.log("Saved LocalStorage data:");

    console.log(
        "cartList:",
        localStorage.getItem("cartList")
    );

    console.log(
        "shoppingCart:",
        localStorage.getItem("shoppingCart")
    );


    console.log("Application successfully initialized.");

}

// START APPLICATION

initializeApp();
