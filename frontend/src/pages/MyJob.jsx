import { useState } from "react";
import JobCard from "../components/JobCard";
import JobModal from "../components/JobModal";
import { useJobs } from "../context/JobContext";
import { asyncHandler } from "../util/asyncHandler";

function MyJobs(){

    const { jobs, deleteJob, updateJob, error, loading } = useJobs();
    const [editingJob, setEditingJob] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [search, setSearch] = useState("");

    const normalizedSearch = search.trim().toLowerCase();

    const filteredJobs = jobs.filter(job => {
        const statusMatch = 
            statusFilter === "all" || job.status === statusFilter;

        const categoryMatch = 
            categoryFilter === "all" || job.category === categoryFilter;
        
        const searchMatch = 
            normalizedSearch === "" || job.company.toLowerCase().includes(normalizedSearch);

        return statusMatch && categoryMatch && searchMatch;
    })

    const resetFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setCategoryFilter("all");
    }

    const hasActiveFilters = 
        search !== "" || 
        statusFilter !== "all" || 
        categoryFilter !== "all";

    const handleDelete = async (id) => {
        try {
            if(!window.confirm("Delete this job?")) return;
            
            await asyncHandler(
                () => deleteJob(id),
                {
                    loadingMsg: "Deleting job...",
                    successMsg: "Job deleted",
                }
            );
        } catch (err) {
            //handled by toast
        }
    }

    if(loading.fetch){
        return <p>Loading jobs...</p>
    }

    if(error){
        return <p className="text-red-400">{error}</p>
    }

    return(
        <div className="min-h-screen px-6 pt-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Applications</h1>
                <p className="text-sm text-white/60">
                    Track and manage your job applications
                </p>
            </div>
            <div className="flex flex-col gap-3 mb-6">
            <input 
                    type="text"
                    placeholder = "Search by company..."
                    value = {search}
                    onChange = {(e) => setSearch(e.target.value)}
                    className = "w-full mb-3 rounded-lg px-3 py-2 bg-white/20 text-white placeholder-white/60 outline-none"/>
            
            <div className="flex gap-3">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 bg-white/20 text-white outline-none">
                    <option value="all" className="text-black">Status</option>
                    <option value="applied" className="text-black">Applied</option>
                    <option value="interview" className="text-black">Interview</option>
                    <option value="rejected" className="text-black">Rejected</option>
                    <option value="offer" className="text-black">Offer</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 bg-white/20 text-white outline-none">
                    <option value="all" className="text-black">Category</option>
                    <option value="Technology" className="text-black">Technology</option>
                    <option value="Hospitality" className="text-black">Hospitality</option>
                    <option value="Retails" className="text-black">Retails</option>
                </select>
            </div>

            <div className="flex justify-between items-center">
                <p className="text-xs text-white/50">
                    {filteredJobs.length} result{filteredJobs.length !== 1 && "s"} found
                </p>
                <button 
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className={`text-xs transition-colors duration-200
                                    ${hasActiveFilters ? 
                                        "text-white hover:text-orange-400" : 
                                        "text-white/40 cursor-not-allowed"}`}>
                    Clear Filters
                </button>
            </div>
            </div>

            {jobs.length === 0 ? (
                <div className="text-center text-white/60 mt-10">
                    <p className="text-lg font-medium">
                        No Applications yet.
                    </p>
                    <p className="mt-1 text-sm">
                        Start tracking your job search by adding your first application.
                    </p>
                </div>
            ) : filteredJobs.length === 0 ? (
                    <p className="text-white/70 text-sm">
                        No Jobs Match the Selected Filters or Search
                    </p>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredJobs.map(job => (
                        <JobCard 
                            key={job._id} 
                            job={job}
                            onDelete={() => handleDelete(job._id)}
                            onEdit={setEditingJob}/>
                    ))}
                </div>
            )}

            {editingJob && (
                <JobModal
                    job={editingJob}
                    category={editingJob.category}
                    onClose={() => setEditingJob(null)}
                    onUpdate={updateJob}/>
            )}
        </div>
    )
}

export default MyJobs;