function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <p className="text-center mt-20">Please login first</p>;
  }

  return children;
}

export default ProtectedRoute;
