// variable

const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const cartDOM = document.querySelector(".cart");
const cartOverly = document.querySelector(".cart-overly");

const cartItems = document.querySelector(".cart-items");

const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const clearCartBtn = document.querySelector(".caler-cart");

// cart
let cart = [];

// buttonsDOM
let buttonDOM = [];

// getting  the products
class Products {
  async getProducts() {
    try {
      let result = await fetch("products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        //   console.log(item)
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;

        return { title, id, price, image };
      });
      return products;
    } catch (error) {
      console.log(error.massage);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    // console.log(products);
    let result = "";
    products.forEach((product) => {
      // console.log(product)

      result += `
 <!-- single product -->
 <article class="product">
 <div class="img-container">
       <img src=${product.image} alt="" class="product-img">
       <button class="bag-btn" data-id=${product.id} ><i class="fas fa-shopping-cart"></i> add to bag</button>
 </div>
 <h3>${product.title} </h3>
 <h3>$${product.price}</h3>
 </article>

 <!-- single product -->
 
 
 `;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonDOM = buttons;

    buttons.forEach((button) => {
      let id = button.dataset.id;
      // console.log(id)

      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;

        // get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        //   add product to the cart
        cart = [...cart, cartItem];

        // save cart in local storage
        Storage.saveCart(cart);

        // set cart value
        this.setCartValue(cart);

        // display cart item
        this.addCartItem(cartItem);

        // show cart
        this.showCart();
      });
    });
  }
  setCartValue(cart) {
    let tempTOtal = 0;
    let itemTotal = 0;

    cart.map((item) => {
      tempTOtal += item.price * item.amount;
      itemTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTOtal.toFixed(2));
    cartItems.innerText = itemTotal;

    // console.log(cartTotal, cartTotal);
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
<img src=${item.image} alt="">

<div>
      <h4>${item.title}</h4>
      <h5>${item.price}</h5>
      <span class="remove-item" data-id= ${item.id}>remove</span>
</div>

<div>
      <i class="fas fa-chevron-up"data-id= ${item.id}></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down"data-id= ${item.id}></i>
</div>

`;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverly.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverly.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if(event.target.classList.contains("remove-item")){
        let removeItem=event.target;
        
        let id=removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement)
        
        this.removeItem(id)
      }else if(event.target.classList.contains("fa-chevron-up")){
        let addAmount=event.target;
        let id=addAmount.dataset.id;
        let tempItem=cart.find(item=>item.id ===id);
        tempItem.amount=tempItem.amount+1;
        Storage.saveCart(cart);
        this.setCartValue(cart);
        addAmount.nextElementSibling.innerText=tempItem.amount
        
      }else if(event.target.classList.contains("fa-chevron-down")){
        let lowerAmount=event.target;
        let id=lowerAmount.dataset.id;
        let tempItem=cart.find(item=>item.id ===id);
        tempItem.amount=tempItem.amount-1;
        if(tempItem.amount>0){
          Storage.saveCart(cart);
          this.setCartValue(cart);
          lowerAmount.previousElementSibling.innerText=tempItem.amount;
        }else{
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id)
        }
      }

    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `
    <i class="fas fa-shopping-cart"></i>add to cart
    `;
  }
  getSingleButton(id) {
    return buttonDOM.find((button) => button.dataset.id === id);
  }
}

// local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id == id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();
  //   setup app
  ui.setupApp();

  //     get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
