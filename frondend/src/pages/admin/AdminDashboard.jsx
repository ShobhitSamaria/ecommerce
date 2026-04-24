import { Link } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { formatPrice } from "../../utils/currency";

function AdminDashboard() {
    const { products = [], orders = [], payments = [] } = useData();

    // Calculate total revenue from SUCCESSFUL payments only
    const successfulPayments = payments.filter(p => p.status === 'SUCCESS');
    const totalRevenue = successfulPayments.reduce(
        (sum, p) => sum + (p.amount || 0),
        0
    );

    const stats = [
        {
            label: "Total Products",
            value: products.length,
        },
        {
            label: "Total Orders",
            value: orders.length,
        },
        {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
        },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-8">
                Dashboard Overview
            </h1>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-white p-6 rounded-xl shadow border"
                    >
                        <p className="text-sm text-gray-500">
                            {stat.label}
                        </p>
                        <p className="text-2xl font-bold">
                            {stat.value}
                        </p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 className="text-lg font-bold mb-4">
                Quick Actions
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

                <Link
                    to="/admin/products"
                    className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
                >
                    <h3 className="font-semibold mb-2">
                        Manage Products
                    </h3>
                    <p className="text-sm text-gray-500">
                        Add, edit, or remove products.
                    </p>
                </Link>

                <Link
                    to="/admin/orders"
                    className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
                >
                    <h3 className="font-semibold mb-2">
                        Manage Orders
                    </h3>
                    <p className="text-sm text-gray-500">
                        View and update orders.
                    </p>
                </Link>

                <Link
                    to="/admin/fraud-orders"
                    className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
                >
                    <h3 className="font-semibold mb-2 text-red-700">
                        🔍 Suspicious Orders
                    </h3>
                    <p className="text-sm text-gray-500">
                        Review fraud-flagged orders.
                    </p>
                </Link>

                <Link
                    to="/admin/payments"
                    className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition"
                >
                    <h3 className="font-semibold mb-2">
                        View Payments
                    </h3>
                    <p className="text-sm text-gray-500">
                        Check transaction history.
                    </p>
                </Link>

            </div>
        </div>
    );
}

export default AdminDashboard;
