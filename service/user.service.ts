import Message from "../database/models/message.model";
import User from "../database/models/user.model";
import { success } from "../helper/response.helper";
import mongoose from "mongoose";

async function getUserSearchService(
  user_id: string,
  body: { search?: string }
) {
  try {
    const { search } = body;
    const searchCondition = search
      ? {
          $or: [
            { full_name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({
      _id: { $ne: user_id },
      ...searchCondition,
    })
      .select("_id full_name")
      .lean();

    const formattedUsers = users.map((u) => ({
      _id: u._id,
      name: u.full_name,
    }));
    const data = {
      Users: formattedUsers,
      Count: users.length,
    };
    return success("User found", data);
  } catch (err: any) {
    throw new Error(err.message || "No user found");
  }
}

export { getUserSearchService };
