import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await API.get("/auth/me");
                setUser(res.data);
            } catch(err) {
                if(err.response?.status !== 401){
                    console.error(err);
                }
                setUser(null);
            } finally{
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    const login = async (form) => {
        const res = await API.post("/auth/login", form);
        setUser(res.data);
    }

    const register = async (form) => {
        const res = await API.post("/auth/register", form);
        setUser(res.data);
    }

    const logout = async () => {
        await API.post("/auth/logout");
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