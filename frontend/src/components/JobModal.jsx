import { JOB_ROLES, JOB_STATUSES } from "../data/jobConfig";
import Glass from "./Glass";
import { useState } from "react";

function JobModal({ category, onClose, onAdd, onUpdate, job }){

    const [company, setCompany] = useState(job?.company ?? "");
    const [roles, setRoles] = useState(job?.roles ?? "");
    const [status, setStatus] = useState(job?.status ?? "");
    const [note, setNote] = useState(job?.note ?? "");
    const [error, setError] = useState("");

    return(
        <div
            className="fixed inset-0 z-[100] 
                        bg-black/60 backdrop-blur-sm 
                        transition-opacity duration-300 
                        overflow-y-auto">
            <div className="min-h-full flex items-center justify-center px-4
                            transform transition-all duration-300 scale-100 opacity-100">
            <Glass>
                <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto">
                    <p className="text-xs text-white/70 mb-1">
                        Category: {category}
                    </p>
                    <h2 className="text-white font-semibold text-center mb-4">
                        {job ? "Edit Job" : "Add Job"}
                    </h2>

                    <form 
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                            e.preventDefault();

                            if(!company || !roles || !status){
                                setError("Please Fill in all required field")
                                return
                            }

                            setError("")

                            const payload = ({
                                    company, 
                                    roles, 
                                    status, 
                                    note, 
                                    category});
                            
                            if(job){
                                onUpdate(job._id, payload);
                            } else {
                                onAdd(payload);
                            }

                            onClose();
                        }}
                    >
                        <input 
                            type="text"
                            placeholder="CompanyName"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="rounded-lg px-3 py-2 bg-white/20 text-white placeholder-white/60 outline-none" />
                        
                        <select 
                            value={roles}
                            onChange={(e) => setRoles(e.target.value)}
                            className="rounded-lg px-3 py-2 bg-white/20 text-white outline-none">
                            <option value="">Select Role</option>
                            {JOB_ROLES[category]?.map(role => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>

                        <select 
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg px-3 py-2 bg-white/20 text-white outline-none">
                            <option value="">Select Status</option>
                            {JOB_STATUSES.map(status => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>

                        <textarea
                            placeholder="notes"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows="3"
                            className="rounded-lg px-3 py-2 bg-white/20 text-white placeholder-white/60 outline-none"/>
                        
                        {error && (
                            <p className="text-xs text-red-500">
                                {error}
                            </p>
                        )}
                        <div className="flex gap-3 mt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 rounded-lg bg-white/20 text-white">
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="flex-1 py-2 rounded-lg bg-orange-500 text-white">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </Glass>
            </div>
        </div>
    )
}

export default JobModal