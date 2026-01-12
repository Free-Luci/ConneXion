import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import API from "../utils/api";

const useGetAllPost = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                const res = await API.get("/api/v1/post/allpost");

                if (res.data.success) {
                    dispatch(setPosts(res.data.posts));
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllPosts();
    }, [dispatch]);
};

export default useGetAllPost;
