import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../Components/ProductCard";
import CategoryBar from "../Components/CategoryBar";

function Products({ addToCart, search, favorites, toggleFavorite }) {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const url =
      category === "All"
        ? "http://localhost:5000/api/products"
        : `http://localhost:5000/api/products?category=${category}`;

    axios.get(url).then((res) => setProducts(res.data));
  }, [category]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <CategoryBar setCategory={setCategory} />

      {/* Search for mobile */}
      <div className="px-6 py-4 md:hidden">
        <input
          placeholder="Search products..."
          className="w-full border px-4 py-2 rounded"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            addToCart={addToCart}
            toggleFavorite={toggleFavorite}
            favorites={favorites}
          />
        ))}
      </div>
    </>
  );
}

export default Products;
