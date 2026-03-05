import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthTokenPayload } from "../types/auth.types";

export const signToken = (payload: AuthTokenPayload): string =>
    jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as SignOptions);

export const verifyToken = (token: string): AuthTokenPayload => {
    const decoded = jwt.verify(token, env.jwtSecret);
    return decoded as AuthTokenPayload;
};
