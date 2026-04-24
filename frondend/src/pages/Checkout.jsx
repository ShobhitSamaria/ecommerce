import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/currency";

function Checkout() {
    const { totalAmount, cart } = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    useEffect(() => {
        if (cart.length === 0) {
            navigate("/cart");
        }
    }, [cart, navigate]);


    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate("/payment", { state: { address: formData } });
    };

    const total = totalAmount * 1.18;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

            <div className="flex flex-col lg:flex-row gap-12">
                <div className="flex-1">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <div className="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                                <div className="icon-map-pin w-5 h-5"></div>
                            </div>
                            Shipping Address
                        </h2>

                        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text" required name="fullName"
                                        className="input-field"
                                        value={formData.fullName} onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel" required name="phone"
                                        className="input-field"
                                        value={formData.phone} onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line</label>
                                <textarea
                                    required name="address" rows="3"
                                    className="input-field"
                                    value={formData.address} onChange={handleInputChange}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                    <input
                                        type="text" required name="city"
                                        className="input-field"
                                        value={formData.city} onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                    <input
                                        type="text" required name="state"
                                        className="input-field"
                                        value={formData.state} onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                                    <input
                                        type="text" required name="pincode"
                                        className="input-field"
                                        value={formData.pincode} onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:w-96">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
                        <div className="space-y-3 mb-6">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-gray-600">{item.name} x {item.quantity}</span>
                                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between text-gray-600">
                                <span>Tax (18%)</span>
                                <span>{formatPrice(totalAmount * 0.18)}</span>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                            <span>Total</span>
                            <span>{formatPrice(totalAmount * 1.18)}</span>
                        </div>

                        <button
                            type="submit" form="checkout-form"
                            className="w-full mt-6 btn btn-primary py-3 rounded-xl font-bold"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;