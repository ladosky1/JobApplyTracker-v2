const validateQuery = (req, res, next) => {
    const {page, limit, status} = req.query;

    if(page && (!Number.isInteger(Number(page)) || Number(page) <= 0)){
        return res.status(400).json({ error: "page must be a positive integer" });
    }

    if(limit && (!Number.isInteger(Number(limit)) || Number(limit) <= 0 || Number(limit) > 100)){
        return res.status(400).json({ error: "limit must be between 1 and 100" });
    }

    const validStatus = ['applied', 'interview', 'offer', 'rejected'];

    if(status && !validStatus.includes(status)){
        return res.status(400).json({ error: `status must be one of ${validStatus.join(', ')}` });
    }

    next();
}

export default validateQuery;