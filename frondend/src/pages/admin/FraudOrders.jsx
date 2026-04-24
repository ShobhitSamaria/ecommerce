import { useState, useEffect } from "react";
import { getAllOrders, approveFraudOrder, rejectFraudOrder } from "../../services/orderService";
import { formatPrice } from "../../utils/currency";

function FraudOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchFraudOrders();
    }, []);

    // Fetch only fraud-flagged orders
    const fetchFraudOrders = async () => {
        setLoading(true);
        const result = await getAllOrders();
        if (result.success) {
            // Filter to only suspicious/pending_review orders
            const fraudOrders = result.data.filter(
                order => order.fraudFlag === true || order.orderStatus === "PENDING_REVIEW"
            );
            setOrders(fraudOrders);
        }
        setLoading(false);
    };

    // Admin approves → order becomes CONFIRMED
    const handleApprove = async (orderId) => {
        setActionLoading(orderId);
        const result = await approveFraudOrder(orderId);
        if (result.success) {
            setOrders(prev => prev.filter(o => o.id !== orderId));
            setSelectedOrder(null);
        } else {
            alert("Failed to approve: " + result.error);
        }
        setActionLoading(null);
    };

    // Admin rejects → order becomes CANCELLED
    const handleReject = async (orderId) => {
        setActionLoading(orderId);
        const result = await rejectFraudOrder(orderId);
        if (result.success) {
            setOrders(prev => prev.filter(o => o.id !== orderId));
            setSelectedOrder(null);
        } else {
            alert("Failed to reject: " + result.error);
        }
        setActionLoading(null);
    };

    // Color for fraud score severity
    const getScoreColor = (score) => {
        if (score >= 70) return "bg-red-100 text-red-800";
        if (score >= 50) return "bg-orange-100 text-orange-800";
        return "bg-yellow-100 text-yellow-800";
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Suspicious Orders</h1>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Scanning orders...</p>
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Suspicious Orders</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 text-green-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No suspicious orders found 🎉</p>
                    <p className="text-gray-400 text-sm mt-1">All orders passed fraud checks.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Suspicious Orders</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {orders.length} order{orders.length !== 1 ? "s" : ""} flagged for review
                    </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                    <span className="text-red-700 text-sm font-medium">
                        🔍 Manual review required
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-red-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Tracking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Fraud Score</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order.orderTrackingId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>{order.fullName}</div>
                                        <div className="text-xs text-gray-400">{order.userEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {formatPrice(order.totalAmount)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getScoreColor(order.fraudScore)}`}>
                                            {order.fraudScore} / 100
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={order.fraudReason}>
                                        {order.fraudReason || "Multiple risk factors detected"}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="bg-red-100 text-red-800 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                                            PENDING REVIEW
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                                        >
                                            Review
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Review Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
                        {/* Header */}
                        <div className="bg-red-50 border-b border-red-100 px-6 py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold text-red-800">🔍 Fraud Review</h2>
                                <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            {/* Fraud Score Banner */}
                            <div className={`rounded-xl p-4 flex items-center justify-between ${getScoreColor(selectedOrder.fraudScore)}`}>
                                <div>
                                    <p className="text-sm font-medium opacity-80">Fraud Score</p>
                                    <p className="text-3xl font-bold">{selectedOrder.fraudScore}<span className="text-lg font-normal"> / 100</span></p>
                                </div>
                                <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>

                            {/* Order Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Tracking ID</p>
                                    <p className="font-semibold text-sm text-gray-900">{selectedOrder.orderTrackingId}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Amount</p>
                                    <p className="font-semibold text-sm text-gray-900">{formatPrice(selectedOrder.totalAmount)}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Customer</p>
                                    <p className="font-semibold text-sm text-gray-900">{selectedOrder.fullName}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="font-semibold text-sm text-gray-900">{selectedOrder.userEmail}</p>
                                </div>
                            </div>

                            {/* Fraud Reason */}
                            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                                <p className="text-xs font-semibold text-red-700 uppercase mb-1">Fraud Reason</p>
                                <p className="text-sm text-red-800">{selectedOrder.fraudReason || "Multiple risk factors detected"}</p>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Delivery Address</p>
                                <p className="text-sm text-gray-700">
                                    {selectedOrder.fullName}<br />
                                    {selectedOrder.address}, {selectedOrder.city} - {selectedOrder.zipCode}
                                </p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 pb-6 flex gap-3">
                            <button
                                onClick={() => handleReject(selectedOrder.id)}
                                disabled={actionLoading === selectedOrder.id}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-red-300 text-red-700 font-semibold rounded-xl hover:bg-red-50 transition disabled:opacity-50"
                            >
                                {actionLoading === selectedOrder.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Reject
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleApprove(selectedOrder.id)}
                                disabled={actionLoading === selectedOrder.id}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition disabled:opacity-50"
                            >
                                {actionLoading === selectedOrder.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Approve
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default FraudOrders;
