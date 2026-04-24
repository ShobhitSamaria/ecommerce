import axios from "axios";

const PAYMENT_SERVICE_URL = "http://localhost:8084/api/payments";
const ORDER_SERVICE_URL = "http://localhost:8085/api/orders";

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
