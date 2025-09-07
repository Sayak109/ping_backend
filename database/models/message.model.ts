import mongoose, { Schema, Document } from "mongoose";

export interface Messages extends Document {
  sender_id: mongoose.Schema.Types.ObjectId;
  receiver_id: mongoose.Schema.Types.ObjectId;
  text: string;
  image: string;
  seen: boolean;
}

const MessageSchema: Schema = new Schema<Messages>(
  {
    sender_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    text: {
      type: String,
    },
    image: {
      type: String,
    },
    seen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model<Messages>("Messages", MessageSchema);
export default Message;
