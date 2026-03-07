import { useState } from "react";
import PasswordInput from "./PasswordInput";

export default function AuthForm({title, submitText, onSubmit, extraText, extraLink, Icon}){
    const [form, setForm] = useState({ name: "", email: "", password: ""});
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await onSubmit(form);
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
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
                    className="mt-2 py-2 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition">
                    {submitText}
                </button>

                {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
            </form>

            <p className="text-xs text-center text-white/60 mt-4">
                {extraText} {""}
                {extraLink}
            </p>
        </div>
    )
}