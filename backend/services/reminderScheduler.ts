import Opportunity, {
    type IOpportunity,
} from "../model/Opportunity.js";
import type { QueryFilter } from "mongoose";
import User from "../model/User.js";
import { sendFollowUpReminderEmail } from "./emailService.js";
import {
    TERMINAL_JOB_STATUSES,
    TERMINAL_GIG_STATUSES,
} from "../utils/opportunityConstants.js";

const SCHEDULER_INTERVAL = 60 * 1000;
const CLAIM_LEASE_DURATION = 5 * 60 * 1000;
const MAX_REMINDER_AGE = 24 * 60 * 60 * 1000;
const MAX_REMINDER_ATTEMPTS = 3;
const BATCH_SIZE = 50;

let isProcessing = false;

const releaseClaim = async (
    opportunityId: string,
    claimedAt: Date,
): Promise<void> => {
    await Opportunity.updateOne(
        {
            _id: opportunityId,
            followUpEmailClaimedAt: claimedAt,
        },
        {
            $set: {
                followUpEmailClaimedAt: null,
            },
        },
    );
};

const processDueReminders = async (): Promise<void> => {
    // Prevent overlapping executions in this server process.
    if (isProcessing) return;

    isProcessing = true;

    try {
        const now = new Date();

        const oldestAllowedReminder = new Date(
            now.getTime() - MAX_REMINDER_AGE,
        );

        const leaseExpiredAt = new Date(
            now.getTime() - CLAIM_LEASE_DURATION,
        );

        const activeStatusFilter: QueryFilter<IOpportunity> = {
            $or: [
                {
                    type: "job",
                    status: {
                        $nin: [...TERMINAL_JOB_STATUSES],
                    },
                },
                {
                    type: "gig",
                    status: {
                        $nin: [...TERMINAL_GIG_STATUSES],
                    },
                },
            ],
        };
        // Find due reminders that are still eligible for processing.
        const candidates = await Opportunity.find({
            followUpAt: {
                $gt: oldestAllowedReminder,
                $lte: now,
            },
            followUpEmailSentAt: null,
            followUpEmailAttempts: {
                $lt: MAX_REMINDER_ATTEMPTS,
            },
            $and: [
                activeStatusFilter,
                {
                    $or: [
                        { followUpEmailClaimedAt: null },
                        {
                            followUpEmailClaimedAt: {
                                $lte: leaseExpiredAt,
                            },
                        },
                    ],
                },
            ],
        })
            .select("_id")
            .sort({ followUpAt: 1, _id: 1 })
            .limit(BATCH_SIZE)
            .lean();

        for (const candidate of candidates) {
            const claimedAt = new Date();

            try {
                // Atomically claim the reminder and increment its attempt count.
                const claimedOpportunity =
                    await Opportunity.findOneAndUpdate(
                        {
                            _id: candidate._id,
                            followUpAt: {
                                $gt: oldestAllowedReminder,
                                $lte: claimedAt,
                            },
                            followUpEmailSentAt: null,
                            followUpEmailAttempts: {
                                $lt: MAX_REMINDER_ATTEMPTS,
                            },
                            $and: [
                                activeStatusFilter,
                                {
                                    $or: [
                                        { followUpEmailClaimedAt: null },
                                        {
                                            followUpEmailClaimedAt: {
                                                $lte: new Date(
                                                    claimedAt.getTime() -
                                                        CLAIM_LEASE_DURATION,
                                                ),
                                            },
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            $set: {
                                followUpEmailClaimedAt: claimedAt,
                            },
                            $inc: {
                                followUpEmailAttempts: 1,
                            },
                        },
                        { new: true },
                    );

                // Another worker may have claimed it first.
                if (!claimedOpportunity) continue;

                // Recheck ownership, reminder age, and opportunity status.
                const currentOpportunity = await Opportunity.findOne({
                    _id: claimedOpportunity._id,
                    followUpEmailClaimedAt: claimedAt,
                    followUpEmailSentAt: null,
                    followUpAt: {
                        $gt: oldestAllowedReminder,
                        $lte: new Date(),
                    },
                    $and: [activeStatusFilter],
                }).lean();

                if (!currentOpportunity?.followUpAt) {
                    await releaseClaim(
                        candidate._id.toString(),
                        claimedAt,
                    );

                    continue;
                }

                const user = await User.findById(
                    currentOpportunity.user,
                )
                    .select("name email")
                    .lean();

                if (!user) {
                    console.error(
                        `Reminder skipped: user not found for opportunity ${candidate._id}.`,
                    );

                    // Keep the claim until its lease expires.
                    // The attempt still counts toward the retry limit.
                    continue;
                }

                await sendFollowUpReminderEmail(user.email, {
                    name: user.name,
                    opportunityTitle: currentOpportunity.title,
                    organizationName:
                        currentOpportunity.organizationName,
                    type: currentOpportunity.type,
                    followUpDate:
                        currentOpportunity.followUpAt.toISOString(),
                });

                const result = await Opportunity.updateOne(
                    {
                        _id: currentOpportunity._id,
                        followUpEmailClaimedAt: claimedAt,
                        followUpEmailSentAt: null,
                        followUpAt: currentOpportunity.followUpAt,
                    },
                    {
                        $set: {
                            followUpEmailSentAt: new Date(),
                            followUpEmailClaimedAt: null,
                        },
                    },
                );

                if (result.modifiedCount !== 1) {
                    console.warn(
                        `Reminder email accepted, but delivery state was not updated for opportunity ${candidate._id}. A duplicate may occur on retry.`,
                    );

                    continue;
                }

                console.log(
                    `Follow-up reminder sent for opportunity ${candidate._id}.`,
                );
            } catch (error) {
                console.error(
                    `Reminder attempt failed for opportunity ${candidate._id}:`,
                    error,
                );

                // Keep the claim until its lease expires.
                // This avoids an immediate retry when SMTP's delivery
                // outcome is uncertain.
                //
                // The attempt count was already incremented when claimed.
                // Once it reaches MAX_REMINDER_ATTEMPTS, it won't be
                // selected again.
            }
        }
    } catch (error) {
        console.error(
            "Reminder scheduler execution failed:",
            error,
        );
    } finally {
        isProcessing = false;
    }
};

export const startReminderScheduler = (): NodeJS.Timeout => {
    console.log("Reminder scheduler started.");

    void processDueReminders();

    return setInterval(() => {
        void processDueReminders();
    }, SCHEDULER_INTERVAL);
};