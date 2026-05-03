import { List, Briefcase } from "phosphor-react";
import Drawer from "./Drawer";
import { useState } from "react";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import { asyncHandler } from "../util/asyncHandler";

function NavBar(){

    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await asyncHandler(
                () => logout(), {
                    loadingMsg: `Logging out...`,
                    successMsg: `Logout successful`
                }
            );
            navigate("/login");
        } catch {
            //handled by toast
        } 
    }

    return(
        <>
        <div className="sticky top-0 z-50 px-4 py-3 bg-slate-900/70 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-20">
                <button 
                    className="text-white"
                    onClick={() => setDrawerOpen(true)}>
                    <List size={24} weight="bold"/>
                </button>

                <div className="flex items-center gap-2">
                    <Briefcase size={22} weight="bold" className="text-orange-400"/>
                    <span className="text-white font-semibold text-lg">
                        JobApplyTracker
                    </span>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    {user && (
                        <>
                            <span className="text-white text-sm">
                                {user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-xs text-red-400">
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>

            <Drawer
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}/>
        </>
    )
}

export default NavBar;