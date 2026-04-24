import {
    Link,
    useLocation,
    Navigate,
    Outlet
} from "react-router-dom";

import { useAdminAuth } from "../context/AdminAuthContext";

function AdminLayout() {

    const location = useLocation();

    // USE ONLY ONE AUTH CALL
    const { adminUser, adminLogout, loading } = useAdminAuth();

    // REMOVE this localStorage state completely

    if (loading) {
        return <div>Loading...</div>;
    }

    // 🔐 Protect admin routes
    if (!adminUser) { // ONLY CHECK adminUser
        return (
            <Navigate
                to="/admin-login"
                state={{ from: location }}
                replace
            />
        );
    }

    const navItems = [
        { path: "/admin/dashboard", label: "Dashboard" },
        { path: "/admin/products", label: "Products" },
        { path: "/admin/orders", label: "Orders" },
        { path: "/admin/payments", label: "Payments" },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r hidden md:flex flex-col">

                <div className="h-16 flex items-center px-6 border-b">
                    <span className="text-xl font-bold">
                        Admin Panel
                    </span>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                                location.pathname === item.path
                                    ? "bg-orange-50 text-orange-600"
                                    : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={adminLogout}
                        className="w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>

            </aside>

            {/* Main Area */}
            <div className="flex-1 flex flex-col">

                <header className="bg-white border-b h-16 flex items-center justify-between px-6">
                    <span className="font-semibold">
                        Welcome, {adminUser.username}
                    </span>
                </header>

                <main className="flex-1 p-6">
                    <Outlet />
                </main>

            </div>
        </div>
    );
}

export default AdminLayout;
