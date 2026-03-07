import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }){
    const { user, loading } = useAuth();

    if(loading){
        return null;
    }
    
    if(!user){
        return <Navigate to="/login" replace/>
    }

    return children;
}

export default ProtectedRoute;