import { Heart, ShoppingCart } from "lucide-react";

function ProductCard({
  product,
  addToCart,
  toggleFavorite,
  favorites,
  showFavorite = true
}) {
  const isFav = favorites?.some((p) => p._id === product._id);

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 relative">
      
      {/* Favorite Icon */}
      {showFavorite && (
        <Heart
          onClick={() => toggleFavorite(product)}
          className={`absolute top-3 right-3 cursor-pointer ${
            isFav ? "text-red-500 fill-red-500" : "text-gray-400"
          }`}
        />
      )}

      {/* Image */}
      <img
        src={product.image}
        alt={product.name}
        className="h-44 w-full object-cover rounded-lg"
      />

      {/* Info */}
      <div className="mt-3">
        <h3 className="font-semibold text-lg truncate">
          {product.name}
        </h3>
        <p className="text-gray-600 mt-1">₹{product.price}</p>
      </div>

      {/* Add to Cart */}
      <button
        onClick={() => addToCart(product)}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        <ShoppingCart size={18} />
        Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
