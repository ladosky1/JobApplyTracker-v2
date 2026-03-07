const validateJobUpdate = (req, res, next) => {
    const { company, roles, status, category } = req.body;

    if (company !== undefined && typeof company !== 'string') {
        return res.status(400).json({ error: "Company must be a string." });
    }

    if (roles !== undefined && typeof roles !== 'string') {
        return res.status(400).json({ error: "Roles must be a string." });
    }

    if (status !== undefined && !["applied", "interview", "offer", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value." });
    }

    if (category !== undefined && !["Technology", "Hospitality", "Retails"].includes(category)) {
        return res.status(400).json({ error: "Invalid category value." });
    }

    next();
}

export default validateJobUpdate;