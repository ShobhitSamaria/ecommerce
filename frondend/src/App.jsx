import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Products from "./pages/Products.jsx";
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Payment from './pages/Payment.jsx';

import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import FraudOrders from "./pages/admin/FraudOrders";
import PaymentView from "./pages/admin/PaymentView";
import OrderSuccess from "./pages/OrderSuccess";
import OrderCancelled from "./pages/OrderCancelled";
import OrderReview from "./pages/OrderReview";
import MyOrders from "./pages/MyOrders";

import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { CartProvider } from "./context/CartContext";
import { DataProvider } from "./context/DataContext";
import { OrderProvider } from "./context/OrderContext";

function App() {
  return (
      <BrowserRouter>
        <AuthProvider>
          <AdminAuthProvider>
            <DataProvider>
              <CartProvider>
                <OrderProvider>
                  <Routes>

                    {/* USER ROUTES */}

                    <Route element={<Layout />}>
                      <Route path="/" element={<Home />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/payment" element={<Payment />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/order-cancelled" element={<OrderCancelled />} />
                      <Route path="/order-review" element={<OrderReview />} />
                      <Route path="/my-orders" element={<MyOrders />} />
                    </Route>

                    {/* ADMIN ROUTES */}
                    <Route path="/admin-login" element={<AdminLogin />} />

                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="products" element={<ProductManagement />} />
                      <Route path="orders" element={<OrderManagement />} />
                      <Route path="fraud-orders" element={<FraudOrders />} />
                      <Route path="payments" element={<PaymentView />} />
                    </Route>

                  </Routes>
                </OrderProvider>
              </CartProvider>
            </DataProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </BrowserRouter>
  );
}

export default App;
