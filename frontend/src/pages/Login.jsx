import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase } from "phosphor-react";
import Glass from "../components/Glass";
import AuthForm from "../components/AuthForm";

function Login(){
    const { login } = useAuth();
    const navigate = useNavigate(); 

    const handleLogin = async (form) => {
        await login(form);
        navigate("/home");
    };

    return(
        <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Glass>
                <AuthForm
                    title="Login"
                    submitText="Login"
                    onSubmit={handleLogin}
                    extraText="Don't have an account?"
                    extraLink={<Link to="/register" className="text-orange-400">Register</Link>}
                    Icon={Briefcase}/>
            </Glass>
        </div>
    )
}

export default Login;