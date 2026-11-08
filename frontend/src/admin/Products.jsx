import { useEffect, useState } from "react";
import api from "../api/axios";

const empty = { name: "", price: "", category: "", image: "", stock: "" };
const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-200";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const load = () =>
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => setError("Could not load products"));

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setForm(empty);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      price: p.price,
      category: p.category || "",
      image: p.image || "",
      stock: p.stock,
    });
    setEditingId(p._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) await api.put(`/products/${editingId}`, body);
      else await api.post("/products", body);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch {
      setError("Could not delete product");
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <button
          onClick={openAdd}
          className="rounded-md border border-yellow-500 bg-yellow-400 px-3 py-1.5 text-sm font-medium transition hover:bg-yellow-300"
        >
          Add product
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-2"
        >
          <h2 className="font-medium sm:col-span-2">{editingId ? "Edit product" : "New product"}</h2>
          <input className={inputClass} placeholder="Name" value={form.name} onChange={set("name")} required />
          <input className={inputClass} placeholder="Category" value={form.category} onChange={set("category")} />
          <input className={inputClass} type="number" min="0" placeholder="Price" value={form.price} onChange={set("price")} required />
          <input className={inputClass} type="number" min="0" placeholder="Stock" value={form.stock} onChange={set("stock")} required />
          <input className={`${inputClass} sm:col-span-2`} placeholder="Image URL" value={form.image} onChange={set("image")} />
          <div className="flex gap-2 sm:col-span-2">
            <button className="rounded-md border border-yellow-500 bg-yellow-400 px-4 py-2 text-sm font-medium hover:bg-yellow-300">
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-gray-600">{p.category}</td>
                <td className="px-4 py-3">₹{p.price}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="space-x-2 px-4 py-3 text-right">
                  <button onClick={() => openEdit(p)} className="text-gray-700 underline underline-offset-4">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(p._id)} className="text-red-600 underline underline-offset-4">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">No products yet.</p>
        )}
      </div>
    </div>
  );
}