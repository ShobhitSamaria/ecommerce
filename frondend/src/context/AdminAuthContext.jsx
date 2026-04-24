import { createContext, useContext, useState, useEffect } from "react";
import {useLocation} from "react-router-dom";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
    const [adminUser, setAdminUser] = useState(null);
    const [loading, setLoading] = useState(true); //To prevent flickering while checking storage

    useEffect(() => {
        const savedAdmin = localStorage.getItem("admin");
        if (savedAdmin) {
            setAdminUser(JSON.parse(savedAdmin));
        }
        setLoading(false);
    }, []);

    const adminLogin = (username, password) => {
        if (username === "admin" && password === "admin") {
            setAdminUser({ username: "admin", role: "admin" });
            return true;
        }
        return false;
    };

    const adminLogout = () => {
        setAdminUser(null);
    };

    return (
        <AdminAuthContext.Provider
            value={{ adminUser, adminLogin, adminLogout }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}
