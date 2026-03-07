import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";

function AppLayout(){
    return(
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <NavBar />
            <Outlet />
            <footer className="mt-20 py-10 border-t border-white/10 text-center text-sm text-white/50">
                <p className="mb-4 text-white/60">
                    Connect With me
                </p>
                <div className="flex items-center justify-center gap-6 mb-4">
                    <a  href="https://github.com/ladosky1" 
                        target="_blank"
                        rel="noopener noreferrer"  
                        className="hover:text-white transition">
                        GitHub
                    </a>

                    <a  href="https://instagram.com/laadoosky___" 
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="hover:text-white transition">
                        Instagram
                    </a>

                    <a  href="https://x.com/ladosky__" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:text-white transition">
                        X
                    </a>
                </div>

                <p>© 2026 Ladosky</p>

                <p className="mt-2 text-xs text-white/40">
                    Built with React & Tailwind CSS
                </p>
            </footer>
        </div>
    )
}

export default AppLayout