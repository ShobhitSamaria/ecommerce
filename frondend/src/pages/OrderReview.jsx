import { useNavigate, useLocation } from "react-router-dom";

function OrderReview() {
    const navigate = useNavigate();
    const location = useLocation();
    const { orderId, fraudScore, reason } = location.state || {};

    return (
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                {/* Icon */}
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Under Review</h1>
                <p className="text-gray-500 mb-6">
                    Your order <span className="font-semibold text-gray-700">#{orderId}</span> has been flagged for manual review and will not be processed until an admin approves it.
                </p>

                {/* Fraud Score */}
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
                    <p className="text-xs font-semibold text-orange-700 uppercase mb-1">Fraud Check Result</p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Fraud Score</p>
                            <p className="text-2xl font-bold text-orange-700">{fraudScore} <span className="text-sm font-normal text-gray-500">/ 100</span></p>
                        </div>
                        <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    {reason && (
                        <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium text-gray-700">Reason: </span>{reason}
                        </p>
                    )}
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                    <p className="text-sm text-gray-600">
                        💡 <strong>What happens next?</strong><br />
                        Our system detected unusual activity. An admin will review your order within 24 hours. You'll receive an email once it's approved or cancelled.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate("/")}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
                    >
                        Back to Home
                    </button>
                    <button
                        onClick={() => navigate("/my-orders")}
                        className="flex-1 px-4 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition"
                    >
                        View My Orders
                    </button>
                </div>
            </div>
        </div>
    );
}

export default OrderReview;
