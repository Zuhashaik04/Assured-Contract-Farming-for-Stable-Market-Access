import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { readDb } from "../store";
import { Role } from "../types";

export interface AuthRequest extends Request { user?: { id:string; role:Role }; }
export function authenticate(req:AuthRequest,res:Response,next:NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i,"");
  if (!token) return res.status(401).json({message:"Authentication required"});
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-only-change-me") as {id:string;role:Role};
    const user = readDb().users.find(u=>u.id===payload.id);
    if (!user) return res.status(401).json({message:"Account no longer exists"});
    req.user = {id:user.id,role:user.role}; next();
  } catch { return res.status(401).json({message:"Invalid or expired token"}); }
}
export function allow(...roles:Role[]) {
  return (req:AuthRequest,res:Response,next:NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({message:"You do not have permission"});
    next();
  };
}
