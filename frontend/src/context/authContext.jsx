import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if(!token){
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const res = await API.get("/auth/me");
                setUser(res.data);
            } catch(err) {
                localStorage.removeItem("token");
                setUser(null);
            } finally{
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    const login = async (form) => {
        const res = await API.post("/auth/login", form);
        
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
    }

    const register = async (form) => {
        const res = await API.post("/auth/register", form);

        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
    }

    const logout = async () => {
        localStorage.removeItem("token");
        setUser(null);
    }

    return(
        <AuthContext.Provider value={{user, login, register, logout, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(){
    return useContext(AuthContext);
}