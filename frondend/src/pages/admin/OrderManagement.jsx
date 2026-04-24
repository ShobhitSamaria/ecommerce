import { useState, useEffect } from "react";
import { getAllOrders, updateOrderStatus } from "../../services/orderService";
import { formatPrice } from "../../utils/currency";

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const result = await getAllOrders();
        if (result.success) {
            setOrders(result.data);
        }
        setLoading(false);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        setUpdating(orderId);
        const result = await updateOrderStatus(orderId, newStatus);
        if (result.success) {
            setOrders(prev => prev.map(order => 
                order.id === orderId ? { ...order, orderStatus: newStatus } : order
            ));
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({...selectedOrder, orderStatus: newStatus});
            }
        } else {
            alert("Failed to update status: " + result.error);
        }
        setUpdating(null);
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

    const getTransactionStatusColor = (status) => {
        if (status === 'PAYMENT_SUCCESSFUL') {
            return 'bg-green-100 text-green-800';
        }
        return 'bg-red-100 text-red-800';
    };

    const isTransactionFailed = (transactionStatus) => {
        return transactionStatus === 'PAYMENT_FAILED';
    };

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading orders...</p>
                </div>
            </div>
        );
    }

    if (!orders || orders.length === 0) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500">No orders found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-IN') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.orderItems?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <select
                                            value={order.orderStatus || 'PENDING'}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                            disabled={updating === order.id || isTransactionFailed(order.transactionStatus)}
                                            className={`text-xs font-semibold rounded-full px-3 py-1.5 border-0 cursor-pointer focus:ring-2 focus:ring-orange-500 ${getStatusColor(order.orderStatus)} ${isTransactionFailed(order.transactionStatus) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PROCESSING">Processing</option>
                                            <option value="SHIPPED">Shipped</option>
                                            <option value="DELIVERED">Delivered</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTransactionStatusColor(order.transactionStatus)}`}>
                                            {order.transactionStatus === 'PAYMENT_SUCCESSFUL' ? 'SUCCESS' : 'FAILED'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button 
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Order Details */}
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
                            {/* Order Info */}
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
                                    <p className="text-sm text-gray-500">Customer</p>
                                    <p className="font-semibold text-gray-900">{selectedOrder.fullName}</p>
                                    <p className="text-sm text-gray-500">{selectedOrder.userEmail}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Order Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}>
                                        {selectedOrder.orderStatus}
                                    </span>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-500">Transaction Status</p>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getTransactionStatusColor(selectedOrder.transactionStatus)}`}>
                                        {selectedOrder.transactionStatus === 'PAYMENT_SUCCESSFUL' ? 'SUCCESS' : 'FAILED'}
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
                            
                            {/* Update Status */}
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Update Order Status</label>
                                <select
                                    value={selectedOrder.orderStatus || 'PENDING'}
                                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                    disabled={isTransactionFailed(selectedOrder.transactionStatus)}
                                    className={`input-field flex-1 ${isTransactionFailed(selectedOrder.transactionStatus) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="PROCESSING">Processing</option>
                                    <option value="SHIPPED">Shipped</option>
                                    <option value="DELIVERED">Delivered</option>
                                </select>
                                {isTransactionFailed(selectedOrder.transactionStatus) && (
                                    <p className="text-xs text-red-500 mt-2">
                                        Cannot update status for failed payments
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OrderManagement;
