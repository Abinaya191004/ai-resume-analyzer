import ProductCard from "../Components/ProductCard";

function Favorites({ favorites, addToCart }) {
  if (!favorites || favorites.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">No favorites yet ❤️</h2>
        <p className="text-gray-500 mt-2">
          Tap the heart icon on products to add them here.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Your Favorites ❤️</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {favorites.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            addToCart={addToCart}
            favorites={favorites}
            showFavorite={false}   
          />
        ))}
      </div>
    </div>
  );
}

export default Favorites;
