import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleWare = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token Provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: string };

    req.userId = decoded.userId; // ✅ now works

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};