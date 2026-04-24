import { Link, useNavigate, Outlet  } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b sticky top-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold text-orange-500">
          ShopHub
        </Link>

        <div className="flex-1 max-w-2xl px-8 hidden md:flex">
            <div className="relative w-full">
                <input
                    type="text"
                    className="block w-full pl-4 pr-10 py-3 border-none rounded-lg bg-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-200 sm:text-sm transition duration-150 ease-in-out"
                    placeholder="Search products..."
                />
            </div>
        </div>

        <div className="flex items-center gap-6">

          {user ? (
            <>
              <span className="text-sm">Hi, {user.name}</span>
              <Link to="/my-orders" className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                My Orders
              </Link>
              <button onClick={logout} className="text-sm text-gray-600 hover:text-orange-500 transition-colors">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
            </>
          )}

          <Link to="/cart" className="relative text-gray-900 hover:text-orange-500 transition-colors">
                            <div className="icon-shopping-cart w-6 h-6"></div>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold leading-none text-white bg-orange-600 rounded-full">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

        </div>
      </div>
    </nav>
  );
}

export default function Layout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
        </div>
    );
}