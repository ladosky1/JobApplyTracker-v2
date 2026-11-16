import nodemailer from "nodemailer";
import { AppError } from "../errors/AppError.js";

interface AuthEmailContent {
    name: string;
    code: string;
    title: string;
    message: string;
    purpose: "verification" | "password-reset";
}

interface FollowUpReminderEmailContent {
    name: string;
    opportunityTitle: string;
    organizationName?: string;
    type: "job" | "gig";
    followUpDate: string;
}

const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const createAuthEmailTemplate = ({
    name,
    code,
    title,
    message,
    purpose,
}: AuthEmailContent): { html: string; text: string } => {
    const safeName = escapeHtml(name);
    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const safeCode = escapeHtml(code);

    const actionDescription =
        purpose === "verification"
            ? "Verify your email address"
            : "Reset your password";

    const expiryMessage =
        purpose === "verification"
            ? "This verification code expires in 15 minutes."
            : "This password-reset code expires in 15 minutes.";

    const text = [
        `Hello ${name},`,
        "",
        message,
        "",
        `Your code: ${code}`,
        "",
        expiryMessage,
        "",
        "If you did not request this, you can safely ignore this email.",
        "",
        "J&GPursuits",
        "Jobs & Gigs Pursuits",
    ].join("\n");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
        ${safeMessage}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#f4f6f8;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                    style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">

                    <tr>
                        <td style="padding:28px 32px;background:#111827;color:#ffffff;">
                            <p style="margin:0;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                                J&amp;GPursuits
                            </p>
                            <p style="margin:7px 0 0;font-size:13px;color:#cbd5e1;">
                                Jobs &amp; Gigs Pursuits
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 16px;font-size:24px;line-height:1.35;color:#111827;">
                                ${safeTitle}
                            </h1>

                            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;">
                                Hello ${safeName},
                            </p>

                            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#4b5563;">
                                ${safeMessage}
                            </p>

                            <div style="padding:24px 16px;background:#f3fce8;border:1px solid #d9f0bb;border-radius:10px;text-align:center;">
                                <p style="margin:0 0 10px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#4b5563;">
                                    Your ${purpose === "verification" ? "verification" : "password reset"} code
                                </p>

                                <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:8px;color:#245c16;">
                                    ${safeCode}
                                </p>
                            </div>

                            <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                                ${expiryMessage}
                            </p>

                            <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
                                If you did not request this, you can safely ignore this email.
                            </p>

                            <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#4b5563;">
                                Regards,<br />
                                <strong>The J&amp;GPursuits Team</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                            <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;text-align:center;">
                                ${actionDescription} · J&amp;GPursuits
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return { html, text };
};

const createTransporter = () => {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (
        !host ||
        !Number.isInteger(port) ||
        port <= 0 ||
        !user ||
        !pass
    ) {
        throw new Error("SMTP email configuration is incomplete");
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user,
            pass,
        },
    });
};

const sendAuthEmail = async (
    to: string,
    content: AuthEmailContent,
): Promise<void> => {
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

    if (!from) {
        throw new Error("EMAIL_FROM is not configured");
    }

    const transporter = createTransporter();
    const template = createAuthEmailTemplate(content);

    try {
        await transporter.sendMail({
            from,
            to,
            subject: content.title,
            text: template.text,
            html: template.html,
        });
    } catch (error) {
        console.error("Authentication email delivery failed:", error);

        throw new AppError(
            "We could not send the email. Please try again later.",
            503,
        );
    }
};

export const sendVerificationEmail = async (
    email: string,
    name: string,
    code: string,
): Promise<void> => {
    await sendAuthEmail(email, {
        name,
        code,
        title: "Verify your email address",
        message:
            "Welcome to J&GPursuits. Enter the code below to verify your email address and complete your registration.",
        purpose: "verification",
    });
};

export const sendPasswordResetEmail = async (
    email: string,
    name: string,
    code: string,
): Promise<void> => {
    await sendAuthEmail(email, {
        name,
        code,
        title: "Reset your password",
        message:
            "We received a request to reset your J&GPursuits password. Enter the code below to continue.",
        purpose: "password-reset",
    });
};

const formatReminderDate = (date: string): string => {
    const timeZone = process.env.APP_TIME_ZONE || "UTC";

    return new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone,
    }).format(new Date(date));
};

export const sendFollowUpReminderEmail = async (
    to: string,
    content: FollowUpReminderEmailContent,
): Promise<void> => {
    const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

    if (!from) {
        throw new Error("EMAIL_FROM is not configured");
    }

    const safeName = escapeHtml(content.name);
    const safeTitle = escapeHtml(content.opportunityTitle);
    const safeOrganization = escapeHtml(
        content.organizationName || "Not specified",
    );
    const formattedDate = formatReminderDate(content.followUpDate);
    const safeDate = escapeHtml(formattedDate);

    const opportunityType =
        content.type === "job" ? "job opportunity" : "gig";

    const subject = `Follow-up reminder: ${content.opportunityTitle}`;

    const text = [
        `Hello ${content.name},`,
        "",
        "This is a reminder about an opportunity you scheduled for follow-up.",
        "",
        `Opportunity: ${content.opportunityTitle}`,
        `Organization: ${content.organizationName || "Not specified"}`,
        `Type: ${opportunityType}`,
        `Scheduled follow-up: ${formattedDate}`,
        "",
        "Log in to J&GPursuits to review and update your opportunity.",
        "",
        "J&GPursuits",
        "Jobs & Gigs Pursuits",
    ].join("\n");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
        style="background:#f4f6f8;padding:32px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                    style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
                    <tr>
                        <td style="padding:28px 32px;background:#111827;color:#ffffff;">
                            <p style="margin:0;font-size:22px;font-weight:700;">
                                J&amp;GPursuits
                            </p>
                            <p style="margin:7px 0 0;font-size:13px;color:#cbd5e1;">
                                Jobs &amp; Gigs Pursuits
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 16px;font-size:24px;color:#111827;">
                                Your follow-up reminder
                            </h1>

                            <p style="font-size:15px;line-height:1.7;color:#4b5563;">
                                Hello ${safeName},
                            </p>

                            <p style="font-size:15px;line-height:1.7;color:#4b5563;">
                                This is a reminder about an opportunity you scheduled for follow-up.
                            </p>

                            <div style="padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                                <p style="margin:0 0 12px;font-size:12px;color:#6b7280;text-transform:uppercase;">
                                    ${opportunityType}
                                </p>

                                <h2 style="margin:0 0 12px;font-size:20px;color:#111827;">
                                    ${safeTitle}
                                </h2>

                                <p style="margin:0 0 8px;font-size:14px;color:#4b5563;">
                                    Organization: ${safeOrganization}
                                </p>

                                <p style="margin:0;font-size:14px;color:#4b5563;">
                                    Follow-up: ${safeDate}
                                </p>
                            </div>

                            <p style="margin:24px 0 0;font-size:14px;line-height:1.7;color:#4b5563;">
                                Log in to J&amp;GPursuits to review and update your opportunity.
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                            <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                                J&amp;GPursuits · Jobs &amp; Gigs Pursuits
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const transporter = createTransporter();

    try {
        await transporter.sendMail({
            from,
            to,
            subject,
            text,
            html,
        });
    } catch (error) {
        console.error("Follow-up reminder email delivery failed:", error);

        throw new AppError(
            "We could not send the follow-up reminder email.",
            503,
        );
    }
};