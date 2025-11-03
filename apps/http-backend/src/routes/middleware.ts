import { JWT_Secret } from "@repo/backend-common/config";
import { NextFunction,Response,Request } from "express";
import jwt  from "jsonwebtoken";
 export function middleware(req:Request,res:Response,next:NextFunction){
    const token = req.headers["authorization"] ?? "";

    const decoded =jwt.verify(token, JWT_Secret)


    if(decoded){
        //@ts-ignore
        req.userId = decoded.userId;
        next();
    }else {
        res.status(403).json({
        message:"unauthorized"
        })
    }
 }