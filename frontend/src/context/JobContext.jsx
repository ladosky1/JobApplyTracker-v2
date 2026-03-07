import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios.js";
import { useAuth } from "../context/authContext";

const JobContext = createContext();

export function JobProvider({children}){

    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        if(!user) return;

        const fetchJobs = async () => {
            try {
                const res = await API.get("/jobs");
                setJobs(res.data);
            } catch (err) {
                console.error("Failed to fetch jobs:", err);
            }
        }

        fetchJobs();
    }, [user]);

    const addJob = async (job) => {
        try {
            const res = await API.post("/jobs", job);
            setJobs(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Failed to add job:", error);
        }
    }

    const deleteJob = async (_id) => {
        try {
            await API.delete(`/jobs/${_id}`);
            setJobs(prev => prev.filter(job => job._id !== _id));
        } catch (error) {
            console.error("Failed to delete job:", error);
        }
    }

    const updateJob = async (_id, updates) => {
        try {
            const res = await API.put(`/jobs/${_id}`, updates);
            setJobs(prev => 
                            prev.map(job => 
                                job._id === _id ? res.data : job));
        } catch (error) {
            console.error("Failed to update job:", error);
        }
    }

    return(
        <JobContext.Provider value={{ jobs, addJob, deleteJob, updateJob }}>
            {children}
        </JobContext.Provider>
    )
}

export function useJobs(){
    return useContext(JobContext);
}