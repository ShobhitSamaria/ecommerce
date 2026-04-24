import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/currency";

function Cart() {
    const { cart, removeFromCart, updateQuantity, totalAmount, totalItems } = useCart();

    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="icon-shopping-cart w-24 h-24 text-gray-200 mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products" className="btn btn-primary px-8 py-3 rounded-full">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({totalItems})</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Cart Items */}
                <div className="flex-1 space-y-6">
                    {cart.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex gap-6">
                            <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 p-2">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">{item.category}</p>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>

                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 text-sm font-medium border-x border-gray-200 min-w-[2.5rem] text-center">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="px-3 py-1 hover:bg-gray-50 text-gray-600"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <div className="icon-trash w-4 h-4"></div>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:w-96">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (18%)</span>
                                <span>{formatPrice(totalAmount * 0.18)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                                <span>Total</span>
                                <span>{formatPrice(totalAmount * 1.18)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full btn btn-primary py-3 rounded-xl font-bold shadow-lg shadow-orange-200"
                        >
                            Proceed to Checkout
                        </button>

                        <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
                            <div className="icon-shield-check w-4 h-4"></div>
                            <span className="text-xs">Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;