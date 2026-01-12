import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import API from "../utils/api";

const useGetAllMessage = () => {
    const dispatch = useDispatch();
    const { selectedUser } = useSelector(store => store.auth);

    useEffect(() => {
        if (!selectedUser?._id) return;

        const fetchAllMessages = async () => {
            try {
                const res = await API.get(
                    `/api/v1/message/all/${selectedUser._id}`
                );

                if (res.data.success) {
                    dispatch(setMessages(res.data.messages));
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllMessages();
    }, [selectedUser, dispatch]);
};

export default useGetAllMessage;
