import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `block rounded-md border px-3 py-2 text-sm transition ${
      isActive
        ? "border-gray-200 bg-gray-100 font-medium text-gray-900"
        : "border-transparent text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <aside className="hidden w-60 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-14 items-center border-b border-gray-200 px-6 font-semibold">
          Admin Panel
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gray-200 p-3">
          <Link to="/" className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
            View shop
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
          <div className="flex gap-1 md:hidden">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </div>
          <span className="hidden text-sm text-gray-500 md:block">Manage your store</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={logout}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 transition hover:bg-gray-50"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}