import  express, {Router } from "express";
import z, { email } from "zod"
export const userrouter: Router =express.Router();
import bcrypt from "bcrypt"
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


    userrouter.post("/signin", async (req,res)=>{
        
        
    })
})
