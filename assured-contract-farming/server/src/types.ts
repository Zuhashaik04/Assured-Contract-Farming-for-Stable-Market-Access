export type Role = "FARMER" | "BUYER" | "ADMIN";
export type Status = "DRAFT" | "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";
export interface User { id:string; name:string; email:string; passwordHash:string; role:Role; location:string; createdAt:string; }
export interface Product { id:string; name:string; category:string; unit:string; description:string; }
export interface Contract { id:string; farmerId:string; buyerId:string; productId:string; quantity:number; unit:string; pricePerUnit:number; startDate:string; deliveryDate:string; deliveryLocation:string; terms:string; status:Status; createdAt:string; }
export interface ContractRequest { id:string; buyerId:string; farmerId:string; productId:string; quantity:number; pricePerUnit:number; message:string; status:"PENDING"|"ACCEPTED"|"REJECTED"; createdAt:string; }
export interface MarketPrice { id:string; productId:string; market:string; price:number; unit:string; recordedAt:string; }
export interface Transaction { id:string; contractId:string; amount:number; method:string; status:"PENDING"|"COMPLETED"|"FAILED"; createdAt:string; }
export interface Rating { id:string; contractId:string; farmerId:string; buyerId:string; stars:number; comment:string; createdAt:string; }
export interface Database { users:User[]; products:Product[]; contracts:Contract[]; contractRequests:ContractRequest[]; marketPrices:MarketPrice[]; transactions:Transaction[]; ratings:Rating[]; }
