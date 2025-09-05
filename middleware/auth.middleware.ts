import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import userModel from "../database/models/user.model";
import { error } from "../helper/response.helper";

declare global {
  namespace Express {
    interface Request {
      user?: Record<string, any>;
    }
  }
}

async function getUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return error(res, 401, "Unauthorized - Token not found");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload & {
      email?: string;
      id?: string;
    };

    if (!decoded?.email || !decoded?.id) {
      return error(res, 401, "Unauthorized - Invalid token payload");
    }
    const userInfo = await userModel.findOne({ email: decoded.email, _id: decoded.id });
    if (!userInfo) {
      return error(res, 401, "Unauthorized - User not found");
    }

    const { password: _, ...user } = userInfo.toObject();
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return error(res, 401, "Unauthorized - Invalid token");
  }
}

export default getUser;
