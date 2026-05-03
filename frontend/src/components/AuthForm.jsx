import { useState } from "react";
import PasswordInput from "./PasswordInput";
import { asyncHandler } from "../util/asyncHandler";

export default function AuthForm({title, submitText, onSubmit, extraText, extraLink, Icon}){
    const [form, setForm] = useState({ name: "", email: "", password: ""});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(loading) return;

        setLoading(true);

        try {
            await asyncHandler(() => onSubmit(form), {
                loadingMsg: `${title} in progress...`,
                successMsg: `${title} successful`,
            });
        } finally{
            setLoading(false);
        }
    };

    return(
        <div className="w-full max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
                {Icon && <Icon size={26} weight="fill" className="text-orange-400" />}
                <h1 className="text-xl font-bold text-white">{title}</h1>
            </div>

            <p className="text-center text-sm text-white/70 mb-6">
                {submitText} your account
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {form.hasOwnProperty("name") && title === "Register" && (
                    <input 
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="rounded-lg px-3 py-2 bg-white/20 text-white placeholder-white/60 outline-none"/>
                )}

                <input 
                    type="text"
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="rounded-lg px-3 py-2 bg-white/20 text-white placeholder-white/60 outline-none"/>
                
                <PasswordInput value={form.password} onChange={handleChange}/>
                
                <button
                    type="submit"
                    disabled={loading}
                    className={`mt-2 py-2 rounded-lg font-medium transition
                                ${loading 
                                    ? "bg-orange-500/50 cursor-not-allowed"
                                    : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                    {loading ? `Loading...` : submitText}
                </button>
            </form>

            <p className="text-xs text-center text-white/60 mt-4">
                {extraText} {""}
                {extraLink}
            </p>
        </div>
    )
}