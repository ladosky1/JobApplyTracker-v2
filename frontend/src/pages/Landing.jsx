import { Link } from "react-router-dom";
import { ArrowRight, Briefcase} from "phosphor-react";
import Glass from "../components/Glass";
import illustration from "../assets/landing-illustration.svg"

function Landing(){

    return(
        <div className="h-[100dvh] flex items-center justify-center px-6 text-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="animate-fadeInUp">
            <Glass>
            <div className="max-w-sm mx-auto">
                <img
                    src={illustration}
                    alt="Job Illustration"
                    className="w-48 mx-auto mb-6 opacity-0  animate-fadeInUp"
                    style={{ animationDelay: "0.2s"}}/>

                <h1 className="text-3xl font-bold tracking-tighter text-white flex items-center justify-center gap-2">
                    <Briefcase size={30} weight="fill" className="text-orange-400"/>
                    JobApplyTracker
                </h1>

                <p className="mt-4 text-sm leading-relaxed text-white/80">
                    Track your Job Applications, Stay organized and never lose sight
                    of your progress.
                </p>

                <Link 
                    to="/login"
                    className="
                                flex
                                items-center 
                                justify-center 
                                mt-8 w-16 h-16 rounded-full 
                                bg-orange-500
                                text-white 
                                shadow-lg
                                animate-pulseSoft
                                mx-auto">
                    <ArrowRight 
                        size={24} 
                        weight="bold"/>
                </Link>
            </div>
            </Glass>
            </div>

            <div className="absolute bottom-4 text-xs text-white/40 tracking-wide">
                &copy; 2026 Ladosky. All rights reserved.
            </div>
        </div>
    )
}

export default Landing;