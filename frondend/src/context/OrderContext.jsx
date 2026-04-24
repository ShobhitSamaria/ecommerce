import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const OrderContext = createContext();

export function OrderProvider({ children }) {
    const { user } = useAuth();
    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem("orders");
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    // Save orders to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("orders", JSON.stringify(orders));
    }, [orders]);

    // Add a new order
    const addOrder = (orderData) => {
        const newOrder = {
            id: Math.random().toString(36).substr(2, 9),
            userId: user?.id,
            ...orderData,
            createdAt: new Date().toISOString(),
            status: "Processing",
        };
        setOrders((prevOrders) => [newOrder, ...prevOrders]);
        return newOrder;
    };

    // Get user's orders
    const getUserOrders = () => {
        if (!user) return [];
        return orders.filter((order) => order.userId === user.id);
    };

    // Get single order by ID
    const getOrderById = (orderId) => {
        return orders.find((order) => order.id === orderId);
    };

    // Update order status
    const updateOrderStatus = (orderId, status) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order.id === orderId ? { ...order, status } : order
            )
        );
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder, getUserOrders, getOrderById, updateOrderStatus }}>
            {children}
        </OrderContext.Provider>
    );
}

export function useOrders() {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error("useOrders must be used within OrderProvider");
    }
    return context;
}
