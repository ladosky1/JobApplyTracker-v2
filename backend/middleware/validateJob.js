const validateJob = (req, res, next) => {
    const { company, roles } = req.body;

    if (!company || !roles ) {
        return res.status(400).json({ error: "Company and roles are required." });
    }
    next();
}

export default validateJob;