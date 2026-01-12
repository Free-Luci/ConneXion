import { setSuggestedUser } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import API from "../utils/api";

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchSuggestedUsers = async () => {
            try {
                const res = await API.get("/api/v1/user/suggested");

                if (res.data.success) {
                    dispatch(setSuggestedUser(res.data.users));
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchSuggestedUsers();
    }, [dispatch]);
};

export default useGetSuggestedUsers;
