function CategoryBar({ setCategory }) {
  const categories = ["All", "Men", "Women", "Clothes", "Groceries"];

  return (
    <div className="flex gap-4 px-6 py-4 overflow-x-auto bg-gray-100">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => setCategory(cat)}
          className="px-4 py-2 bg-white rounded shadow hover:bg-indigo-600 hover:text-white"
        >
          {cat}
        </button>
      ))}
    </div>
  );
}

export default CategoryBar;
