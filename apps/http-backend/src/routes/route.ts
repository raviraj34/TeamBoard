import express, { Router } from "express";
import z, { email, parse } from "zod"
export const userrouter: Router = express.Router();
import bcrypt from "bcrypt"
import { middleware } from "./middleware";
import jwt from "jsonwebtoken"
import { JWT_Secret } from "@repo/backend-common/config"
import {prismaClient} from "@repo/db/client"

userrouter.post("/signup", async (req, res) => {
  try {
    const userschema = z.object({
      email: z.string().email().min(3).max(30),
      password: z.string().min(2).max(23),
      name: z.string().min(2).max(30),
    });

    const parseddata = userschema.safeParse(req.body);
    if (!parseddata.success) {
      return res.status(400).json({ message: "Invalid schema" });
    }

    const { email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

     
    const user = await prismaClient.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    

    return res.status(201).json({ message:" Signup completed" });
  } catch (err) {
  console.error("Error in signup route:", err);

  if (err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }

  return res.status(500).json({ message: "Unknown error occurred" });

  

}


});



userrouter.post("/signin",async (req, res) => {
    const signinschema = z.object({
        email:z.string().min(3).max(34),
        password:z.string().min(2).max(34)
    })
  
  
    const { email, password } = req.body;

    const parsed = signinschema.safeParse(req.body)

    const user = await prismaClient.user.findFirst({
        where: {
            email,
            password
        }
    })

    if (!user) {
        res.json({
            message: "user not found"
        })
    }

    if (user) {
        const token = jwt.sign({
            userId: user?.id
        }, JWT_Secret)
      
      
        res.json({
        token
        })
    };

})


userrouter.post("/room", middleware, (req, res) => {


    //db call 
    res.json({
        message: "room logic to be written"
    })
}
)
