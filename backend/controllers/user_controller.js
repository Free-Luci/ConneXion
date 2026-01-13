import { User } from "../models/user_model.js";
import {Post} from "../models/post_model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js";
import getDataUri from "../utils/datauri.js";
export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(401).json({
                message: "Something is missing,Please check!",
                success: false,
            });
        }
        const user = await User.findOne({ email });
        if (user) {
            return res.status(401).json({
                message: "Email Id already register,Please Try Another Id",
                success: false,
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username,
            email,
            password: hashedPassword
        })
        return res.status(201).json({
            message: "Account Created Successfully",
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
}

export const login = async (req,res) =>{
    try{
        const {username,email,password}=req.body;
        if (!email || !password) {
            return res.status(401).json({
                message: "Something is missing,Please check!",
                success: false,
            });
        }
        let user= await User.findOne({email});
        if (!user) {
            return res.status(401).json({
                message: "Incorrect Email or Password !",
                success: false,
            });
        }
        const isPasswordMatch= await bcrypt.compare(password,user.password);
        if(!isPasswordMatch)
        {
            return res.status(401).json({
                message: "Incorrect Email or Password !",
                success: false,
            });
        }
        const token = await jwt.sign({userId:user._id},process.env.SECRET_KEY,{expiresIn:'1d'});

        //populate each post if in the posts array

        const populatedPosts=await Promise.all(
            user.posts.map(async (postId)=>{
                const post = await Post.findById(postId);
                if(post.author.equals(user._id)){
                    return post;
                }
                return null;
            })
        )
        user ={
            _id:user._id,
            username:user.username,
            email:user.email,
            profilePicture:user.profilePicture,
            bio:user.bio,
            followers:user.followers,
            following:user.following,
            posts:populatedPosts,
        }
       
        return res.cookie("token",token,{
            httpOnly:true,
            sameSite:"none",
            // secure:true,
            secure: process.env.NODE_ENV === "production",
            maxAge:1*24*60*60*1000}).json({
            message:`Welcome back ${user.username}`,
            success:true,
            user,
        })
    }catch(error)
    {
        console.log(error);
    }
};
    export const logout =async (_,res)=>{
        try{
            return res.cookie("token","",{maxAge:0}).json({
                message:'Logged out Successfully.',
                success:true
            })
        }catch(error)
        {
            console.log(error);
        }
    }

    export const getProfile=async(req,res)=>{
        try{
            const userId=req.params.id;
            let user = await User.findById(userId)
            .populate({path:'posts',createdAt:-1})
            .populate('bookmarks');
            return res.status(200).json({
                user,
                success:true,
            })
        }catch(error)
        {
            console.log(error);
        }
    }

    export const editProfile=async(req,res)=>{
        try{
            const userId=req.id;
            const {bio,gender}=req.body;
            const profilePicture=req.file;
            let cloudResponse;
            if(profilePicture)
            {
                const fileuri=getDataUri(profilePicture);
                cloudResponse=await cloudinary.uploader.upload(fileuri);
            }
            const user= await User.findById(userId).select("-password");
            if(!user)
            {
                return res.status(404).json({
                    message:'User not found',
                    success:false,
                })
            };
            if(bio) user.bio=bio;
            if(gender) user.gender=gender;
            if(profilePicture) user.profilePicture=cloudResponse.secure_url;

            await user.save();
            return res.status(200).json({
                message:'Profile Updated.',
                success:true,
                user,
            })

        }catch(error)
        {
            console.log(error);
        }
    }
    export const getSuggestedUsers= async (req,res)=>{
        try{
            const suggestUsers=await User.find({_id:{$ne:req.id}}).select("-password");
            if(!suggestUsers)
            {
                return res.status(400).json({
                    message:'Currently do not have any users ',
                })
            };
            return res.status(200).json({
                success:true,
                users:suggestUsers
            })
        }catch (error)
        {
            console.log(error);
        }

    }

    export const followOrUnfollow= async(req,res)=>{
        try{
            const followkarnewala=req.id;
            const jiskoFollowKarunga=req.params.id;
            if(followkarnewala===jiskoFollowKarunga)
            {
                return res.status(400).json({
                    message:'You cannot follow/unfollow yourself',
                    success:false,
                })
            }
            const user=await User.findById(followkarnewala);
            const targetUser= await User.findById(jiskoFollowKarunga);

            if(!user || !targetUser)
            {
                return res.status(400).json({
                    message:'User Not found! ',
                    success:false,
                })
            }
            //now check you want to check follow or unfollow
            const isFollowing=user.following.includes(jiskoFollowKarunga);
            if(isFollowing)
            {
                //unfollw logic ayega
                await Promise.all([
                    User.updateOne({_id:followkarnewala},{$pull:{following:jiskoFollowKarunga}}),
                    User.updateOne({_id:jiskoFollowKarunga},{$pull:{followers:followkarnewala}}),  
                ])
                return res.status(200).json({
                    message:'Unfollowed Successfully',
                    success:true,
                })
            }
            else{
                //follow logic ayega
                await Promise.all([
                    User.updateOne({_id:followkarnewala},{$push:{following:jiskoFollowKarunga}}),
                    User.updateOne({_id:jiskoFollowKarunga},{$push:{followers:followkarnewala}}),  
                ])
                return res.status(200).json({
                    message:'Followed Successfully',
                    success:true,
                })
            }

        }catch(err)
        {
            console.log(err);
        }
    }