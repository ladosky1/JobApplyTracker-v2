import { Code, ForkKnife, Storefront} from "phosphor-react";
import Category from "../components/Category";
import JobModal from "../components/JobModal";
import { useState } from "react";
import { useJobs } from "../context/JobContext";


function Home(){

    const { jobs, addJob, error, loading } = useJobs();
    const [openModal, setOpenModal] = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    
    const showModal = (category) => {
        setActiveCategory(category)
        setOpenModal(true)
    }

    const techCount = jobs.filter(job => job.category === "Technology").length;
    const hospitalityCount = jobs.filter(job => job.category === "Hospitality").length;
    const retailCount = jobs.filter(job => job.category === "Retails").length;


    return(
        <div 
            className="min-h-screen px-4 sm:px-6 pt-8 sm:pt-16 pb-20">
            
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl text-white/70 font-bold mb-2">
                    Choose Your Focus Category
                </h1>

                <p className="text-white/60 text-sm mb-8 sm:mb-12">
                    Track Applications by industry to stay organized
                </p>
            </div>
            
            <div className="flex flex-col divide-y divide-white/10">
                {openModal && (
                    <JobModal
                        category = {activeCategory} 
                        onClose={() => setOpenModal(false)}
                        onAdd={addJob}/>
                )}
                <div className="animate-fadeUpSoft [animation-delay:0.1s] opacity-0">
                <Category 
                    icon={Code}
                    title="Technology"
                    count={techCount}
                    onAdd={showModal}/>
                </div>

                <div className="animate-fadeUpSoft [animation-delay:0.2s] opacity-0">
                <Category 
                    icon={ForkKnife}
                    title="Hospitality"
                    count={hospitalityCount}
                    onAdd={showModal}/>
                </div>

                <div className="animate-fadeUpSoft [animation-delay:0.3s] opacity-0">
                <Category 
                    icon={Storefront}
                    title="Retails"
                    count={retailCount}
                    onAdd={showModal}/>
                </div>
            </div>
        </div>
    )
}

export default Home;