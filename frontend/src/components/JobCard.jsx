import { useState } from "react";
import { JOB_STATUSES } from "../data/jobConfig";
import { useJobs } from "../context/JobContext";
import StatusBadge from "./StatusBadge";

function JobCard({ job, onDelete, onEdit }) {

    const { updateJob } = useJobs();
    const [editingStatus, setEditingStatus] = useState(false);

    return(
        <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
            <div className="flex flex-col gap-1">
                <h3 className="text-white font-semibold text-base">
                    {job.company}
                </h3>

                <p className="text-sm text-white/70">
                    {job.roles}
                </p>

                <div className="flex justify-between text-xs text-white/60 mt-2">
                    <span>{job.category}</span>
                    {editingStatus ? (
                        <select 
                            value={job.status} 
                            onChange={(e) => {
                                updateJob(job._id, { status: e.target.value }); 
                                setEditingStatus(false);}}
                            className="text-xs bg-white/20 text-white/50 rounded px-2 py-1 outline-none"
                            autoFocus>
                            {JOB_STATUSES.map(status => (
                                <option key={status} value={status} className="text-black">
                                    {status}
                                </option>
                            ))}
                        </select> 
                    ): (
                        <span
                            onClick={() => setEditingStatus(true)}
                            className="cursor-pointer hover:scale-105 transition-transform duration-150">
                            <StatusBadge status={job.status}/>
                        </span>
                    ) }
                </div>
                {job.note && (
                    <div className="text-white/80 break-words whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {job.note}
                    </div>
                )}
            <div className="flex justify-end gap-4 mt-4 text-xs">
                <button
                    onClick={() => onEdit(job)}
                    className="text-white/70 hover:text-white transition-colors">
                    Edit
                </button>

                <button
                    onClick={onDelete}
                    className="text-red-400 hover:text-red-300">
                    Delete
                </button>
            </div>
            </div>
        </div>
    )
}

export default JobCard