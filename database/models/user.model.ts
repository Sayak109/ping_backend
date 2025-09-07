import mongoose, { Schema, Document } from "mongoose";

export interface Users extends Document {
  full_name?: string;
  email: string;
  password?: string;
  phone?: string;
  image?: string;
  provider: "EMAIL" | "GOOGLE";
  google_id?: string;
}

const UserSchema: Schema = new Schema<Users>(
  {
    full_name: { type: String, required: false },
    email: { type: String, required: true },
    password: { type: String, required: false },
    phone: { type: String, required: false },
    image: { type: String, required: false },
    provider: { type: String, required: true, enum: ["EMAIL", "GOOGLE"] },
    google_id: { type: String, required: false },
  },
  { timestamps: true }
);

const User = mongoose.model<Users>("Users", UserSchema);
export default User;
