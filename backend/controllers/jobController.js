import Job from "../model/Job.js";

export const createJob = async (req, res, next) => {
    try {
        const job = await Job.create({...req.body, user: req.user._id});
        res.status(201).json(job);
    } catch (error) {
        next(error);
    }
}

export const getJobs = async (req, res, next) => {
    try {
        const job = await Job.find({ user: req.user._id });
        res.json(job);
    } catch (error) {
        next(error);
    }
}

export const getJobById = async (req, res, next) => {
    try {
        const job = await Job.findById(req.params.id);

        if(!job || job.user.toString() !== req.user.id.toString()) {
            return res.status(404).json({message: "Job not found"})
        };

        res.json(job);
    } catch (error) {
        next(error);
    }
}

export const updateJob = async (req, res, next) => {
    try {
        const job = await Job.findByIdAndUpdate(
            {_id: req.params.id, user: req.user._id},
            req.body,
            {returnDocument: 'after', runValidators: true}
        );

        if(!job || job.user.toString() !== req.user.id.toString()) {
            return res.status(404).json({ message: "Could not update job"})
        };

        res.json(job);
    } catch (error) {
        next(error);
    }
}

export const deleteJob = async (req, res, next) => {
    try {
        const job = await Job.findByIdAndDelete({_id: req.params.id, user: req.user._id});

        if(!job || job.user.toString() !== req.user.id.toString()) {
            return res.status(404).json({message: "Job not found"});
        };

        res.json({message: "Job deleted successfully"});
    } catch (error) {
        next(error);
    }
}

