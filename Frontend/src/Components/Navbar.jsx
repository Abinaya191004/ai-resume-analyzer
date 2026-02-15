import { ShoppingCart, Heart, User } from "lucide-react";
import { useState } from "react";

function Navbar({
  cartCount,
  favCount,
  search,
  setSearch,
  goToCart,
  goToProducts,
  goToFavorites,
  logout,
  user
}) {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
      
      {/* Logo */}
      <h1
        className="text-xl font-bold cursor-pointer"
        onClick={goToProducts}
      >
        InsightCart <span className="text-indigo-600">AI</span>
      </h1>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="border px-4 py-2 rounded w-1/2 hidden md:block"
      />

      {/* Right Icons */}
      <div className="flex items-center gap-6 relative">
        
        {/* Favorites */}
        <div onClick={goToFavorites} className="relative cursor-pointer">
          <Heart />
          <span className="badge">{favCount}</span>
        </div>

        {/* Cart */}
        <div onClick={goToCart} className="relative cursor-pointer">
          <ShoppingCart />
          <span className="badge">{cartCount}</span>
        </div>

        {/* Account */}
        <div className="relative">
          <User
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />

          {open && (
            <div className="absolute right-0 mt-3 bg-white shadow rounded w-56 p-4">
              <p className="font-semibold">{user?.name || "User"}</p>
              <p className="text-sm text-gray-600">{user?.email || ""}</p>

              <hr className="my-2" />

              <p>❤️ Favorites: {favCount}</p>
              <p>🛒 Cart: {cartCount}</p>

              <button
                onClick={logout}
                className="mt-3 w-full bg-black text-white py-2 rounded"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
