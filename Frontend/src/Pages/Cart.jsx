import { Trash } from "lucide-react";

function Cart({ cart, setCart }) {
  const increaseQty = (id) => {
    setCart(
      cart.map((item) =>
        item._id === id ? { ...item, qty: item.qty + 1 } : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart(
      cart
        .map((item) =>
          item._id === id ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  if (cart.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">
          Your cart is empty 🛒
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Your Cart</h2>

      {cart.map((item) => (
        <div
          key={item._id}
          className="flex items-center gap-4 border-b py-4"
        >
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 object-cover rounded"
          />

          <div className="flex-1">
            <h3 className="font-semibold">{item.name}</h3>
            <p>₹{item.price}</p>
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => decreaseQty(item._id)}
              className="px-3 py-1 border rounded"
            >
              -
            </button>
            <span>{item.qty}</span>
            <button
              onClick={() => increaseQty(item._id)}
              className="px-3 py-1 border rounded"
            >
              +
            </button>
          </div>

          {/* Delete Icon */}
          <button
            onClick={() => removeItem(item._id)}
            className="text-red-500 ml-4 hover:text-red-700"
          >
            <Trash size={20} />
          </button>
        </div>
      ))}

      {/* Total + Checkout */}
      <div className="mt-8 flex justify-between items-center">
        <h3 className="text-xl font-bold">
          Total: ₹{totalPrice}
        </h3>

        <button className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

export default Cart;
