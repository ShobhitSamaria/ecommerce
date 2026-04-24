import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/orderService";
import { formatPrice } from "../utils/currency";

function MyOrders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (user?.email) {
            fetchOrders();
        }
    }, [user?.email]);

    const fetchOrders = async () => {
        setLoading(true);
        const result = await getUserOrders(user.email);
        if (result.success) {
            setOrders(result.data);
        }
        setLoading(false);
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'PENDING': return 'Order Placed';
            case 'CONFIRMED': return 'Confirmed';
            case 'PROCESSING': return 'Processing';
            case 'SHIPPED': return 'Shipped';
            case 'DELIVERED': return 'Delivered';
            case 'PAYMENT_FAILED': return 'Payment Failed';
            default: return status;
        }
    };

    const getStatusSteps = (status) => {
        const steps = [
            { key: "PENDING", label: "Order Placed" },
            { key: "CONFIRMED", label: "Confirmed" },
            { key: "PROCESSING", label: "Processing" },
            { key: "SHIPPED", label: "Shipped" },
            { key: "DELIVERED", label: "Delivered" }
        ];
        
        const currentIndex = steps.findIndex(s => s.key === status);
        
        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            current: index === currentIndex
        }));
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'bg-green-100 text-green-800';
            case 'SHIPPED': return 'bg-blue-100 text-blue-800';
            case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED': return 'bg-orange-100 text-orange-800';
            case 'PENDING': return 'bg-gray-100 text-gray-800';
            case 'PAYMENT_FAILED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
                    <Link to="/products" className="btn btn-primary">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const steps = getStatusSteps(order.orderStatus);
                        
                        return (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-semibold text-gray-900">{order.orderTrackingId}</p>
                                        <p className="text-sm text-gray-500">
                                            {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN', { 
                                                day: 'numeric', month: 'long', year: 'numeric' 
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                                            {getStatusLabel(order.orderStatus)}
                                        </span>
                                        <p className="font-semibold text-gray-900">
                                            {formatPrice(order.totalAmount)}
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Order Progress - Centered */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between gap-2">
                                        {steps.map((step, index) => (
                                            <div key={step.key} className="flex items-center flex-1">
                                                <div className="flex flex-col items-center flex-1">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                                        step.completed 
                                                            ? step.current
                                                                ? 'bg-orange-500 text-white'
                                                                : 'bg-green-500 text-white'
                                                            : 'bg-gray-200 text-gray-400'
                                                    }`}>
                                                        {step.completed && !step.current ? '✓' : index + 1}
                                                    </div>
                                                    <p className={`text-xs mt-2 text-center ${
                                                        step.completed ? 'text-gray-700' : 'text-gray-400'
                                                    }`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className={`h-1 flex-1 mx-2 ${
                                                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                                                    }`}></div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* View Details Button - Bottom Right */}
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                                    >
                                        View Details
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal for Order Details - Faded Background */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <button 
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6">
                            {/* Order Info - Without Order ID */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Tracking ID</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.orderTrackingId}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Order Date</p>
                                    <p className="font-semibold text-gray-900">
                                        {selectedOrder.orderDate ? new Date(selectedOrder.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                                        {getStatusLabel(selectedOrder.orderStatus)}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Total Amount</p>
                                    <p className="font-semibold text-gray-900">{formatPrice(selectedOrder.totalAmount)}</p>
                                </div>
                            </div>
                            
                            {/* Delivery Address */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700">{selectedOrder.fullName}</p>
                                    <p className="text-gray-600">{selectedOrder.address}</p>
                                    <p className="text-gray-600">{selectedOrder.city} - {selectedOrder.zipCode}</p>
                                </div>
                            </div>
                            
                            {/* Order Items */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">Order Items ({selectedOrder.orderItems?.length || 0})</h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 ? (
                                        <>
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {selectedOrder.orderItems.map((item, idx) => (
                                                        <tr key={idx}>
                                                            <td className="px-4 py-3">
                                                                <p className="font-medium text-gray-900">{item.productName || 'Unknown Product'}</p>
                                                            </td>
                                                            <td className="px-4 py-3 text-center">{item.quantity || 0}</td>
                                                            <td className="px-4 py-3 text-right">{formatPrice(item.price)}</td>
                                                            <td className="px-4 py-3 text-right font-medium">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            
                                            {/* Price Breakdown */}
                                            <div className="bg-gray-50 p-4 space-y-2">
                                                {(() => {
                                                    const subtotal = selectedOrder.orderItems.reduce((sum, item) => 
                                                        sum + ((item.price || 0) * (item.quantity || 0)), 0);
                                                    const taxRate = 0.18;
                                                    const tax = subtotal * taxRate;
                                                    const total = subtotal + tax;
                                                    
                                                    return (
                                                        <>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Subtotal (Product Amount)</span>
                                                                <span className="text-gray-900">{formatPrice(subtotal)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-600">Tax (18% GST)</span>
                                                                <span className="text-gray-900">{formatPrice(tax)}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                                                                <span className="font-semibold text-gray-900">Total Amount</span>
                                                                <span className="font-bold text-lg text-orange-600">{formatPrice(total)}</span>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-8 text-center text-gray-500">
                                            No items found in this order
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MyOrders;
