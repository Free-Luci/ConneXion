import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { setPosts, setSelectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";
import API from "../utils/api";

const Post = ({ post }) => {
    const [text, setText] = useState("");
    const [open, setOpen] = useState(false);

    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const dispatch = useDispatch();

    const [liked, setLiked] = useState(post.likes.includes(user?._id));
    const [postLike, setPostLike] = useState(post.likes.length);
    const [comment, setComment] = useState(post.comments);

    const changeEventHandler = (e) => {
        setText(e.target.value.trim() ? e.target.value : "");
    };

    // ❤️ LIKE / DISLIKE
    const likeOrDislikeHandler = async () => {
        try {
            const action = liked ? "dislike" : "like";
            const res = await API.get(`/api/v1/post/${post._id}/${action}`);

            if (res.data.success) {
                const updatedLikes = liked ? postLike - 1 : postLike + 1;
                setPostLike(updatedLikes);
                setLiked(!liked);

                const updatedPostData = posts.map(p =>
                    p._id === post._id
                        ? {
                              ...p,
                              likes: liked
                                  ? p.likes.filter(id => id !== user._id)
                                  : [...p.likes, user._id],
                          }
                        : p
                );

                dispatch(setPosts(updatedPostData));
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update like");
        }
    };

    // 💬 ADD COMMENT
    const commentHandler = async () => {
        try {
            const res = await API.post(
                `/api/v1/post/${post._id}/addcomment`,
                { text }
            );

            if (res.data.success) {
                const updatedComments = [...comment, res.data.comment];
                setComment(updatedComments);

                const updatedPostData = posts.map(p =>
                    p._id === post._id
                        ? { ...p, comments: updatedComments }
                        : p
                );

                dispatch(setPosts(updatedPostData));
                setText("");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to add comment");
        }
    };

    // 🗑 DELETE POST
    const deletePostHandler = async () => {
        try {
            const res = await API.delete(
                `/api/v1/post/${post._id}/postdelete`
            );

            if (res.data.success) {
                const updatedPostData = posts.filter(
                    p => p._id !== post._id
                );
                dispatch(setPosts(updatedPostData));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete post");
        }
    };

    // 🔖 BOOKMARK
    const bookMarkHandler = async () => {
        try {
            const res = await API.get(
                `/api/v1/post/${post._id}/bookmark`
            );
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Bookmark failed");
        }
    };

    return (
        <div className="my-8 w-full max-w-sm mx-auto">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src={post.author?.profilePicture} />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    <div className="flex items-center gap-3">
                        <h1>{post.author?.username}</h1>
                        {user?._id === post.author?._id && (
                            <Badge variant="secondary">Author</Badge>
                        )}
                    </div>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className="cursor-pointer" />
                    </DialogTrigger>

                    <DialogContent className="flex flex-col items-center text-sm">
                        {post.author?._id !== user?._id && (
                            <Button variant="ghost" className="text-[#ED4956]">
                                Unfollow
                            </Button>
                        )}

                        <Button variant="ghost">Add to favorites</Button>

                        {user?._id === post.author?._id && (
                            <Button
                                onClick={deletePostHandler}
                                variant="ghost"
                            >
                                Delete
                            </Button>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <img
                src={post.image}
                alt="post"
                className="rounded-sm my-2 w-full object-cover"
            />

            <div className="flex items-center justify-between px-1 my-2">
                <div className="flex items-center gap-5">
                    {liked ? (
                        <FaHeart
                            onClick={likeOrDislikeHandler}
                            className="text-red-600 cursor-pointer"
                            size={27}
                        />
                    ) : (
                        <FaRegHeart
                            onClick={likeOrDislikeHandler}
                            className="cursor-pointer"
                            size={27}
                        />
                    )}

                    <MessageCircle
                        onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }}
                        className="cursor-pointer w-7 h-7"
                    />

                    <Send className="cursor-pointer w-7 h-7" />
                </div>

                <Bookmark
                    onClick={bookMarkHandler}
                    className="cursor-pointer w-7 h-7"
                />
            </div>

            <span className="font-medium">{postLike} likes</span>

            <p>
                <span className="font-medium mr-2">
                    {post.author?.username}
                </span>
                {post.caption}
            </p>

            {comment.length > 0 && (
                <span
                    onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }}
                    className="text-sm text-gray-400 cursor-pointer"
                >
                    View all {comment.length} comments
                </span>
            )}

            <CommentDialog open={open} setOpen={setOpen} />

            <div className="flex items-center justify-between px-1 my-2">
                <input
                    type="text"
                    placeholder="Add a comment..."
                    value={text}
                    onChange={changeEventHandler}
                    className="outline-none text-sm w-full"
                />
                {text && (
                    <span
                        onClick={commentHandler}
                        className="text-[#3BADF8] cursor-pointer"
                    >
                        Post
                    </span>
                )}
            </div>
        </div>
    );
};

export default Post;
