
function StatusBadge({ status }) {
    const base = "px-3 py-1 text-xs font-medium rounded-full";

    const styles = {
        applied: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
        interview: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
        rejected: "bg-red-500/20 text-red-300 border border-red-500/30",
        offer: "bg-green-500/20 text-green-300 border border-green-500/30"
    }

    return(
        <span className={`${base} ${styles[status] || styles.applied}`}>
            {status}
        </span>
    )
}

export default StatusBadge;