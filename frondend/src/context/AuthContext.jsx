import { createContext, useContext, useState } from "react";
import { register,login } from "../services/userService.js";
import { useEffect} from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true); //To prevent flickering while checking storage

  useEffect(() => {
    //Re-verify or sync if needed, then stop loading
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  //handle signin with backend API
  const signin = async (email, password) => {
    try {
      const data = await login(email, password);
      setUser({ name: data.fullName, email: data.email });
      localStorage.setItem("token", data.token); // Save JWT for future requests
      localStorage.setItem("user", JSON.stringify({ name: data.fullName, email: data.email }));
      return { success: true };
    } catch (error) {
      //Throw error to be caught by Login.jsx
      throw error;
    }
  };

  // Modified: returning the data so the component can decide what to do next
  const signup = async (name, email, password) => {
    try {
      const data = await register(name, email, password);
      return { success: true, data }; //  return success object
    } catch (error) {
      //  throw the error so the UI can catch and show it
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) return null;

  return (
      <AuthContext.Provider value={{ user, signin, signup, logout }}>
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}