import { Request, Response } from "express";
import { error, success } from "../helper/response.helper";
import {
  getUserChatMessagesService,
  getUserChatsService,
  seenMessageService,
  sendMessageService,
} from "../service/chat.service";

export async function getUserChats(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const user_id = req?.user?._id;
    const result = await getUserChatsService(user_id);

    return res.status(200).json(result);
  } catch (err) {
    return error(res, 400, "No user found");
  }
}

export async function getUserChatMessages(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const user_id = req?.user?._id;
    const receiver_id = req?.params?.id;
    if (!receiver_id) {
      return error(res, 400, "User not found.");
    }
    const result = await getUserChatMessagesService(user_id, receiver_id);
    return res.status(200).json(result);
  } catch (err) {
    return error(res, 400, "Failed to open chat.");
  }
}

export async function sendMessage(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const user_id = req?.user?._id;
    const receiver_id = req?.params?.id;
    if (!receiver_id) {
      return error(res, 400, "User not found.");
    }
    const result = await sendMessageService(
      user_id,
      receiver_id,
      { text: req?.body?.text },
      req.file
    );
    return res.status(200).json(result);
  } catch (err) {
    return error(res, 400, "Failed to send message");
  }
}

export async function seenMessage(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const user_id = req?.user?._id;
    const message_id = req?.params?.id;
    if (!message_id) {
      return error(res, 400, "No message found.");
    }
    const result = await seenMessageService(user_id, message_id);
    return res.status(200).json(result);
  } catch (err) {
    return error(res, 400, "Failed to seen message");
  }
}
