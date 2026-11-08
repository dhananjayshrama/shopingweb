import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function UserPanel({ open, onClose }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/orders/my"), api.get("/wishlist")])
      .then(([o, w]) => {
        setOrders(o.data);
        setFavorites(w.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  const removeFavorite = async (id) => {
    await api.post(`/wishlist/${id}`);
    setFavorites((f) => f.filter((p) => p._id !== id));
  };

  const tabClass = (t) =>
    `flex-1 border-b-2 py-3 text-sm font-medium transition ${
      tab === t
        ? "border-yellow-500 text-gray-900"
        : "border-transparent text-gray-500 hover:text-gray-900"
    }`;

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/30 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-[70] flex h-full w-full max-w-sm flex-col border-l border-gray-200 bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button onClick={onClose} className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100">
            ✕
          </button>
        </div>

        <div className="flex border-b border-gray-200">
          <button onClick={() => setTab("orders")} className={tabClass("orders")}>
            My Orders ({orders.length})
          </button>
          <button onClick={() => setTab("favorites")} className={tabClass("favorites")}>
            Favorites ({favorites.length})
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {loading && <p className="py-10 text-center text-sm text-gray-500">Loading...</p>}

          {!loading && tab === "orders" && (
            <>
              {orders.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-500">No orders yet.</p>
              )}
              {orders.map((o) => (
                <div key={o._id} className="rounded-lg border border-gray-200 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-500">#{o._id.slice(-8)}</span>
                    <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs capitalize">
                      {o.status}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-gray-700">
                    {o.items?.map((i, idx) => (
                      <li key={idx}>
                        {i.name} × {i.quantity}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 border-t border-gray-100 pt-2 font-semibold">₹{o.total}</p>
                </div>
              ))}
            </>
          )}

          {!loading && tab === "favorites" && (
            <>
              {favorites.length === 0 && (
                <p className="py-10 text-center text-sm text-gray-500">No favorites saved.</p>
              )}
              {favorites.map((p) => (
                <div key={p._id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                    {p.image && <img src={p.image} alt={p.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate font-medium text-gray-900">{p.name}</p>
                    <p className="text-gray-600">₹{p.price}</p>
                  </div>
                  <button
                    onClick={() => removeFavorite(p._id)}
                    className="text-xs text-red-600 underline underline-offset-4"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full rounded-md border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}