import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function OrderSuccess() {
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        setOrderId("ORD" + Math.floor(Math.random() * 1000000));
    }, []);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="text-center max-w-lg">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Successful!</h1>
                <p className="text-gray-500 mb-8">
                    Thank you for your purchase. Your order <span className="font-mono font-medium text-gray-900">{orderId}</span> has been confirmed.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>You will receive an order confirmation email shortly.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <span>We will notify you when your order ships (usually within 24 hours).</span>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/" className="btn btn-outline py-3 px-8 rounded-full">
                        Return Home
                    </Link>
                    <Link to="/products" className="btn btn-primary py-3 px-8 rounded-full">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccess;
