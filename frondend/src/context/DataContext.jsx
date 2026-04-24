import { createContext, useContext, useState, useEffect } from "react";
import { fetchAllProducts, createProduct, removeProduct } from "../services/productService";
import { getAllOrders } from "../services/orderService";
import { getAllPayments } from "../services/paymentService";

const DataContext = createContext();

export function DataProvider({ children }) {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);

    const loadProducts = async () => {
        try {
            const data = await fetchAllProducts();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    const loadOrders = async () => {
        try {
            const result = await getAllOrders();
            if (result.success) {
                setOrders(result.data);
            }
        } catch (err) {
            console.error("Failed to fetch orders", err);
        }
    };

    const loadPayments = async () => {
        try {
            const result = await getAllPayments();
            if (result.success) {
                setPayments(result.data);
            }
        } catch (err) {
            console.error("Failed to fetch payments", err);
        }
    };

    const refreshData = async () => {
        await Promise.all([loadProducts(), loadOrders(), loadPayments()]);
    };

    useEffect(() => {
        refreshData();
    }, []);

    const addProduct = async (formPayload) => {
        try {
            setLoading(true);
            await createProduct(formPayload);
            await loadProducts();
            return { success: true };
        } catch (err) {
            return { success: false, error: "Failed to add product" };
        } finally {
            setLoading(false);
        }
    };

    const deleteProduct = async (id) => {
        try {
            await removeProduct(id);
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert("Error deleting product");
        }
    };

    const addPayment = (payment) => {
        setPayments(prev => [...prev, payment]);
    };

    const updateOrderInList = (updatedOrder) => {
        setOrders(prev => prev.map(order => 
            order.id === updatedOrder.id ? updatedOrder : order
        ));
    };

    return (
        <DataContext.Provider value={{ 
            products, 
            orders,
            addProduct, 
            deleteProduct, 
            loadProducts,
            loadOrders,
            refreshData,
            payments,
            addPayment,
            updateOrderInList
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() { return useContext(DataContext); }
