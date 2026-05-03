import { List, Briefcase, SignOut } from "phosphor-react";
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
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                <button 
                    className="text-white p-1 hover:bg-white/10 rounded-lg transition"
                    onClick={() => setDrawerOpen(true)}>
                    <List size={24} weight="bold"/>
                </button>

                <div className="flex items-center gap-2">
                    <Briefcase size={22} weight="bold" className="text-orange-400 shrink-0"/>
                    <span className="text-white font-semibold text-lg">
                        JobApplyTracker
                    </span>
                </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {user && (
                        <>
                            <span className="text-white text-sm font-medium">
                                {user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 px-3 py-1
                                         bg-red-500/10 hover:bg-red-500/20 text-red-400
                                         hover:text-red-300 text-xs sm:text-sm font-medium rounded-lg
                                         border border-red-500/20 transtion">
                            <SignOut size={16} weight="bold" className="sm:hidden"/>
                            <span className="hidden sm:block">
                                Logout
                            </span>
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