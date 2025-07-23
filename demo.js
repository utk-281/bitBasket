let cart = {
  userId: 123,
  items: [
    { productId: 325, quantity: 1 },
    { productId: 344, quantity: 2 },
    { productId: 314, quantity: 1 },
  ],
};
console.log(cart.userId);

let array = cart.items;
console.log(array);

let productId = 314;

let idx = cart.items.findIndex((item) => item.productId === productId);
console.log("iindex", idx);
