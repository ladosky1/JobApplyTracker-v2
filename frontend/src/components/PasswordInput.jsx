import { Eye, EyeSlash } from "phosphor-react";
import { useState } from "react";

function PasswordInput({value, onChange}){
    const [show, setShow] = useState(false);

    return(
        <div className="relative">
            <input 
                type={show ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={value}
                onChange={onChange}
                required
                className="rounded-lg px-3 py-2 bg-white/20 text-white placeholder-white/60 outline-none w-full pr-10"/>
            <button
                type="button"
                onClick={() =>  setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                {show ? <EyeSlash size={20} weight="bold" className="text-orange-400"/> : <Eye size={20} weight="bold" className="text-orange-400"/>}
            </button>
        </div>
    )
}

export default PasswordInput;