import jwt from "jsonwebtoken";
import crypto from "crypto";

// =======================
// JTI GENERATOR
// =======================
export const generateJti = () => crypto.randomUUID();

// =======================
// ACCESS TOKEN
// =======================
export const signAccessToken = ({ userId, tokenVersion, jti }) => {
    if (!userId || !jti || tokenVersion === undefined || tokenVersion === null) {
        throw new Error("userId, tokenVersion, and jti are required to sign access token");
    }

    return jwt.sign(
        { userId, tokenVersion, jti },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

// =======================
// REFRESH TOKEN
// =======================
export const signRefreshToken = ({ userId, tokenVersion, jti }) => {
    if (!userId || !jti || !tokenVersion) {
        throw new Error("userId, tokenVersion, and jti are required to sign refresh token");
    }

    return jwt.sign(
        { userId, tokenVersion, jti },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        }
    );
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};
