import axios from "axios";

const ORDER_SERVICE_URL = "http://localhost:8085/api/orders";
const PAYMENT_SERVICE_URL = "http://localhost:8084/api/payments";

/**
 * Place an order with fraud check.
 * Returns immediately with order data — fraud check runs asynchronously.
 */
export const handlePlaceOrder = async (checkoutData) => {
    try {
        const orderItems = checkoutData.cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            price: item.price
        }));

        const orderPayload = {
            userEmail: checkoutData.userEmail,
            fullName: checkoutData.fullName,
            address: checkoutData.address,
            city: checkoutData.city,
            zipCode: checkoutData.zipCode,
            totalAmount: checkoutData.totalAmount,
            paymentMethod: checkoutData.paymentMethod,
            orderStatus: "PENDING",
            transactionStatus: "PENDING",
            orderItems: orderItems
        };

        const response = await axios.post(`${ORDER_SERVICE_URL}/place`, orderPayload);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error placing order:", error);
        return { success: false, error: error.message || "Failed to place order" };
    }
};

/**
 * Process payment + confirm order in parallel using Promise.all.
 * Both calls happen simultaneously — total wait time is ~max(payment, confirmation)
 * instead of sum(payment + confirmation).
 */
export const processPaymentAndConfirmOrder = async (
    orderTrackingId,
    total,
    paymentMode,
    isSuccess,
    orderStatus,
    transactionStatus
) => {
    try {
        // Fire both API calls simultaneously
        const [paymentResult, confirmResult] = await Promise.all([
            // Call payment service
            axios.post(
                `${PAYMENT_SERVICE_URL}/process`,
                null,
                {
                    params: {
                        orderTrackingId,
                        amount: total,
                        paymentMode,
                        isSuccess
                    }
                }
            ),
            // Call order service to update both statuses in one call
            axios.patch(
                `${ORDER_SERVICE_URL}/confirm-payment`,
                {
                    orderTrackingId,
                    orderStatus,
                    transactionStatus
                }
            )
        ]);

        // Both succeeded
        if (paymentResult.data && confirmResult.data) {
            return {
                success: true,
                data: {
                    payment: paymentResult.data,
                    order: confirmResult.data
                }
            };
        }

        // Fallback: return what we got
        return { success: true, data: { payment: paymentResult.data } };
    } catch (error) {
        console.error("Error in payment flow:", error);
        return { success: false, error: error.message || "Payment flow failed" };
    }
};

/**
 * Legacy method — kept for backward compatibility.
 * Prefer processPaymentAndConfirmOrder for faster performance.
 */
export const processPayment = async (orderTrackingId, amount, paymentMode, isSuccess) => {
    try {
        const response = await axios.post(
            `${PAYMENT_SERVICE_URL}/process`,
            null,
            {
                params: {
                    orderTrackingId,
                    amount,
                    paymentMode,
                    isSuccess
                }
            }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error processing payment:", error);
        return { success: false, error: error.message || "Failed to process payment" };
    }
};

/**
 * Update order and transaction status atomically (combined single call).
 */
export const updateOrderAndTransactionStatus = async (trackingId, orderStatus, transactionStatus) => {
    try {
        const response = await axios.patch(
            `${ORDER_SERVICE_URL}/confirm-payment`,
            {
                orderTrackingId: trackingId,
                orderStatus,
                transactionStatus
            }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message || "Failed to update order status" };
    }
};

/**
 * Legacy method — kept for backward compatibility.
 */
export const updateTransactionStatus = async (trackingId, transactionStatus) => {
    try {
        const response = await axios.patch(
            `${ORDER_SERVICE_URL}/tracking/${trackingId}/transaction`,
            { transactionStatus }
        );
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error updating transaction status:", error);
        return { success: false, error: error.message || "Failed to update transaction status" };
    }
};

export const getAllPayments = async () => {
    try {
        const response = await axios.get(`${PAYMENT_SERVICE_URL}/all`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error fetching payments:", error);
        return { success: false, error: error.message || "Failed to fetch payments" };
    }
};

export const getAllOrders = async () => {
    try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/all`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error fetching orders:", error);
        return { success: false, error: error.message || "Failed to fetch orders" };
    }
};

export const updateOrderStatus = async (orderId, orderStatus) => {
    try {
        const response = await axios.patch(`${ORDER_SERVICE_URL}/${orderId}`, { orderStatus });
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: error.message || "Failed to update order status" };
    }
};

export const approveFraudOrder = async (orderId) => {
    try {
        const response = await axios.patch(`${ORDER_SERVICE_URL}/${orderId}/approve`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error approving fraud order:", error);
        return { success: false, error: error.message || "Failed to approve fraud order" };
    }
};

export const rejectFraudOrder = async (orderId) => {
    try {
        const response = await axios.patch(`${ORDER_SERVICE_URL}/${orderId}/reject`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error rejecting fraud order:", error);
        return { success: false, error: error.message || "Failed to reject fraud order" };
    }
};

export const getUserOrders = async (email) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE_URL}/user/${email}`);
        return { success: true, data: response.data };
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return { success: false, error: error.message || "Failed to fetch user orders" };
    }
};
