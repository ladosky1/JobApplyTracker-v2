import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

const hashCode = (code: string): Buffer => {
    const secret = process.env.AUTH_CODE_SECRET;

    if (!secret) {
        throw new Error("AUTH_CODE_SECRET is not configured");
    }

    const hash = createHmac("sha256", secret)
        .update(code)
        .digest("hex");

    return Buffer.from(hash, "hex");
};

export const generateVerificationCode = (): string => {
    return randomInt(100000, 1000000).toString();
};

export const hashVerificationCode = (code: string): string => {
    return hashCode(code).toString("hex");
};

export const verifyVerificationCode = (
    code: string,
    storedHash: string,
): boolean => {
    const submittedHash = hashCode(code);
    const savedHash = Buffer.from(storedHash, "hex");

    if (submittedHash.length !== savedHash.length) {
        return false;
    }

    return timingSafeEqual(submittedHash, savedHash);
};