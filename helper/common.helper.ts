import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";


/**
 * @param password - Plain text password
 * @returns Promise<string> - Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * @param plainPassword - User input password
 * @param hashedPassword - Stored hashed password
 * @returns Promise<boolean> - True if matches
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * @param payload - Data to encode in the token
 * @param expiresIn - Expiration time (e.g., "1d", "7d", or seconds)
 * @returns Promise<string> - Signed JWT token
 */
export async function generateToken(
  payload: string | object,
  expiresIn: string | number = process.env.COOKIE_EXPIRE || "1y"
): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });

  return token;
}

