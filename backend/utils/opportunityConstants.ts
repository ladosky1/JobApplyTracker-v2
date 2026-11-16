export const JOB_STATUSES = [
    "saved", 
    "applied", 
    "interview", 
    "offer", 
    "accepted", 
    "rejected", 
    "withdrawn"] as const;

export const GIG_STATUSES = [
    "lead", 
    "contacted", 
    "negotiating", 
    "in_progress", 
    "completed", 
    "declined", 
    "cancelled"] as const;

export const TERMINAL_JOB_STATUSES = [
    "accepted",
    "rejected",
    "withdrawn",
] as const;

export const TERMINAL_GIG_STATUSES = [
    "completed",
    "declined",
    "cancelled",
] as const;