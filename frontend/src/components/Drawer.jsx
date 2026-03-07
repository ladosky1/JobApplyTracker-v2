import { Link, useLocation } from "react-router-dom";
import { House, Briefcase } from "phosphor-react";
import { useJobs } from "../context/JobContext";

function Drawer({isOpen, onClose}){

    const location = useLocation();
    const {jobs} = useJobs();

    const isActive = (path) => location.pathname === path;

    return(
        <>
            
            <div
                className={`
                            fixed inset-0 bg-black/50 z-40
                            backdrop-blur-sm transition-opacity duration-300
                            ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                onClick={onClose}/>
            

            <div
                className={`
                            fixed top-0 left-0 h-full w-72
                            bg-slate-950/95 backdrop-blur-xl shadow-2xl
                            border-r border-white/10
                            z-50 transform transition-transform duration-300 ease-out
                            ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <div className="p-5 flex flex-col gap-6">
                    <div className="flex items-center gap-2">
                        <Briefcase size={22} weight="bold" className="text-orange-400"/>
                        <span className="text-white font-semibold text-lg">
                            JobApplyTracker
                        </span>
                    </div>

                    <nav className="flex flex-col gap-4">
                        <Link 
                            to="/home"
                            onClick={onClose}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg
                                    ${isActive("/home") ? "bg-white/10 text-white" : "text-white/70"}`}>
                            <House size={22}/>
                            Home
                        </Link>

                        <Link
                            to="/myjobs"
                            onClick={onClose}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200
                                    ${isActive("/myjobs") ? "bg-white/10 text-white" : "text-white/70"}`}>
                            <div className="flex items-center gap-3">
                                <Briefcase size={22}/>
                                 My Jobs
                            </div>
                            {jobs.length > 0 && (
                                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                                    {jobs.length}
                                </span>
                            )}                            
                        </Link>

                    </nav>
                </div>
            </div>
        </>
    )
}

export default Drawer