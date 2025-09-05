import { Response } from "express";

export function createResponse(code: number, message: string, data: any = null) {
  return { code, message, data };
}

export function success(message: string, data: any = null, code = 200) {
  return createResponse(code, message, data);
}

export function error(res: Response, code = 400, message = "Something went wrong", data: any = null) {
  return res.status(code).json(createResponse(code, message, data));
}
