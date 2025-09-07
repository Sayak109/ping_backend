import { Request, Response } from "express";
import { signUpService, signInService } from "../service/auth.service";
import { error, success } from "../helper/response.helper";
import { generateToken } from "../helper/common.helper";

interface AuthenticatedRequest extends Request {
  user?: {
    email: string;
    id: string;
  };
}

export async function signIn(req: Request, res: Response): Promise<Response> {
  try {
    const result = await signInService(req.body);

    const token = await generateToken({
      email: result.data.email,
      id: result.data._id,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return error(res, 400, err.message || "Failed to login");
  }
}

export async function signUp(req: Request, res: Response): Promise<Response> {
  try {
    const result = await signUpService(req.body);

    if (result.code !== 200) {
      return res.status(result.code).json(result);
    }

    const token = await generateToken({
      email: result.data.email,
      id: result.data._id,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json(result);
  } catch (err) {
    return error(res, 400, "Failed to Sign up");
  }
}

export async function logout(req: Request, res: Response): Promise<Response> {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return res.status(200).json(success("Logged out successfully"));
  } catch (err) {
    return error(res, 400, "Failed to logout.");
  }
}

export async function googleLogin(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const { credential } = req.body as { credential?: string };

    if (!credential) {
      return error(res, 400, "Google credential is required");
    }

    // For now, return a placeholder response
    // You can implement the actual Google login logic later
    return error(res, 501, "Google login not implemented yet");
  } catch (err) {
    console.error("Google login controller error:", err);
    return error(res, 400, "Failed to login with Google");
  }
}
