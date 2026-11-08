import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";

export default function Home() {
  const [params] = useSearchParams();
  const search = params.get("search") || "";
  const category = params.get("category") || "";

  const [products, setProducts] = useState([]);
  const [saved, setSaved] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("/products", { params: { search, category } })
      .then((res) => {
        setProducts(res.data);
        setError("");
      })
      .catch(() => setError("Could not load products"))
      .finally(() => setLoading(false));
  }, [search, category]);

  useEffect(() => {
    api.get("/wishlist").then((res) => setSaved(res.data.map((p) => p._id))).catch(() => {});
  }, []);

  const toggleFav = async (id) => {
    try {
      const { data } = await api.post(`/wishlist/${id}`);
      setSaved((s) => (data.saved ? [...s, id] : s.filter((x) => x !== id)));
    } catch {
      alert("Please login to save favorites");
    }
  };

  const title = category || (search ? `Results for "${search}"` : "All products");

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{products.length} items</p>
        </div>
        {(category || search) && (
          <Link
            to="/"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-50"
          >
            Clear filter ✕
          </Link>
        )}
      </div>

      {error && (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="py-16 text-center text-sm text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div
              key={p._id}
              className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <button
                onClick={() => toggleFav(p._id)}
                className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white/90 text-lg shadow-sm transition hover:scale-110"
              >
                <span className={saved.includes(p._id) ? "text-red-500" : "text-gray-400"}>♥</span>
              </button>
              <div className="flex h-44 items-center justify-center border-b border-gray-200 bg-gray-100 text-sm text-gray-400">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  "No image"
                )}
              </div>
              <div className="space-y-1 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">{p.category}</p>
                <h2 className="line-clamp-1 font-medium text-gray-900">{p.name}</h2>
                <div className="flex items-center justify-between pt-1">
                  <p className="font-semibold text-gray-900">₹{p.price}</p>
                  <p className="text-xs text-gray-500">
                    {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && products.length === 0 && !error && (
        <p className="py-16 text-center text-sm text-gray-500">No products found.</p>
      )}
    </div>
  );
}