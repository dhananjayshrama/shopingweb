import { useState } from "react";
import { Routes, Route, Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPanel from "./components/UserPanel";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import AdminProducts from "./admin/Products";
import AdminOrders from "./admin/Orders";

// Edit this list to match the category names saved in your products
const MENU = [
  { title: "Men", items: ["Shirts", "T-Shirts", "Jeans", "Jackets"] },
  { title: "Women", items: ["Tops", "Dresses", "Jeans", "Kurtis"] },
  { title: "Kids & Baby", items: ["Baby", "Boys", "Girls"] },
];

function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  const goCategory = (cat) => {
    setMenuOpen(false);
    navigate(`/?category=${encodeURIComponent(cat)}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    navigate(query.trim() ? `/?search=${encodeURIComponent(query.trim())}` : "/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link to={user ? "/" : "/login"} className="text-lg font-semibold text-gray-900">
          Shop
        </Link>

        {/* Menu button: only after login */}
        {user && (
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition ${
              menuOpen
                ? "border-gray-300 bg-gray-100 text-gray-900"
                : "border-transparent text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Menu
          </button>
        )}

        {/* Search bar: only after login */}
        {user && (
          <form onSubmit={handleSearch} className="relative mx-auto min-w-0 max-w-md flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-200"
            />
          </form>
        )}

        {/* ml-auto keeps this on the right even when search is hidden */}
        <div className="ml-auto flex items-center gap-2 text-sm">
          {user ? (
            <>
              {user.role === "admin" && (
                <Link to="/admin" className="hidden rounded-md px-3 py-1.5 text-gray-700 transition hover:bg-gray-100 sm:block">
                  Admin
                </Link>
              )}
              <button
                onClick={() => setPanelOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-100 text-sm font-semibold uppercase text-gray-800 transition hover:border-yellow-500 hover:bg-yellow-100"
                title="My account"
              >
                {user.name?.[0]}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="rounded-md px-3 py-1.5 text-gray-700 transition hover:bg-gray-100">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-md border border-yellow-500 bg-yellow-400 px-3 py-1.5 font-medium text-gray-900 transition hover:bg-yellow-300"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Menu panel: only when logged in */}
      {user && menuOpen && (
        <>
          <div className="fixed inset-0 top-14 z-40 bg-black/20" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 right-0 z-50 border-b border-gray-200 bg-white shadow-lg">
            <div className="mx-auto grid max-w-6xl gap-8 px-6 py-6 sm:grid-cols-3">
              {MENU.map((group) => (
                <div key={group.title}>
                  <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold uppercase tracking-wide text-gray-900">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item}>
                        <button
                          onClick={() => goCategory(item)}
                          className="w-full rounded-md px-2 py-1.5 text-left text-sm text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                        >
                          {item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 text-center">
              <button
                onClick={() => { setMenuOpen(false); navigate("/"); }}
                className="text-sm font-medium text-gray-700 underline underline-offset-4 hover:text-gray-900"
              >
                View all products
              </button>
            </div>
          </div>
        </>
      )}

      {user && <UserPanel open={panelOpen} onClose={() => setPanelOpen(false)} />}
    </nav>
  );
}

// Only logged-out people can open Login / Register
function GuestRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

// Only logged-in people can open the shop pages
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-800" />
      </div>
    );
  }

  const isAdmin = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}