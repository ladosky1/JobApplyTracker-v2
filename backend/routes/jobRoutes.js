import express from "express";
import validateJob from "../middleware/validateJob.js";
import validateQuery from "../middleware/validateQuery.js";
import validateJobUpdate from "../middleware/validateJobUpdate.js";
import protect from "../middleware/authMiddleware.js";
import { 
        createJob, 
        getJobs, 
        getJobById,
        updateJob,
        deleteJob } from "../controllers/jobController.js";

const router = express.Router();

router.post('/', protect, validateJob, createJob);
router.get('/', protect, validateQuery, getJobs);
router.get('/:id', protect, validateQuery, getJobById);
router.put('/:id', protect, validateJobUpdate, updateJob);
router.delete('/:id', protect, deleteJob);



export default router;