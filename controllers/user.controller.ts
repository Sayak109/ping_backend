import { Request, Response } from "express";
import { error, success } from "../helper/response.helper";
import { getUserSearchService } from "../service/user.service";

export async function getUserInfo(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const user = req.user;

    return res.status(200).json(success("User found", user));
  } catch (err) {
    return error(res, 400, "User not found");
  }
}

export async function getUserSearch(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const user_id = req?.user?._id;
    const result = await getUserSearchService(user_id, req.body);

    return res.status(200).json(result);
  } catch (err) {
    return error(res, 400, "No user found");
  }
}
