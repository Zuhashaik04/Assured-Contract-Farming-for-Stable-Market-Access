import bcrypt from "bcryptjs";
import { readDb, writeDb, id } from "./store";

async function seed() {
  const db = readDb();
  if (db.users.length) { console.log("Database already has users; seed skipped."); return; }
  const passwordHash = await bcrypt.hash("password123", 10);
  const admin = {id:id(),name:"Demo Admin",email:"admin@contractfarming.com",passwordHash,role:"ADMIN" as const,location:"Bengaluru",createdAt:new Date().toISOString()};
  const farmer = {id:id(),name:"Demo Farmer",email:"farmer@example.com",passwordHash,role:"FARMER" as const,location:"Bengaluru",createdAt:new Date().toISOString()};
  const buyer = {id:id(),name:"Demo Buyer",email:"buyer@example.com",passwordHash,role:"BUYER" as const,location:"Bengaluru",createdAt:new Date().toISOString()};
  const products = ["Tomato","Potato","Onion","Rice","Wheat"].map((name,i)=>({id:id(),name,category:"Agriculture",unit:i===3||i===4?"kg":"kg",description:`Sample ${name.toLowerCase()} listing`}));
  db.users.push(admin,farmer,buyer); db.products.push(...products);
  db.marketPrices.push(...products.slice(0,3).map((p,i)=>({id:id(),productId:p.id,market:"Bengaluru",price:[28,22,35][i],unit:"kg",recordedAt:new Date().toISOString()})));
  writeDb(db); console.log("Demo data created. All demo passwords: password123");
}
seed().catch(e=>{console.error(e);process.exit(1);});
