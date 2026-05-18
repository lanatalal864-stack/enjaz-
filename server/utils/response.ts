import { Response } from "express";

export const ok = (res: Response, data: unknown, message = "OK") => {
  return res.status(200).json({ success: true, message, data });
};

export const created = (res: Response, data: unknown, message = "Created") => {
  return res.status(201).json({ success: true, message, data });
};

export const fail = (res: Response, status: number, message: string, extra?: unknown) => {
  return res.status(status).json({ success: false, message, ...(extra ? { error: extra } : {}) });
};
