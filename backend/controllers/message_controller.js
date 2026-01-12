//for chatting
import {Conversation} from "../models/conversation_model.js";
import { Message } from "../models/message_model.js";
import { getReceiverSocketId, io } from "../socket/socket.js";
export const sendMessage = async(req,res)=>{
    try{
        const senderId = req.id;
        const receiverId=req.params.id;
        const {message}=req.body;
        // if (!message) {
        //     return res.status(400).json({ error: 'Message is required' });
        //   }
        console.log(message);

        let conversation = await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        });

        //establish the conversation if not started yet
        if(!conversation)
        {
            conversation=await Conversation.create({
                participants :[senderId,receiverId]
            })
        };
        const newMessage= await Message.create({
            senderId,
            receiverId,
            message
        })
        if(newMessage) conversation.messages.push(newMessage._id);
        await Promise.all([conversation.save(),newMessage.save()])

        //implement socket io for real time data transfer
        const receiverScoketId=getReceiverSocketId(receiverId);
        if(receiverId){
            io.to(receiverScoketId).emit('newMessage',newMessage);

        }

        return res.status(201).json({
            success:true,
            newMessage
        })
    }catch(err){
        console.log(err);
    }
}

export const getMessage = async(req,res)=>{
    try{
        const senderId = req.id;
        const receiverId=req.params.id;
        const conversation=await Conversation.findOne({
            participants:{$all:[senderId,receiverId]}
        }).populate('messages');
        console.log(conversation);
        if(!conversation) return res.status(200).json({success:true,messages:[]});         

        return res.status(200).json({success:true,messages:conversation?.messages});
    }catch(err)
    {
        console.log(err);
    }
}