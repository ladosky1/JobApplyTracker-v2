import { useAuth } from "../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase } from "phosphor-react";
import Glass from "../components/Glass";
import AuthForm from "../components/AuthForm";

function Register(){
    const { register } = useAuth();
    const navigate = useNavigate(); 

    const handleRegister = async (form) => {    
        await register(form);
        navigate("/home");
    };

    return(
        <div className="min-h-[100dvh] flex items-center justify-center px-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Glass>
                <AuthForm
                    title="Register"
                    submitText="Register"
                    onSubmit={handleRegister}
                    extraText="Already have an account?"
                    extraLink={<Link to="/login" className="text-orange-400"> Login </Link>}
                    Icon={Briefcase}/>
            </Glass>
        </div>
    )
}

export default Register;