import { useState } from "react";
import Navbar from "./Components/Navbar";
import Products from "./Pages/Products";
import Cart from "./Pages/Cart";
import ProtectedRoute from "./Components/ProtectedRoute";
import Favorites from "./Pages/Favorites"

function App() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState("products");
  const [favorites, setFavorites] = useState([]);

  const user = {
    name: "Abinaya",
    email: "abinaya@gmail.com",
  };


  const addToCart = (product) => {
    const exists = cart.find((item) => item._id === product._id);

    if (exists) {
      setCart(
        cart.map((item) =>
          item._id === product._id
            ? { ...item, qty: item.qty + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const toggleFavorite = (product) => {
    const exists = favorites.find((p) => p._id === product._id);

    if (exists) {
      setFavorites(favorites.filter((p) => p._id !== product._id));
    } else {
      setFavorites([...favorites, product]);
    }
  };

  return (
    <ProtectedRoute>
      <Navbar
        cartCount={cart.reduce((a, c) => a + c.qty, 0)}
        search={search}
        setSearch={setSearch}
        goToCart={() => setPage("cart")}
        goToProducts={() => setPage("products")}
        goToFavorites = {() => setPage("favorites")}
        user ={user}
      />

      {page === "products" && (
          <Products
            addToCart={addToCart}
            search={search}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}

        {page === "cart" && (
          <Cart cart={cart} setCart={setCart} />
        )}

        {page === "favorites" && (
          <Favorites favorites={favorites} addToCart={addToCart} />
      )}
    </ProtectedRoute>
  );
}

export default App;
