import  express, {Router } from "express";
import z, { email, parse } from "zod"
export const userrouter: Router =express.Router();
import bcrypt from "bcrypt"
import { middleware } from "./middleware";
import jwt from "jsonwebtoken"
import {JWT_Secret} from "@repo/backend-common/config"
userrouter.post("/signup", async (req,res)=>{
    const userschema = z.object({
        email:z.string().min(3).max(30),
        password:z.string().min(2).max(23),
        name:z.string().min(2).max(30)
    })
   const {email,password,name} =req.body;

    const parseddata = userschema.safeParse(req.body)

    const parsedpas = await bcrypt.hash(password,20);


    if(parsedpas){
        const user = usermodel.createOne({
            email,
            password,
            name
        })

        res.json({
            message:"signup completed"
        })

        if(!parsedpas){
        res.json({
            message:"signup route falied please try again !!"    
        })
    }
    }


    userrouter.post("/signin",middleware async (req,res)=>{
        const {email ,password} = req.body;
        
        const parsed = signinschema.safeParse(req.body)

        const user = await prisma.user.findFirst({
            where:{
                email:parsed.data?.email,
                password:parsed.data?.password
            }
        })

        if(!user){
            res.json({
                message:"user not found"
            })
        }

        if(user){
            const token = jwt.sign({
                userId: user?.id
            },JWT_Secret)
        };
        

        res.json({
            token
        })
        
    })

    userrouter.post("/room",middleware,(req,res)=>{
        

    //db call 
    res.json({
        message:"room logic "
    })
    }
    )
})
