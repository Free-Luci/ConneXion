import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { readFileAsDataURL } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import API from "../utils/api";

const CreatePost = ({ open, setOpen }) => {
    const imageRef = useRef(null);

    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [loading, setLoading] = useState(false);

    const dispatch = useDispatch();
    const { user } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);

    // 📷 IMAGE SELECT
    const fileChangeHandler = async (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        const dataUrl = await readFileAsDataURL(selectedFile);
        setImagePreview(dataUrl);
    };

    // 📝 CREATE POST
    const createPostHandler = async () => {
        if (!file && !caption.trim()) {
            toast.error("Post cannot be empty");
            return;
        }

        const formData = new FormData();
        formData.append("caption", caption);
        if (file) formData.append("image", file);

        try {
            setLoading(true);
            const res = await API.post(
                "/api/v1/post/newpost",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.data.success) {
                dispatch(setPosts([res.data.post, ...posts]));
                toast.success(res.data.message);

                // reset state
                setCaption("");
                setFile(null);
                setImagePreview("");
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                "Failed to create post"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={() => setOpen(false)}>
                <DialogHeader className="text-center font-semibold">
                    Create New Post
                </DialogHeader>

                <div className="flex gap-3 items-center">
                    <Avatar>
                        <AvatarImage
                            src={user?.profilePicture}
                            alt="profile"
                        />
                        <AvatarFallback>
                            {user?.username?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>

                    <div>
                        <h1 className="font-semibold text-xs">
                            {user?.username}
                        </h1>
                        <span className="text-gray-600 text-xs">
                            {user?.bio}
                        </span>
                    </div>
                </div>

                <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption..."
                    className="focus-visible:ring-transparent border-none"
                />

                {imagePreview && (
                    <div className="w-full h-64 flex items-center justify-center">
                        <img
                            src={imagePreview}
                            alt="preview"
                            className="object-cover h-full w-full rounded-md"
                        />
                    </div>
                )}

                <input
                    ref={imageRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={fileChangeHandler}
                />

                <Button
                    onClick={() => imageRef.current.click()}
                    className="w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]"
                >
                    Select from your device
                </Button>

                {imagePreview && (
                    loading ? (
                        <Button disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                        </Button>
                    ) : (
                        <Button
                            onClick={createPostHandler}
                            className="w-full"
                        >
                            Post
                        </Button>
                    )
                )}
            </DialogContent>
        </Dialog>
    );
};

export default CreatePost;
