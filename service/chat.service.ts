import Message from "../database/models/message.model";
import User from "../database/models/user.model";
import { success } from "../helper/response.helper";
import mongoose from "mongoose";
import { io, userSocketMap } from "../index";
import path from "path";
import fs from "fs";
import cloudinary from "../config/cloudinary.config";

// async function getUserChatsService(user_id: string) {
//   try {
//     const filteredUsers = await User.find({ _id: { $ne: user_id } })
//       .select("-password -__V")
//       .lean();

//     const unseenCounts = await Message.aggregate([
//       {
//         $match: {
//           receiver_id: new mongoose.Types.ObjectId(user_id),
//           seen: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$sender_id",
//           count: { $sum: 1 },
//         },
//       },
//     ]);

//     const unseenMap: Record<string, number> = {};
//     unseenCounts.forEach((u) => {
//       unseenMap[u._id.toString()] = u.count;
//     });

//     const usersWithCounts = filteredUsers.map((u) => ({
//       _id: u._id,
//       name: u.full_name,
//       unseenCount: unseenMap[u._id.toString()] || 0,
//     }));
//     return success("User found", usersWithCounts);
//   } catch (err: any) {
//     throw new Error(err.message || "No user found");
//   }
// }

async function getUserChatsService(user_id: string) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(user_id);
    const currentUserId = userObjectId.toString();

    const chats = await Message.aggregate([
      {
        $match: {
          $or: [{ sender_id: userObjectId }, { receiver_id: userObjectId }],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender_id", userObjectId] },
              "$receiver_id",
              "$sender_id",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
        },
      },
    ]);

    const unseenCounts = await Message.aggregate([
      {
        $match: {
          receiver_id: userObjectId,
          seen: false,
        },
      },
      {
        $group: {
          _id: "$sender_id",
          count: { $sum: 1 },
        },
      },
    ]);

    const unseenMap: Record<string, number> = {};
    unseenCounts.forEach((u) => {
      unseenMap[u._id.toString()] = u.count;
    });

    const chatUserIds = chats.map((c) => c._id);
    const usersWithChats = await User.find({ _id: { $in: chatUserIds } })
      .select("_id full_name image")
      .lean();

    const result = usersWithChats.map((u) => {
      const chat = chats.find((c) => c._id.toString() === u._id.toString());
      const lastMsg = chat?.lastMessage;
      console.log(chats, "chats");
      // console.log(lastMsg, "lastMsg");
      console.log(lastMsg?.sender_id, "lastMsg?.sender_id");
      console.log(user_id, "user_id");

      return {
        _id: u._id,
        name: u.full_name,
        image: u.image || null,
        lastMessage: chat?.lastMessage?.text || chat?.lastMessage?.image || "",
        unseenCount: unseenMap[u._id.toString()] || 0,
        lastMessageSender:
          lastMsg?.sender_id?.toString() === currentUserId ? "you" : "other",
        updatedAt: chat?.lastMessage?.createdAt,
      };
    });

    result.sort(
      (a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)
    );

    return success("User chats fetched successfully", result);
  } catch (err: any) {
    throw new Error(err.message || "No user found");
  }
}

async function getUserChatMessagesService(
  user_id: string,
  receiver_id: string
) {
  try {
    const messages = await Message.find({
      $or: [
        {
          sender_id: user_id,
          receiver_id: receiver_id,
        },
        {
          sender_id: receiver_id,
          receiver_id: user_id,
        },
      ],
    });
    await Message.updateMany(
      {
        sender_id: user_id,
        receiver_id: receiver_id,
      },
      { seen: true }
    );
    return success("All chat messages", messages);
  } catch (err: any) {
    throw new Error(err.message || "No user found");
  }
}

async function sendMessageService(
  user_id: string,
  receiver_id: string,
  body: { text?: string },
  file?: Express.Multer.File
) {
  try {
    const { text } = body;
    let imageURL: string | undefined;
    console.log("file", file);

    if (file) {
      const normalizedPath = path.resolve(file.path).replace(/\\/g, "/");
      try {
        const uploadImage = await cloudinary.uploader.upload(normalizedPath, {
          folder: "chat_images",
        });
        imageURL = uploadImage.secure_url;
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }

    const newMessage = await Message.create({
      sender_id: user_id,
      receiver_id,
      text,
      image: imageURL,
    });
    const receiver_socket_id = userSocketMap[receiver_id];
    if (receiver_socket_id) {
      io.to(receiver_socket_id).emit("newMessage", newMessage);
    }
    return success("Message send", newMessage);
  } catch (err: any) {
    throw new Error(err.message || "No user found");
  }
}

async function seenMessageService(user_id: string, message_id: string) {
  try {
    const seen = await Message.findByIdAndUpdate(
      message_id,
      { seen: true },
      { new: true }
    );
    return success("Message seen", seen);
  } catch (err: any) {
    throw new Error(err.message || "failed to seen massage.");
  }
}

export {
  getUserChatsService,
  getUserChatMessagesService,
  sendMessageService,
  seenMessageService,
};
