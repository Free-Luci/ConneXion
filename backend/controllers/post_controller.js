import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/post_model.js"
import { User } from "../models/user_model.js";
import{ Comment } from "../models/comment_model.js"
import { ConnectionClosedEvent } from "mongodb";
import { getReceiverSocketId,io } from "../socket/socket.js";

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) {
            return res.status(401).json({ message: 'Image Required' });
        }
        //image upload
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();
        //buffer to datauri convert
        const fileuri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;

        const cloudResponse = await cloudinary.uploader.upload(fileuri);
        const post = await Post.create({
            caption,
            image: cloudResponse.secure_url,
            author: authorId
        });
        const user = await User.findById(authorId);
        if (user) {
            user.posts.push(post._id);
            await user.save();
        }

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New Post added',
            post,
            success: true
        })
    } catch (err) {
        console.log(err);
    }
}

export const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments', sort: { createdAt: -1 },
                populate: { path: 'author', select: 'username profilePicture' }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (err) {
        console.log(err);
    }
};

export const getUserPost = async (req, res) => {
    try {
        const authorId = req.id;
        const posts = await Post.find({ author: authorId }).sort({ createdAt: -1 })
            .populate({
                path: 'author',
                select: 'username,profilePicture',
            })
            .populate({
                path: 'comments', sort: { createdAt: -1 },
                populate: { path: 'author', select: 'username,profilePicture' }
            });
        return res.status(200).json({
            posts,
            success: true
        })
    } catch (err) {
        console.log(err);
    }
}

export const likePost = async (req, res) => {
    try {
        const likeKarneWalaUserId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found!',
                success: false
            })
        };

        //like ka logic

        await post.updateOne({ $addToSet: { likes: likeKarneWalaUserId } });
        await post.save();

        //implement socket io for real time notification
        const user=await User.findById(likeKarneWalaUserId).select('username profilePicture');
        const postOwnerId=post.author.toString();
        if(postOwnerId !== likeKarneWalaUserId)
        {
            //emit a notification event
            const notification={
                type:'like',
                userId:likeKarneWalaUserId,
                userDetails:user,
                postId,
                message:'Your post was like'
            }
            const postOwnerSocketId=getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({

            message:'Post Liked',
            success:true
        });

    } catch (err) {
        console.log(err);
    }
}



export const dislikePost = async (req, res) => {
    try {
        const dislikeKarneWalaUserId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: 'Post not found!',
                success: false
            })
        };

        //dislike ka logic

        await post.updateOne({ $pull: { likes: dislikeKarneWalaUserId } });
        await post.save();

        //implement socket io for real time notification

        const user=await User.findById(dislikeKarneWalaUserId).select('username profilePicture');
        const postOwnerId=post.author.toString();
        if(postOwnerId !== dislikeKarneWalaUserId)
        {
            //emit a notification event
            const notification={
                type:'dislike',
                userId:dislikeKarneWalaUserId,
                userDetails:user,
                postId,
                message:'Your post was like'
            }
            const postOwnerSocketId=getReceiverSocketId(postOwnerId);
            io.to(postOwnerSocketId).emit('notification',notification);
        }

        return res.status(200).json({

            message:'Post Disliked',
            success:true
        });

    } catch (err) {
        console.log(err);
    }
};

export const addComment = async (req,res)=>{
    try{
        // console.log(req.params.id);
        const postId = req.params.id;
        
        const commentKarneWalaUserId=req.id;

        const {text} =req.body;
        if (!text) return res.status(400).json({ message: 'Text Required', success: false });
        const post =await Post.findById(postId);
        if(!text) return res.status(400).json({message:'Text Required',success:false});
        
      const comment = await Comment.create({
            text,
            author:commentKarneWalaUserId,
            post:postId
      })
    //   await comment.populate
    //     ({ path: 'author', select: 'username profilePicture bio' });

    const user = await User.findById(comment.author).select('username profilePicture bio');
console.log(user);

    console.log(comment);
      post.comments.push(comment._id);
      await post.save();

      return res.status(201).json({
        message:'Comment Added',
        comment,
        success:true
      })

    }catch(err)
    {   
        // console.log("hello");
        console.log(err);
    }
};

export const getCommentsOfPost = async (req,res)=>{
    try{
        const postId=req.params.id;
        const comments= await Comment.find({Post:postId}).populate('author', 'username profilePicture bio');

        if(!comments) return res.status(404).json({message:'No Comments found for this post',success:false});
        return res.status(200).json({success:true,comments});

    }
    catch(err)
    {
        console.log(err);
    }
}

export const deletePost = async (req,res)=>{
    try{
        const postId=req.params.id;
        const authorId=req.id;

        const post = await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found',success:false});

        //check if the logged in user is the owner of the post
        if(post.author.toString()!==authorId)return res.status(403).json({message:'Unauthorize User'})

        //delete the post
        await Post.findByIdAndDelete(postId);

        //remove the post id from the user's post
        let user = await User.findById(authorId);
        user.posts=user.posts.filter(id=>id.toString()!==postId);

        await user.save();
        //delete associated comments
        await Comment.deleteMany({post:postId});

        return res.status(200).json({success:true,message:'Post deleted'});
    }catch(err)
    {
        console.log(err);
    }
}

export const bookmarkPost = async (req,res)=>{
    try{
        const postId=req.params.id;
        const authorId=req.id;
        const post= await Post.findById(postId);
        if(!post) return res.status(404).json({message:'Post not found',success:false});

        const user =await User.findById(authorId);
        if(user.bookmarks.includes(post._id))
        {
            //alreay bookmarked-->remove from bookmark
            await user.updateOne({$pull:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'unsaved',message:'Post remove from bookmark',success:true});
        }
        else{
            //bookmark krna pdega
            await user.updateOne({$addToSet:{bookmarks:post._id}});
            await user.save();
            return res.status(200).json({type:'saved',message:'Post bookmarked',success:true});
        
        }
    }catch(err)
    {
        console.log(err);
    }
}