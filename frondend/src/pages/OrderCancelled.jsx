import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function OrderCancelled() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const orderId = location.state?.orderId || "N/A";
    const reason = location.state?.reason || "Payment Failed";

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
            <div className="text-center max-w-lg">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Cancelled</h1>
                <p className="text-gray-500 mb-2">
                    Reason: <span className="font-medium text-red-600">{reason}</span>
                </p>
                <p className="text-gray-500 mb-8">
                    Your order <span className="font-mono font-medium text-gray-900">{orderId}</span> was cancelled due to payment failure.
                </p>

                <div className="bg-red-50 rounded-xl p-6 mb-8 text-left border border-red-200">
                    <h3 className="font-semibold text-gray-900 mb-3">What went wrong?</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>The payment was not completed successfully.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>No payment has been deducted from your account.</span>
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={() => navigate('/payment', { state: location.state?.preservePaymentState })} 
                        className="btn btn-outline py-3 px-8 rounded-full"
                    >
                        Try Again
                    </button>
                    <Link to="/" className="btn btn-primary py-3 px-8 rounded-full">
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default OrderCancelled;
