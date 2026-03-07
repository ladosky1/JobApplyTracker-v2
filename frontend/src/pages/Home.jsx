import { Code, ForkKnife, Storefront} from "phosphor-react";
import Category from "../components/Category";
import JobModal from "../components/JobModal";
import { useState,} from "react";
import { useJobs } from "../context/JobContext";


function Home(){

    const { jobs, addJob } = useJobs();
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
            className="min-h-screen px-6 pt-16 pb-20">
            
            <h1 className="text-xl text-white/70 font-bold mb-12">
                Choose Your Focus Category
            </h1>
            
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