import express, { Router } from "express";
import z, { email, number, parse } from "zod"
export const userrouter: Router = express.Router();
import bcrypt from "bcrypt"
import { middleware } from "./middleware";
import jwt from "jsonwebtoken"
import { JWT_Secret } from "@repo/backend-common/config"
import { prismaClient } from "@repo/db/client"

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



    return res.status(201).json({ message: " Signup completed", userId:user.id });
  } catch (err) {
    console.error("Error in signup route:", err);

    if (err instanceof Error) {
      return res.status(500).json({ message: err.message });
    }

    return res.status(500).json({ message: "Unknown error occurred" });



  }


});



userrouter.post("/signin", async (req, res) => {
  const signinschema = z.object({
    email: z.string().min(3).max(34),
    password: z.string().min(2).max(34)
  })


  const { email, password } = req.body;

  const parsed = signinschema.safeParse(req.body)

  const user = await prismaClient.user.findFirst({
    where: {
      email: parsed.data?.email
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


userrouter.post("/room", middleware, async (req, res) => {

  const parsedroom = z.object({
    slug: z.string().min(3).max(34)
  })

  const slug = req.body

  const roomschema = parsedroom.safeParse(req.body)

  if (!roomschema.success) {
    res.json({
      message: "roomschema is wrong"
    })
  } else {
    //@ts-ignore
    const userId = req.userId
    const room =await prismaClient.room.create({
      data: { 
        slug: roomschema.data.slug,
        adminId: userId
      }
    })
    res.json({
      roomId:room.id
    })
  }
}
)


userrouter.get("/chats/:roomId", async (req,res)=>{
 try{
  const roomId = Number(req.params.roomId);
  console.log(req.params.roomId
  );
  
  const messages = await prismaClient.chat.findMany({
    where:{
      roomId: roomId
    },
    orderBy:{
      id:"desc"
    },
    take:500
    
  })
  res.json({
    messages
  })

}catch(e){
  console.log(e);
  res.json({
    messages:[]
  })
  
}
}) 

userrouter.get("/room/:slug", async (req,res)=>{
  const slug = req.params.slug;
  const room = await prismaClient.room.findFirst({
    where:{
      slug 
    }
  })
  res.json({
    room
  })
})


