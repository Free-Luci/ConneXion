import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setSelectedUser } from "@/redux/authSlice";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircleCode } from "lucide-react";
import Messages from "./Messages";
import { setMessages } from "@/redux/chatSlice";
import API from "@/utils/api";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();

  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { messages, onlineUsers } = useSelector((store) => store.chat);

  // =========================
  // SEND MESSAGE
  // =========================
  const sendMessageHandler = async () => {
    if (!message.trim() || !selectedUser) return;

    try {
      const res = await API.post(
        `/api/v1/message/send/${selectedUser._id}`,
        { message }
      );

      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.newMessage]));

        // 🔥 real-time emit
        if (window.socket) {
          window.socket.emit("sendMessage", {
            receiverId: selectedUser._id,
            message: res.data.newMessage,
          });
        }

        setMessage("");
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // RECEIVE MESSAGE (REAL-TIME)
  // =========================
  useEffect(() => {
    if (!window.socket) return;

    const handleReceiveMessage = (newMessage) => {
      // add message only if it belongs to current chat
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id ||
          newMessage.receiverId === selectedUser._id)
      ) {
        dispatch(setMessages((prev) => [...prev, newMessage]));
      }
    };

    window.socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      window.socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [dispatch, selectedUser]);

  // cleanup selected user on unmount
  useEffect(() => {
    return () => dispatch(setSelectedUser(null));
  }, [dispatch]);

  return (
    <div className="flex ml-[21%] h-screen">
      {/* LEFT USER LIST */}
      <section className="w-full md:w-1/4 my-8">
        <div className="flex pr-12 pl-5">
          <Avatar className="h-14 w-14">
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="font-bold mb-4 px-3 text-xl">
            {user?.username}
          </h1>
        </div>

        <hr className="mb-4 border-gray-300" />

        <div className="overflow-y-auto pl-3 h-[80vh]">
          {suggestedUsers.map((u) => {
            const isOnline = onlineUsers.includes(u._id);
            return (
              <div
                key={u._id}
                onClick={() => dispatch(setSelectedUser(u))}
                className="flex gap-3 items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage src={u.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{u.username}</span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CHAT WINDOW */}
      {selectedUser ? (
        <section className="flex-1 border-l border-gray-300 flex flex-col h-full">
          <div className="flex gap-3 items-center px-3 py-2 border-b">
            <Avatar>
              <AvatarImage src={selectedUser.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <span className="font-medium">{selectedUser.username}</span>
          </div>

          <Messages selectedUser={selectedUser} />

          <div className="flex items-center p-4 border-t">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Message..."
              className="flex-1 mr-2"
              onKeyDown={(e) => e.key === "Enter" && sendMessageHandler()}
            />
            <Button onClick={sendMessageHandler}>Send</Button>
          </div>
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center mx-auto">
          <MessageCircleCode className="w-32 h-32 my-4" />
          <h1 className="font-medium text-xl">Your Messages</h1>
          <span>Send a message to start a chat.</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
