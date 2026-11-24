import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import authRoutes from "./routes/auth";
import resourceRoutes from "./routes/resources";
import { readDb } from "./store";

const app=express();
app.use(cors({origin:process.env.CLIENT_ORIGIN||"http://localhost:3000"}));
app.use(express.json({limit:"1mb"}));
app.get("/health",(_req,res)=>res.json({status:"ok"}));
app.use("/api/auth",authRoutes);
app.use("/api",resourceRoutes);
app.use((err:any,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{
 console.error(err);res.status(500).json({message:"Internal server error"});
});
const port=Number(process.env.PORT||5000);
readDb();
app.listen(port,()=>console.log(`Contract Farming API listening on http://localhost:${port}`));
