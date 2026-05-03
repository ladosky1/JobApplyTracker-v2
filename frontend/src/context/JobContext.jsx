import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios.js";
import { useAuth } from "../context/authContext";

const JobContext = createContext();

export function JobProvider({children}){

    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState({
        fetch: false,
        add: false,
        update: false,
        delete: false,
    })

    const getErrorMessage = (error) => 
        error.response?.data?.message || error.message || "something went wrong";

    useEffect(() => {
        if(!user) return;

        const fetchJobs = async () => {

            setLoading(prev => ({
                ...prev,
                fetch: true
            }));
            setError(null);

            try {
                const res = await API.get("/jobs");
                setJobs(res.data);
            } catch (err) {
                const message = getErrorMessage(err);
                setError(message);
            } finally {
                setLoading(prev => ({
                    ...prev,
                    fetch: false
                }))
            }
        }

        fetchJobs();
    }, [user]);

    const addJob = async (job) => {
        setLoading(prev => ({ ...prev, add: true }));
        try {
            const res = await API.post("/jobs", job);
            setJobs(prev => [...prev, res.data]);
            return res.data;
        } catch (error) {
            const message = getErrorMessage(error);
            throw new Error(message);
        } finally {
            setLoading(prev=> ({ ...prev, add: false }));
        }
    }

    const deleteJob = async (_id) => {

        setLoading(prev => ({ ...prev, delete: true }));

        try {
            await API.delete(`/jobs/${_id}`);
            setJobs(prev => prev.filter(job => job._id !== _id));
        } catch (error) {
            const message = getErrorMessage(error);
            throw new Error(message);
        } finally{
            setLoading(prev => ({ ...prev, delete: false }));
        }
    }

    const updateJob = async (_id, updates) => {
        setLoading(prev => ({ ...prev, update: true }));
        try {
            const res = await API.put(`/jobs/${_id}`, updates);
            setJobs(prev => 
                            prev.map(job => 
                                job._id === _id ? res.data : job));
            return res.data;
        } catch (error) {
            const message = getErrorMessage(error);
            throw new Error(message);
        } finally {
            setLoading(prev => ({ ...prev, update: false }));
        }
    }

    return(
        <JobContext.Provider value={{ jobs, addJob, deleteJob, updateJob, loading, error }}>
            {children}
        </JobContext.Provider>
    )
}

export function useJobs(){
    return useContext(JobContext);
}