import jwt from "jsonwebtoken";
import { promisify } from "util";

import {UNAUTHORIZED, INTERNAL_SERVER_ERROR} from "../constants/httpStatus.js"
import {API_SECRET} from "../constants/secrets.js";
import AuthException from "./AuthException.js";

const bearer = "bearer ";

export default async (req, res, next) => {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new AuthException(UNAUTHORIZED, "Access token was not informed!");
        }
        let accessToken = authorization;
        if (accessToken.toLowerCase().includes(bearer)) {
            accessToken = accessToken.split(" ")[1]; 
        }
        const decoded = await promisify(jwt.verify)(
            accessToken,
            API_SECRET
        );
        req.authUser = decoded.authUser;
        return next();
    } catch (error) {
        return res.status(error.status).json({
            status: error.status ? error.status : INTERNAL_SERVER_ERROR,
            message: error.message,
        });
    }

};