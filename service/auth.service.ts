import userModel from "../database/models/user.model";
import { hashPassword, verifyPassword } from "../helper/common.helper";
import { success, error } from "../helper/response.helper";

interface SignUpPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  picture?: string;
}

interface SignInPayload {
  email: string;
  password: string;
}

async function signUpService(payload: SignUpPayload) {
  try {
    const { name, email, password, phone, picture } = payload;

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new Error("Email already exists.");
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await userModel.create({
      full_name: name,
      email,
      password: hashedPassword,
      phone,
      image: picture,
      provider: "EMAIL",
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();
    return success("User created successfully", userWithoutPassword);
  } catch (err) {
    console.error("Sign Up Error:", err);
    throw new Error("Something went wrong during sign up");
  }
}

async function signInService(payload: SignInPayload) {
  try {
    const { email, password } = payload;

    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user: any = await userModel.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password.");
    }

    const { password: _, ...userWithoutPassword } = user.toObject();
    return success("Login successful", userWithoutPassword);
  } catch (err: any) {
    console.error("Sign In Error:", err);
    throw new Error(err.message || "Something went wrong during sign in");
  }
}

// async function googleLoginService(credential: string) {
//   try {
//     if (!process.env.GOOGLE_CLIENT_ID) {
//       throw new Error("GOOGLE_CLIENT_ID is not defined");
//     }

//     const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

//     const ticket = await client.verifyIdToken({
//       idToken: credential,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     if (!payload?.email || !payload.name) {
//       throw new Error("Invalid Google token payload");
//     }

//     const { email, name, picture, sub: googleId } = payload;

//     // Check if user exists
//     let user = await userModel.findOne({ email });

//     if (!user) {
//       // Create new user
//       user = await userModel.create({
//         full_name: name,
//         email,
//         image: picture,
//         provider: "GOOGLE",
//         google_id: googleId,
//       });
//     } else if (user.provider !== "GOOGLE") {
//       throw new Error("Email already exists with a different login method");
//     }

//     const { password: _, ...userWithoutPassword } = user.toObject();
//     return success("Google login successful", userWithoutPassword);
//   } catch (err) {
//     console.error("Google Login Error:", err);
//     throw new Error("Google login failed");
//   }
// }

export { signUpService, signInService };
