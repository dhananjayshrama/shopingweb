import { useEffect, useState } from "react";
import api from "../api/axios";

// Must match the status values in your backend Order.js
const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const load = () =>
    api
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Could not load orders"));

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      load();
    } catch {
      setError("Could not update status");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Orders</h1>
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((o) => (
              <tr key={o._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{o._id.slice(-8)}</td>
                <td className="px-4 py-3">{o.items?.length ?? 0}</td>
                <td className="px-4 py-3">₹{o.total}</td>
                <td className="px-4 py-3 capitalize">{o.paymentStatus}</td>
                <td className="px-4 py-3">
                  <select
                    value={o.status}
                    onChange={(e) => changeStatus(o._id, e.target.value)}
                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm capitalize outline-none focus:border-gray-500"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}