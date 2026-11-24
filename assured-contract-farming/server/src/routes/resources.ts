import { Router } from "express";
import { z } from "zod";
import { readDb,writeDb,id } from "../store";
import { authenticate,allow,AuthRequest } from "../middleware/auth";
import { Contract, Status } from "../types";

const router=Router();
router.use(authenticate);
const publicUser=(u:any)=>({id:u.id,name:u.name,email:u.email,role:u.role,location:u.location});

router.get("/users",allow("ADMIN"),(_req,res)=>res.json(readDb().users.map(publicUser)));
router.get("/products",(_req,res)=>res.json(readDb().products));
router.post("/products",allow("ADMIN"),(req,res)=>{
 const p=z.object({name:z.string().min(2),category:z.string().default("Agriculture"),unit:z.string().default("kg"),description:z.string().default("")}).safeParse(req.body);
 if(!p.success)return res.status(400).json({message:p.error.flatten()});
 const db=readDb(), item={id:id(),...p.data};db.products.push(item);writeDb(db);res.status(201).json(item);
});
router.get("/contracts",(req:AuthRequest,res)=>{
 const db=readDb(), role=req.user!.role;
 res.json(role==="ADMIN"?db.contracts:db.contracts.filter(c=>c.farmerId===req.user!.id||c.buyerId===req.user!.id));
});
router.post("/contracts",allow("FARMER"),(req:AuthRequest,res)=>{
 const p=z.object({buyerId:z.string(),productId:z.string(),quantity:z.number().positive(),unit:z.string(),pricePerUnit:z.number().positive(),startDate:z.string(),deliveryDate:z.string(),deliveryLocation:z.string().min(2),terms:z.string().default("")}).safeParse(req.body);
 if(!p.success)return res.status(400).json({message:p.error.flatten()});
 const db=readDb(); if(!db.users.some(u=>u.id===p.data.buyerId&&u.role==="BUYER"))return res.status(400).json({message:"Buyer not found"});
 if(!db.products.some(x=>x.id===p.data.productId))return res.status(400).json({message:"Product not found"});
 const c:Contract={id:id(),farmerId:req.user!.id,...p.data,status:"PENDING",createdAt:new Date().toISOString()};
 db.contracts.push(c);writeDb(db);res.status(201).json(c);
});
router.patch("/contracts/:id",(req:AuthRequest,res)=>{
 const db=readDb(), c=db.contracts.find(x=>x.id===req.params.id);
 if(!c)return res.status(404).json({message:"Contract not found"});
 const isAdmin=req.user!.role==="ADMIN", isParty=c.farmerId===req.user!.id||c.buyerId===req.user!.id;
 if(!isAdmin&&!isParty)return res.status(403).json({message:"Not a contract participant"});
 const status=z.enum(["DRAFT","PENDING","ACTIVE","COMPLETED","CANCELLED"]).safeParse(req.body.status);
 if(!status.success)return res.status(400).json({message:"Invalid status"});
 if(c.status==="COMPLETED"&&status.data!=="COMPLETED"&&!isAdmin)return res.status(403).json({message:"Only admins can reopen completed contracts"});
 c.status=status.data;writeDb(db);res.json(c);
});
router.get("/contract-requests",(req:AuthRequest,res)=>{
 const db=readDb();res.json(db.contractRequests.filter(x=>req.user!.role==="ADMIN"||x.buyerId===req.user!.id||x.farmerId===req.user!.id));
});
router.post("/contract-requests",allow("BUYER"),(req:AuthRequest,res)=>{
 const p=z.object({farmerId:z.string(),productId:z.string(),quantity:z.number().positive(),pricePerUnit:z.number().positive(),message:z.string().default("")}).safeParse(req.body);
 if(!p.success)return res.status(400).json({message:p.error.flatten()});
 const db=readDb();if(!db.users.some(u=>u.id===p.data.farmerId&&u.role==="FARMER"))return res.status(400).json({message:"Farmer not found"});
 const r={id:id(),buyerId:req.user!.id,...p.data,status:"PENDING" as const,createdAt:new Date().toISOString()};
 db.contractRequests.push(r);writeDb(db);res.status(201).json(r);
});
router.patch("/contract-requests/:id",allow("FARMER"),(req:AuthRequest,res)=>{
 const db=readDb(),r=db.contractRequests.find(x=>x.id===req.params.id&&x.farmerId===req.user!.id);
 if(!r)return res.status(404).json({message:"Request not found"});
 const status=z.enum(["ACCEPTED","REJECTED"]).safeParse(req.body.status);
 if(!status.success)return res.status(400).json({message:"Status must be ACCEPTED or REJECTED"});
 r.status=status.data;writeDb(db);res.json(r);
});
router.get("/market-prices",(_req,res)=>res.json(readDb().marketPrices));
router.post("/market-prices",allow("ADMIN","BUYER"),(req,res)=>{
 const p=z.object({productId:z.string(),market:z.string(),price:z.number().positive(),unit:z.string().default("kg")}).safeParse(req.body);
 if(!p.success)return res.status(400).json({message:p.error.flatten()});
 const db=readDb(),item={id:id(),...p.data,recordedAt:new Date().toISOString()};db.marketPrices.push(item);writeDb(db);res.status(201).json(item);
});
router.get("/transactions",(req:AuthRequest,res)=>{
 const db=readDb(), allowed=new Set(db.contracts.filter(c=>req.user!.role==="ADMIN"||c.farmerId===req.user!.id||c.buyerId===req.user!.id).map(c=>c.id));
 res.json(db.transactions.filter(t=>allowed.has(t.contractId)));
});
router.post("/transactions",(req:AuthRequest,res)=>{
 const p=z.object({contractId:z.string(),amount:z.number().positive(),method:z.string().default("BANK_TRANSFER")}).safeParse(req.body);
 if(!p.success)return res.status(400).json({message:p.error.flatten()});
 const db=readDb(),c=db.contracts.find(x=>x.id===p.data.contractId);
 if(!c)return res.status(404).json({message:"Contract not found"});
 if(req.user!.role!=="ADMIN"&&c.buyerId!==req.user!.id)return res.status(403).json({message:"Only the buyer or admin can record a payment"});
 const t={id:id(),...p.data,status:"PENDING" as const,createdAt:new Date().toISOString()};db.transactions.push(t);writeDb(db);res.status(201).json(t);
});
router.patch("/transactions/:id/status",allow("ADMIN"),(req,res)=>{
 const db=readDb(),t=db.transactions.find(x=>x.id===req.params.id);
 if(!t)return res.status(404).json({message:"Transaction not found"});
 const status=z.enum(["PENDING","COMPLETED","FAILED"]).safeParse(req.body.status);
 if(!status.success)return res.status(400).json({message:"Invalid transaction status"});
 t.status=status.data;
 const contract=db.contracts.find(c=>c.id===t.contractId);
 if(contract&&db.transactions.some(x=>x.contractId===contract.id)&&db.transactions.filter(x=>x.contractId===contract.id).every(x=>x.status==="COMPLETED"))contract.status="COMPLETED";
 writeDb(db);res.json(t);
});
router.get("/ratings",(req:AuthRequest,res)=>{
 const db=readDb();res.json(db.ratings.filter(r=>req.user!.role==="ADMIN"||r.buyerId===req.user!.id||r.farmerId===req.user!.id));
});
router.post("/ratings",allow("BUYER"),(req:AuthRequest,res)=>{
 const p=z.object({contractId:z.string(),stars:z.number().int().min(1).max(5),comment:z.string().max(1000).default("")}).safeParse(req.body);
 if(!p.success)return res.status(400).json({message:p.error.flatten()});
 const db=readDb(),c=db.contracts.find(x=>x.id===p.data.contractId&&x.buyerId===req.user!.id&&x.status==="COMPLETED");
 if(!c)return res.status(400).json({message:"A completed contract belonging to you is required"});
 if(db.ratings.some(r=>r.contractId===c.id&&r.buyerId===req.user!.id))return res.status(409).json({message:"You already rated this contract"});
 const r={id:id(),contractId:c.id,farmerId:c.farmerId,buyerId:req.user!.id,stars:p.data.stars,comment:p.data.comment,createdAt:new Date().toISOString()};
 db.ratings.push(r);writeDb(db);res.status(201).json(r);
});
export default router;
