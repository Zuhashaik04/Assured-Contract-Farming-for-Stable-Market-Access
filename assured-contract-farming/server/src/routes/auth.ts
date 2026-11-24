import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { readDb, writeDb, id } from "../store";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();
const registerSchema = z.object({name:z.string().min(2),email:z.string().email(),password:z.string().min(8),role:z.enum(["FARMER","BUYER"]),location:z.string().default("Karnataka")});
router.post("/register", async (req,res) => {
  const parsed = registerSchema.safeParse(req.body); if(!parsed.success) return res.status(400).json({message:parsed.error.flatten()});
  const db=readDb(), email=parsed.data.email.toLowerCase();
  if(db.users.some(u=>u.email===email)) return res.status(409).json({message:"Email already registered"});
  const user={id:id(),...parsed.data,email,passwordHash:await bcrypt.hash(parsed.data.password,10),createdAt:new Date().toISOString()};
  db.users.push(user); writeDb(db);
  const token=jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET||"dev-only-change-me",{expiresIn:"7d"});
  res.status(201).json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role,location:user.location}});
});
router.post("/login",async(req,res)=>{
  const email=String(req.body.email||"").toLowerCase(), password=String(req.body.password||"");
  const user=readDb().users.find(u=>u.email===email);
  if(!user || !(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({message:"Invalid email or password"});
  const token=jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET||"dev-only-change-me",{expiresIn:"7d"});
  res.json({token,user:{id:user.id,name:user.name,email:user.email,role:user.role,location:user.location}});
});
router.get("/me",authenticate,(req:AuthRequest,res)=>{const u=readDb().users.find(x=>x.id===req.user!.id)!;res.json({id:u.id,name:u.name,email:u.email,role:u.role,location:u.location});});
export default router;
