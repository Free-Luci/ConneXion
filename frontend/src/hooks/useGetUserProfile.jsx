import { setUserProfile } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import API from "../utils/api";

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();

    useEffect(() => {
        if (!userId) return;

        const fetchUserProfile = async () => {
            try {
                const res = await API.get(
                    `/api/v1/user/${userId}/profile`
                );

                if (res.data.success) {
                    dispatch(setUserProfile(res.data.user));
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserProfile();
    }, [userId, dispatch]);
};

export default useGetUserProfile;
