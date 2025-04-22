import express from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from './middleware';
import {SigninSchema,CreateRoomSchema,CreateUserSchema} from '@repo/common/types';
import {prismaClient} from '@repo/db/client';

const app=express();
app.use(express.json());

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);

    if (!parsedData.success) {
        console.log(parsedData.error);
         res.status(400).json({
            message: "Incorrect inputs",
        });
    }

    if(!parsedData || !parsedData.data ||!parsedData.data.username ||  !parsedData.data.username || !parsedData.data.password) {
        res.json({
            message: "Username and password are required",
        })
    }

    else{
        try {
        
            const user=await prismaClient.user.create({
                data: {
                    email: parsedData.data.username, 
                    password: parsedData.data.password,
                    name: parsedData.data.name,
                },
            });
    
            res.status(200).json({
                userId: user.id,
            });
        } catch (e) {
            res.status(409).json({
                message: "User already exists with this username",
            });
        }
    }
});



app.post("/signin",async(req,res)=>{
    const parsedData=SigninSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Incorrect inputs"
        })
        return ;

    }

    const user= await prismaClient.user.findFirst({
        where:{
            email:parsedData.data.username,
            password:parsedData.data.password
        }
    })

    if(!user){
        res.status(403).json({
            message:"not authorized"
        })
    }
   
    const token=jwt.sign({
        userId:user?.id,
    },JWT_SECRET);

    res.json({
        token
    })

    })



app.post("/room",middleware,async(req,res)=>{
    const parsedData=CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.json({
            message:"Incorrect inputs"
        })
        return ;
    }

    const userId=req?.userId;
    if(!userId){
        res.status(403).json({
            message:"not authorized"
        })
    }
    else{
        try{const room=await prismaClient.room.create({
            data:{
                slug:parsedData.data.name,
                adminId:userId,
            }
        })
        //db call
        res.json({
            roomId:room.id
        })
    } catch(e){
        res.status(411).json({
            message:"Room already exists with this name"
        })
    }
    }
    
   
})


app.get(("/chats/:roomId"),async(req,res)=>{
   try{
    const roomId=Number(req.params.roomId);

    const messages=await prismaClient.chat.findMany({
        where:{
            roomId:roomId
        },
        orderBy:{
            id:"asc"
        },
        take:50
    });

    res.json({
        messages
    })
   }
   catch(e){
    res.json({
        messages:[]
    })
   }


})

app.get(("/room/:slug"),async(req,res)=>{
    console.log('Reached here');
    const slug=req.params.slug;

    const room=await prismaClient.room.findFirst({
        where:{
            slug
        },
       
    });

    res.json({
        room
    })


})

app.listen(8000,()=>{
    console.log('server is running on localhost:8000');
})